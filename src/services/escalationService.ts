import { ConversationMessage } from './conversation.types';

export const escalateToHumanAgent = async (
  conversationId: string,
  clientId: string,
  latestUserMessage: string,
  reason: string,
  chatHistory: ConversationMessage[]
) => {
  const now = new Date();
  const notificationMessage = `
⚠️ 需要人工处理
━━━━━━━━━━━━
👤 客户ID：${clientId}
📋 类型：${reason}
💬 内容：${latestUserMessage}
⏰ 时间：${now.toLocaleString()}
━━━━━━━━━━━━
请及时处理
`;

  // TODO: 对接 Supervisor Worker API 发送通知给 Jay
  // 例如：await fetch('/api/supervisor/escalate', { method: 'POST', body: JSON.stringify(...) });
  console.log("模拟发送工单通知给Jay:", notificationMessage);

  return { success: true, message: "转接请求已提交" };
};
