import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isSupervisor = message.role === Role.SUPERVISOR;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
          ${isUser ? 'bg-blue-600 text-white' : 
            isSupervisor ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'}`}>
          <i className={`fa-solid ${isUser ? 'fa-user' : isSupervisor ? 'fa-headset' : 'fa-robot'} text-xs`}></i>
        </div>

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : isSupervisor
              ? 'bg-orange-50 border border-orange-200 text-orange-900 rounded-bl-none'
              : isError 
                ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-none'
                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
          }`}>
          {isSupervisor && <div className="text-[10px] text-orange-400 font-bold mb-1">人工客服</div>}
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mb-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

      </div>
    </div>
  );
};

export default React.memo(ChatMessage);