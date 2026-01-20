import { ConversationSession, ConversationMessage } from './conversation.types';

/**
 * In-memory mock conversation store.
 * Later can be replaced by D1 / KV / WebSocket backend.
 */
const conversationStore: Record<string, ConversationSession> = {};

/**
 * Create a new conversation session
 */
export function createConversation(sessionId: string): ConversationSession {
  const session: ConversationSession = {
    sessionId,
    createdAt: Date.now(),
    messages: [],
    status: 'ACTIVE',
  };
  conversationStore[sessionId] = session;
  return session;
}

/**
 * Append a message to a conversation
 */
export function appendMessage(
  sessionId: string,
  message: ConversationMessage
): ConversationSession | null {
  const session = conversationStore[sessionId];
  if (!session) return null;
  session.messages.push(message);
  return session;
}

/**
 * Get a conversation session
 */
export function getConversation(sessionId: string): ConversationSession | null {
  return conversationStore[sessionId] || null;
}

/**
 * List all active conversations (for staff view)
 */
export function listConversations(): ConversationSession[] {
  return Object.values(conversationStore);
}