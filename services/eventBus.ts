import { Message } from '../types';

// BroadcastChannel allows communication between different tabs/windows of the same origin.
// This simulates a WebSocket connection for this serverless demo.
const channel = new BroadcastChannel('cljhba_channel');

type EventType = 'NEW_MESSAGE' | 'SUPERVISOR_INTERVENTION';

interface Payload {
  type: EventType;
  data: Message;
}

export const broadcastMessage = (message: Message) => {
  const payload: Payload = {
    type: message.role === 'supervisor' ? 'SUPERVISOR_INTERVENTION' : 'NEW_MESSAGE',
    data: message
  };
  channel.postMessage(payload);
};

export const onBroadcastMessage = (callback: (msg: Message) => void) => {
  channel.onmessage = (event) => {
    const payload = event.data as Payload;
    if (payload && payload.data) {
      // Rehydrate Date object because JSON serialization turns it into a string
      payload.data.timestamp = new Date(payload.data.timestamp);
      callback(payload.data);
    }
  };
};

export const closeChannel = () => {
  channel.close();
};