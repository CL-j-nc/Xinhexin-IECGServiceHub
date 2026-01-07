import { GoogleGenAI, Type } from "@google/genai";
import { CoachingTip } from '../types';
import { generateSystemInstruction } from './policyEngine';

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is missing");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }

  return ai;
};

const COACH_ROLE_CONTEXT = `
You are a "Shadow Negotiator" and "Crisis Management Expert" for China Life-JHPCIC.
Your user is a Human Supervisor handling a difficult Corporate Fleet Client on a voice call.

YOUR TASK:
Analyze the transcript and provide a JSON tip to help the Supervisor.

CRITICAL:
The Supervisor MUST adhere to the CLJHBA AI SYSTEM POLICY.
If the client asks about 95519, you MUST advise the Supervisor to use the "Mandatory Responses" defined in the policy (Structural Boundary, Not Technical Error).
Do not let the Supervisor violate the policy.
`;

export const generateCoachingTip = async (transcript: string): Promise<CoachingTip | null> => {
  if (!transcript || transcript.length < 5) return null;

  // GENERATE INSTRUCTION FROM JSON POLICY
  const fullSystemInstruction = generateSystemInstruction(COACH_ROLE_CONTEXT);

  try {
    const client = getAiClient();

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current Conversation Context: "${transcript}"\n\nGive me one strategic tip for the agent now.`,
      config: {
        systemInstruction: fullSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['TRUST', 'RISK', 'TACTIC', 'INFO'] },
            content: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['HIGH', 'NORMAL'] }
          },
          required: ['category', 'content', 'priority']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: Date.now().toString(),
        ...data
      };
    }
    return null;
  } catch (e) {
    console.error("Coaching generation failed", e);
    return null;
  }
};
