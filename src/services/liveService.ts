import type { GeminiResponse } from './gemini.types';

interface AIResult {
  candidates?: string[];
}

export const sendLiveMessage = async (userInput: string): Promise<string> => {
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

  const result = (await response.json()) as GeminiResponse;
  const candidate = (result as AIResult)?.candidates?.[0];
  const text = candidate ?? "（模型未返回有效内容）";
  return text;
};
