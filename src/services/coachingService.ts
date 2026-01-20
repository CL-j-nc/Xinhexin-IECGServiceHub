import { CoachingTip } from '../types';
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

export const generateCoachingTip = async (transcript: string): Promise<CoachingTip | null> => {
  if (!transcript || transcript.length < 5) return null;

  try {
    const prompt = `Current Conversation Context: "${transcript}"\n\nGive me one strategic tip for the agent now. Return JSON with category, content, priority.`;
    const result = await callGemini(prompt);
    const candidate = (result as AIResult)?.candidates?.[0];
    const text = candidate ?? "（模型未返回有效内容）";

    if (text) {
      const data = JSON.parse(text);
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
