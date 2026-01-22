import {
  Conversation,
  ConversationMessage,
  BusinessDocument,
  ConversationHubData
} from './conversation.types';

const conversationStore: {
  conversations: Conversation[];
  documents: Record<string, BusinessDocument[]>;
} = {
  conversations: [],
  documents: {}
};

export function createConversation(customerId: string): Conversation {
  const conv: Conversation = {
    conversationId: `conv_${Date.now()}`,
    customerId,
    status: 'AI',
    interventions: 0,
    messages: [],
    createdAt: new Date()
  };
  conversationStore.conversations.unshift(conv);
  return conv;
}

export function addMessage(
  conversationId: string,
  message: ConversationMessage
): void {
  const conv = conversationStore.conversations.find(
    c => c.conversationId === conversationId
  );
  if (!conv) return;

  conv.messages.push(message);
  if (message.role === 'AGENT') {
    conv.interventions += 1;
    conv.status = 'HUMAN';
  }
}

export function uploadDocument(
  conversationId: string,
  document: BusinessDocument
): void {
  if (!conversationStore.documents[conversationId]) {
    conversationStore.documents[conversationId] = [];
  }
  conversationStore.documents[conversationId].push(document);
}

export function getHubData(): ConversationHubData {
  const total = conversationStore.conversations.length;
  const interventionTotal = conversationStore.conversations.reduce(
    (sum, c) => sum + c.interventions,
    0
  );

  return {
    activeConversations: conversationStore.conversations,
    monitoring: {
      responseTimeAvg: total === 0 ? 0 : 900,
      interventionRate:
        total === 0
          ? '0%'
          : `${Math.round((interventionTotal / total) * 100)}%`
    }
  };
}

export function isPolicyNoValid(policyNo: string): boolean {
  return /^(65|66)\d+$/.test(policyNo);
}
