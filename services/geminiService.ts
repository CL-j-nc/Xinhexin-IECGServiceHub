import { GoogleGenAI, FunctionDeclaration, Type, Chat, Tool } from "@google/genai";
import { generateSystemInstruction } from './policyEngine';
import { queryPolicyDatabase } from './mockDatabase';
import { Role, PolicyData } from '../types';

// Define the tool definition
const lookupPolicyTool: FunctionDeclaration = {
  name: 'lookup_policy',
  description: 'Retrieve commercial fleet policy details by policy ID (e.g., POL-8888). Returns status, company name, and fleet count.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      policyId: {
        type: Type.STRING,
        description: 'The policy ID string, usually starting with POL-',
      },
    },
    required: ['policyId'],
  },
};

// Tool Wrapper
const tools: Tool[] = [{ functionDeclarations: [lookupPolicyTool] }];

let ai: GoogleGenAI | null = null;

let chatSession: Chat | null = null;

const getAiClient = () => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is missing");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }

  return ai;
};

// Base Role for the Chat Bot - CHINESE CONTEXT
const CHAT_ROLE_CONTEXT = `
你的身份是“中国人寿财险 - JHPCIC 新核心大宗团体客户业务服务系统”的 AI 智能助手。
你的任务是为企业车队管理人员回答问题。
语言：中文（简体）。
语气：专业、简洁、官方。
`;

export const initChatSession = () => {
  const client = getAiClient();
  // GENERATE INSTRUCTION FROM JSON POLICY
  const fullSystemInstruction = generateSystemInstruction(CHAT_ROLE_CONTEXT);

  chatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: fullSystemInstruction,
      tools: tools,
      temperature: 0.3, // Lower temperature for strict compliance
    },
  });
};

export const sendMessageToGemini = async (userMessage: string): Promise<string> => {
  if (!chatSession) {
    initChatSession();
  }

  try {
    getAiClient();

    if (!chatSession) throw new Error("Chat session failed to initialize");

    // 1. Send message to model
    let response = await chatSession.sendMessage({ message: userMessage });
    
    // 2. Check for Function Calls (Policy Lookup)
    const candidates = response.candidates;
    const candidate = candidates?.[0];
    const parts = candidate?.content?.parts;
    if (!candidate || !parts || parts.length === 0) {
      const fallbackText = response.text ?? "（模型未返回有效内容）";
      return fallbackText;
    }

    // Iterate through parts to find function calls
    for (const part of parts) {
      if (part.functionCall) {
        const fc = part.functionCall;
        
        if (fc.name === 'lookup_policy') {
            const args = fc.args as any;
            const policyId = args?.policyId;
            
            // Execute Mock DB Logic
            const result = await queryPolicyDatabase(policyId);
            
            // Send Tool Response back to Gemini
            const functionResponse = {
              result: result 
                ? result 
                : { error: "未找到该大宗商业保单信息，请检查保单号。" }
            };

            // Send the result back to the model
            response = await chatSession.sendMessage({
                message: [{
                    functionResponse: {
                        id: fc.id,
                        name: fc.name,
                        response: functionResponse
                    }
                }]
            });
        }
      }
    }

    // 3. Extract final text with defensive fallback
    const text = candidate?.content?.parts?.[0]?.text ?? response.text ?? "（模型未返回有效内容）";
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "当前咨询人数较多，系统繁忙，请稍后再试。";
  }
};

/**
 * Parses a PDF document (Base64) to extract Policy Data.
 */
export const extractPolicyFromPdf = async (base64Pdf: string): Promise<Partial<PolicyData> | null> => {
    try {
        const client = getAiClient();

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash', // Use Flash for efficient document processing
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: base64Pdf
                        }
                    },
                    {
                        text: "请分析这份保险单文档，提取关键信息并按照 JSON 格式返回。如果找不到某些字段，请留空。日期格式必须为 YYYY-MM-DD。注意：'amount' 是保额，可能是具体的数字或'足额投保'等描述。"
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "保单号, starts with POL-" },
                        companyName: { type: Type.STRING, description: "被保险人/承保单位名称" },
                        holder: { type: Type.STRING, description: "投保人或管理人姓名" },
                        expiryDate: { type: Type.STRING, description: "保险止期 YYYY-MM-DD" },
                        type: { type: Type.STRING, description: "险种方案名称" },
                        vehicleCount: { type: Type.NUMBER, description: "车辆数量/车队规模" },
                        coverages: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    amount: { type: Type.STRING },
                                    premium: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text ?? response.text;

        if (text) {
            return JSON.parse(text) as Partial<PolicyData>;
        }
        return null;
    } catch (e) {
        console.error("PDF Extraction Failed:", e);
        return null;
    }
};
