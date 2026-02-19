import { sessions_send } from '@openclaw/tooling'; // Assuming sessions_send is available via tooling
import { ConversationMessage } from './conversation.types';

export const escalateToHumanAgent = async (
  conversationId: string,
  clientId: string,
  latestUserMessage: string,
  reason: string,
  chatHistory: ConversationMessage[] // 可选，用于提供完整上下文
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

  // 模拟发送给 Jay 的通知
  // 在实际部署中，这里应该调用 Supervisor Worker 的 API
  // Supervisor Worker 再调用 OpenClaw 的 message 工具向 Jay 的 Telegram 发送
  // 为了快速验证，这里直接通过 sessions_send 发送给Jay (假设Jay的sessionKey已知)
  console.log("模拟发送工单通知给Jay:", notificationMessage);

  try {
    // 假设 Jay 的 sessionKey 可以通过某种方式获取，或者硬编码用于测试
    // 实际应用中，不应该硬编码 sessionKey
    // 这里为了快速验证，使用一个占位符，OpenClaw Agent会将此消息发送给当前的User (Jay)
    await default_api.sessions_send({
        agentId: 'Jay', // 或者使用 Jay 的实际 agentId
        message: notificationMessage,
        label: 'main' // 发送给主会话
    });
    console.log("工单通知已发送给Jay");
  } catch (error) {
    console.error("发送工单通知失败:", error);
  }

  // 实际的后端工单创建和持久化逻辑将在这里实现
  // 例如：await fetch('/api/supervisor/escalate', { method: 'POST', body: JSON.stringify(...) });

  return { success: true, message: "转接请求已提交" };
};
