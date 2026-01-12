import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Message, Role } from '../types';
import ChatMessage from './ChatMessage';
import { containsRiskContent, getStaticAnswer } from '../utils/riskControl';
import { sendMessageToGemini } from '../services/geminiService';
import { broadcastMessage, onBroadcastMessage } from '../services/eventBus';

// Performance Optimization: Lazy load the heavy Voice Interface
const VoiceCallInterface = React.lazy(() => import('./VoiceCallInterface'));

const FAQ_QUESTIONS = [
  "我邮箱收到的电子保单是乱码",
  "我在网上查询的电子保单没有盖章",
  "我已经改了保单上的车牌，怎么电子保单上的牌照没有更改?",
  "电子保单下载流程",
  "如何开具电子发票?"
];

const QUICK_ACTIONS = [
  { icon: 'fa-comments', label: '产品咨询', color: 'text-orange-400' },
  { icon: 'fa-file-lines', label: '保单查询', color: 'text-amber-500' },
  { icon: 'fa-hand-holding-heart', label: '办理理赔', color: 'text-orange-500' },
  { icon: 'fa-ticket', label: '更多服务', color: 'text-orange-600' }
];

const TABS = ['平台功能', '车险理赔', '承保问题', '车船税'];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [viewState, setViewState] = useState<'home' | 'chat'>('home');
  const [activeTab, setActiveTab] = useState('平台功能');

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EVENT BUS INTEGRATION ---
  useEffect(() => {
    // Listen for Supervisor Messages (Intervention)
    onBroadcastMessage((msg) => {
      // If the message is from Supervisor, add it to our chat
      if (msg.role === Role.SUPERVISOR) {
        setMessages(prev => [...prev, msg]);
        setIsLoading(false); // Stop AI loading if supervisor intervenes
      }
    });
  }, []);
  // -----------------------------

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (viewState === 'chat' && !isVoiceMode) {
      scrollToBottom();
    }
  }, [messages, isOpen, isVoiceMode, viewState]);

  // Handle sending a message (text input or FAQ click)
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    setViewState('chat');

    // 1. Create User Message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    // BROADCAST: Tell the supervisor dashboard that user spoke
    broadcastMessage(newUserMsg);

    // --- LOGIC FLOW ---

    // 2. Risk Control Check (Local)
    if (containsRiskContent(textToSend)) {
      setTimeout(() => {
        const riskMsg: Message = {
          id: Date.now().toString(),
          role: Role.MODEL,
          content: "抱歉，该问题超出商业保险业务服务范围，我无法为您提供帮助。",
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, riskMsg]);
        broadcastMessage(riskMsg); // Broadcast system/risk response
        setIsLoading(false);
      }, 500);
      return;
    }

    // 3. Static Q&A Check
    const staticAnswer = getStaticAnswer(textToSend);
    if (staticAnswer) {
      setTimeout(() => {
        const staticMsg: Message = {
          id: Date.now().toString(),
          role: Role.MODEL,
          content: staticAnswer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, staticMsg]);
        broadcastMessage(staticMsg); // Broadcast AI response
        setIsLoading(false);
      }, 600);
      return;
    }

    // 4. AI Processing (Gemini)
    try {
      const aiResponseText = await sendMessageToGemini(textToSend);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: aiResponseText,
        timestamp: new Date()
      };

      // Check if loading is still true. If false, it means Supervisor interrupted!
      setIsLoading(prevIsLoading => {
        if (prevIsLoading) {
          setMessages(prev => [...prev, aiMsg]);
          broadcastMessage(aiMsg); // Broadcast AI response
          return false;
        }
        return false;
      });

    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: "系统繁忙，如有紧急需求请联系您的客户经理或在对话框内发送您的联系方式与基本诉求，耐心等待我司工作人员主动联系。",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      broadcastMessage(errorMsg);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFAQClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[375px] h-[700px] max-h-[85vh] bg-gray-50 rounded-[2rem] shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-4 transition-all animate-fade-in-up font-sans">

          {/* Custom Mobile-style Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => {
                if (viewState === 'chat') setViewState('home');
                else setIsOpen(false);
              }} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-full">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <h3 className="font-bold text-lg text-slate-800">空中咨询</h3>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              {!isVoiceMode && <button onClick={() => setIsVoiceMode(true)}><i className="fa-solid fa-headset text-lg"></i></button>}
              <button><i className="fa-solid fa-ellipsis text-lg"></i></button>
            </div>
          </div>

          {/* Content Area */}
          {isVoiceMode ? (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-emerald-500">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i>
                <p className="text-sm">初始化安全语音环境...</p>
              </div>
            }>
              <VoiceCallInterface onHangup={() => setIsVoiceMode(false)} />
            </Suspense>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-gray-100">

              {viewState === 'home' && (
                <>
                  {/* Gradient Hero Section */}
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 pt-6 pb-20 px-6 relative">
                    <div className="flex justify-between items-start">
                      <div className="text-white space-y-1 mt-2">
                        <h2 className="text-xl font-bold">Hi, 您好~</h2>
                        <p className="text-sm opacity-90">我是中国人寿财险智能服务专员</p>
                        <p className="text-sm opacity-90">请问有什么可以为您效劳?</p>
                      </div>
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                        <i className="fa-solid fa-robot text-4xl text-white"></i>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card Content */}
                  <div className="-mt-12 px-3 pb-6 space-y-3 relative z-10">

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-4 gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <div key={action.label} className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors">
                          <div className={`w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center ${action.color}`}>
                            <i className={`fa-solid ${action.icon} text-lg`}></i>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{action.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* FAQ Panel */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                      {/* Tabs */}
                      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                        {TABS.map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm whitespace-nowrap font-medium transition-colors relative
                                                ${activeTab === tab ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}
                                            `}
                          >
                            {tab}
                            {activeTab === tab && (
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-500 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Question List */}
                      <div className="p-2 flex-1">
                        {FAQ_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleFAQClick(q)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex justify-between items-center group transition-colors border-b border-gray-50 last:border-0"
                          >
                            <span className="line-clamp-1">{q}</span>
                            <i className="fa-solid fa-chevron-right text-gray-300 text-xs group-hover:text-emerald-500"></i>
                          </button>
                        ))}
                      </div>

                      {/* Refresh Button */}
                      <div className="py-3 border-t border-gray-50 text-center">
                        <button className="text-emerald-500 text-sm flex items-center justify-center gap-1 mx-auto hover:text-emerald-600 transition-colors">
                          <i className="fa-solid fa-rotate text-xs"></i> 换一换
                        </button>
                      </div>
                    </div>

                  </div>
                </>
              )}

              {viewState === 'chat' && (
                <div className="p-4 pb-20 min-h-full">
                  {/* Default Welcomer if empty */}
                  {messages.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                      <p className="text-sm">开始与智能助手对话...</p>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}

                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <i className="fa-solid fa-robot text-xs"></i>
                        </div>
                        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

            </div>
          )}

          {/* Bottom Input Area */}
          {!isVoiceMode && (
            <div className="p-3 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <i className="fa-regular fa-face-smile text-xl"></i>
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full bg-gray-100 text-gray-800 rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
                    placeholder="请输入您要咨询的问题"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-1.5 bg-emerald-200 text-emerald-800 rounded-lg text-sm font-medium hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  发送
                </button>

                <button className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-circle-plus text-xl"></i>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group border-2 border-white/20"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></span>
          <i className="fa-solid fa-comment-dots text-3xl group-hover:animate-pulse"></i>
        </button>
      )}

    </div>
  );
};

export default ChatWidget;