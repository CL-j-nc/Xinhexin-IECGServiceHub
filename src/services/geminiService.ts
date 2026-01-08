import { PolicyData } from '../types';

const callGemini = async (userInput: string) => {
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

  return response.json();
};

export const sendMessageToGemini = async (userMessage: string): Promise<string> => {
  try {
    const result = await callGemini(userMessage);
    const candidate = result?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text ?? "（模型未返回有效内容）";
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "当前咨询人数较多，系统繁忙，请稍后再试。";
  }
};

export const extractPolicyFromPdf = async (base64Pdf: string): Promise<Partial<PolicyData> | null> => {
  try {
    const result = await callGemini(`请解析这份PDF（Base64）并返回关键保单字段（JSON）：${base64Pdf}`);
    const candidate = result?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (text) {
      return JSON.parse(text) as Partial<PolicyData>;
    }
    return null;
  } catch (e) {
    console.error("PDF Extraction Failed:", e);
    return null;
  }
};
