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

  const result = await response.json();
  const candidate = result?.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text ?? "（模型未返回有效内容）";
  return text;
};
