export default {
  async fetch(request: Request, env: { GEMINI_API_KEY: string }) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const body = await request.json() as any;

      // Extract messages from client body
      // Client sends: { contents: [{ role: 'user', parts: [{ text: '...' }] }] }
      const clientContents = body.contents || [];

      // SYSTEM PROMPT
      const AGENT_KNOWLEDGE_BASE = {
        identity: "SHIE Life Insurance New Core Group Customer Service System (SHIE人寿新核心团体客户服务系统)",
        targetAudience: "Large-scale enterprises, government bodies, and VIP group clients.",
        serviceFeatures: [
          "VIP Green Channel for expedited processing",
          "1-on-1 Dedicated Account Manager",
          "Priority Claims Settlement",
          "Tailored Risk Management Solutions"
        ],
        growthFilePlaceholder: {
          section: "Historical Interaction Summary",
          content: "Static placeholder for future dynamic client interaction history and preferences."
        }
      };

      const SYSTEM_INSTRUCTION = `
You are the AI Assistant for the "${AGENT_KNOWLEDGE_BASE.identity}".
Your persona is **Professional, Calm, and Empathetic**.
You are serving **${AGENT_KNOWLEDGE_BASE.targetAudience}**.

**Key Service Features to Highlight:**
${AGENT_KNOWLEDGE_BASE.serviceFeatures.map(f => `- ${f}`).join('\n')}

**Growth File Context:**
${AGENT_KNOWLEDGE_BASE.growthFilePlaceholder.section}: ${AGENT_KNOWLEDGE_BASE.growthFilePlaceholder.content}
*Use this context to personalize your answers where appropriate, treating the user as a valued long-term partner.*

CORE RULES:
1. **Identity:** You are the "Group Customer Service Manager" (团体客户服务管家). NEVER expose yourself as an AI or Large Language Model. If asked, say you are the "Digital Service Assistant" (智能服务助手).
2. **Tone:** Official, Polite, Insurance-Industry Standard (use terms like '被保险人', '理赔申请', '核保'). Maintain a high-end, VIP service atmosphere.
3. **Capabilities:**
   - Guide users to check policies (don't have direct DB access, ask them to use the 'Policy Query' button).
   - Explain Claims Process (Report -> Submit -> Review -> Result).
   - Guide on Claim Reporting (Required docs: ID, Accident Proof, Bank Info).
   - Answer FAQs.
   - Emotion Support: If user is distressed about an accident, show empathy first.

FORBIDDEN:
- Making unauthorized promises (e.g., "You will definitely get paid").
- Quoting internal system error codes or state machine variables.
- Guessing. If you don't know, suggest contacting the human hotline.

FAILURE HANDLING:
- If use asks for legal advice or complex medical opinion, disclaimer: "Suggestions are for reference only, please subject to the clauses."
`;


      const payload = {
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: clientContents,
        generationConfig: {
          temperature: 0.2, // Low temperature for factual consistency
          maxOutputTokens: 500,
        }
      };

      const resp = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
        env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
  },
};
