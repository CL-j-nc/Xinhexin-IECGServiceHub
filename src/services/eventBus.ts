import { ConversationMessage, MessageRole } from './conversation.types';

// BroadcastChannel allows communication between different tabs/windows of the same origin.
const channel = new BroadcastChannel('cljhba_channel');

type Listener = {
  callback: (msg: ConversationMessage) => void;
  conversationId?: string;
};

const listeners: Listener[] = [];

type EventType = 'NEW_MESSAGE' | 'AGENT_INTERVENTION';

interface Payload {
  type: EventType;
  data: ConversationMessage;
}

export const broadcastMessage = (message: ConversationMessage) => {
  const payload: Payload = {
    type: message.role === MessageRole.AGENT ? 'AGENT_INTERVENTION' : 'NEW_MESSAGE',
    data: message
  };
  channel.postMessage(payload);
};

channel.onmessage = (event) => {
  const payload = event.data as Payload;
  if (!payload || !payload.data) return;

  const msg: ConversationMessage = {
    ...payload.data,
    timestamp: new Date(payload.data.timestamp)
  };

  listeners.forEach((listener) => {
    if (listener.conversationId && msg.conversationId !== listener.conversationId) {
      return;
    }
    listener.callback(msg);
  });
};

export const onBroadcastMessage = (
  callback: (msg: ConversationMessage) => void,
  conversationId?: string
) => {
  const listener: Listener = { callback, conversationId };
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };
};

export const closeChannel = () => {
  channel.close();
};
