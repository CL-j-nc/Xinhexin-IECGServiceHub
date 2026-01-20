import {
  BusinessDocument,
  Conversation,
  ConversationHubData,
  ConversationMessage,
  ConversationStatus,
  MessageRole,
  MonitoringMetrics
} from './conversation.types';

const conversations: Conversation[] = [];
let monitoring: MonitoringMetrics = {
  responseTimeAvg: 0,
  interventionRate: 0,
  riskFlags: 0
};

const updateMonitoring = () => {
  const total = conversations.length;
  if (!total) {
    monitoring = { responseTimeAvg: 0, interventionRate: 0, riskFlags: 0 };
    return;
  }

  const interventions = conversations.reduce((sum, conv) => sum + conv.interventions, 0);
  monitoring = {
    responseTimeAvg: 1200,
    interventionRate: Number((interventions / total).toFixed(2)),
    riskFlags: 0
  };
};

const buildConversation = (conversationId: string, clientId: string): Conversation => ({
  conversationId,
  clientId,
  status: ConversationStatus.AI_ONLY,
  startTime: new Date(),
  messages: [],
  aiDrafts: [],
  documents: [],
  aiResponses: [],
  interventions: 0
});

export const createConversation = (clientId: string): Conversation => {
  const conversationId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const conversation = buildConversation(conversationId, clientId);
  conversations.unshift(conversation);
  updateMonitoring();
  return conversation;
};

const getConversation = (conversationId: string) => {
  let conversation = conversations.find(conv => conv.conversationId === conversationId);
  if (!conversation) {
    conversation = buildConversation(conversationId, 'unknown');
    conversations.unshift(conversation);
  }
  return conversation;
};

export const addMessage = (conversationId: string, message: ConversationMessage) => {
  const conversation = getConversation(conversationId);
  conversation.messages.push(message);

  if (message.role === MessageRole.AGENT) {
    conversation.status = ConversationStatus.HUMAN_INTERVENED;
    conversation.interventions += 1;
  }

  if (message.role === MessageRole.AI) {
    conversation.aiResponses.push(message.content);
  }

  updateMonitoring();
};

export const uploadDocument = (conversationId: string, doc: BusinessDocument) => {
  const conversation = getConversation(conversationId);
  conversation.documents.push(doc);
  updateMonitoring();
};

export const getHubData = (): ConversationHubData => ({
  activeConversations: conversations,
  monitoring
});
