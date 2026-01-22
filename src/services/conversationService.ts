import {
  Conversation,
  ConversationMessage,
  BusinessDocument,
  ConversationHubData
} from './conversation.types.ts';

const conversationStore: {
  conversations: Conversation[];
  documents: Record<string, BusinessDocument[]>;
} = {
  conversations: [],
  documents: {}
};

export function createConversation(customerId: string): Conversation {
  const conv: Conversation = {
    conversationId: 'conv_' + Date.now(),
    clientId: customerId,
    status: 'AI',
    interventions: 0,
    messages: [],
    startTime: new Date(),
    aiDrafts: [],
    documents: [],
    aiResponses: []
  };
  conversationStore.conversations.unshift(conv);
  return conv;
}

export function addMessage(
  conversationId: string,
  message: ConversationMessage
): void {
  const conv = conversationStore.conversations.find(
    (c) => c.conversationId === conversationId
  );
  if (!conv) {
    return;
  }

  conv.messages.push(message);

  if (message.role === 'AGENT') {
    conv.interventions = conv.interventions + 1;
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
  const conversations = conversationStore.conversations;
  const total = conversations.length;

  let interventionTotal = 0;
  for (const c of conversations) {
    interventionTotal += c.interventions;
  }

  return {
    activeConversations: conversations,
    monitoring: {
      responseTimeAvg: total === 0 ? 0 : 900,
      interventionRate: total === 0
        ? '0%'
        : Math.round((interventionTotal / total) * 100) + '%',
      riskFlags: 0
    }
  };
}

export function isPolicyNoValid(policyNo: string): boolean {
  return /^(65|66)\d+$/.test(policyNo);
}
