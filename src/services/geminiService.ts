import { PolicyData } from '../types';
import type { GeminiResponse } from './gemini.types';

interface AIResult {
  candidates?: string[];
}

const callGemini = async (userInput: string): Promise<GeminiResponse> => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userInput }],
        },
      ],
    }),
  });

  return response.json() as Promise<GeminiResponse>;
};

export const sendMessageToGemini = async (userMessage: string): Promise<string> => {
  try {
    const result = await callGemini(userMessage);
    const candidate = (result as AIResult)?.candidates?.[0];
    const text = candidate ?? "（模型未返回有效内容）";
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "当前咨询人数较多，系统繁忙，请稍后再试。";
  }
};

export const extractPolicyFromPdf = async (base64Pdf: string): Promise<Partial<PolicyData> | null> => {
  try {
    const result = await callGemini(`请解析这份PDF（Base64）并返回关键保单字段（JSON）：${base64Pdf}`);
    const candidate = (result as AIResult)?.candidates?.[0];
    const text = candidate;

    if (text) {
      return JSON.parse(text) as Partial<PolicyData>;
    }
    return null;
  } catch (e) {
    console.error("PDF Extraction Failed:", e);
    return null;
  }
};
