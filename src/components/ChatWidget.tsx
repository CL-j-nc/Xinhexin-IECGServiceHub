import React, { useState, useEffect, useRef, Suspense } from 'react';
import ChatMessage from './ChatMessage';
import { containsRiskContent, getStaticAnswer } from '../utils/riskControl';
import { sendMessageToGemini } from '../services/geminiService';
import { broadcastMessage, onBroadcastMessage } from '../services/eventBus';
import { addMessage, createConversation } from '../services/conversationService'; // 新增导入，支持会话生成
import { ConversationMessage, MessageRole } from '../services/conversation.types';

// Performance Optimization: Lazy load the heavy Voice Interface
const VoiceCallInterface = React.lazy(() => import('./VoiceCallInterface'));

const FAQ_QUESTIONS = [
  "我邮箱收到的电子保单是乱码",
  "我在网上查询的电子保单没有盖章",
  "我已经改了保单上的车牌，怎么电子保单上的牌照没有更改?",
  "如何查询保单的缴费状态？"

];

const QUICK_ACTIONS = [
  { icon: 'fa-comments', label: '产品咨询', color: 'text-orange-400' },
  { icon: 'fa-file-lines', label: '保单查询', color: 'text-amber-500' },
  { icon: 'fa-hand-holding-heart', label: '办理理赔', color: 'text-orange-500' },
  { icon: 'fa-ticket', label: '更多服务', color: 'text-orange-600' }
];

const TABS = ['平台功能', '车险理赔', '承保问题', '企业投保附加险'];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [viewState, setViewState] = useState<'Home' | 'chat'>('Home');
  const [activeTab, setActiveTab] = useState('平台功能');

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 插入位置：状态声明区，支持会话 ID
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // --- EVENT BUS INTEGRATION ---
  useEffect(() => {
    // Listen for Supervisor Messages (Intervention)
    const unsubscribe = onBroadcastMessage((msg) => {
      if (conversationIdRef.current && msg.conversationId !== conversationIdRef.current) {
        return;
      }
      if (msg.role === MessageRole.AGENT) {
        setMessages(prev => [...prev, msg]);
        addMessage(msg.conversationId, msg);
        setIsLoading(false); // Stop AI loading if supervisor intervenes
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);
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

    // 插入位置：函数体开头，会话初始化
    if (!conversationId) {
      const newConv = createConversation('client-uuid'); // 模拟 clientId，实际可从用户上下文获取
      setConversationId(newConv.conversationId);
      conversationIdRef.current = newConv.conversationId;
    }

    // 1. Create User Message（扩展包含 conversationId）
    const resolvedConversationId = conversationIdRef.current || conversationId;
    if (!resolvedConversationId) return;

    const newUserMsg: ConversationMessage = {
      id: Date.now().toString(),
      conversationId: resolvedConversationId,
      role: MessageRole.CLIENT,
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    addMessage(resolvedConversationId, newUserMsg);
    setInput('');
    setIsLoading(true);

    // BROADCAST: Tell the supervisor dashboard that user spoke（扩展支持 conversationId）
    broadcastMessage(newUserMsg);

    // --- LOGIC FLOW ---

    // 2. Risk Control Check (Local)
    if (containsRiskContent(textToSend)) {
      setTimeout(() => {
        const riskMsg: ConversationMessage = {
          id: Date.now().toString(),
          conversationId: resolvedConversationId,
          role: MessageRole.AI,
          content: "抱歉，该问题超出商业保险业务服务范围，我无法为您提供帮助。",
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, riskMsg]);
        addMessage(resolvedConversationId, riskMsg);
        broadcastMessage(riskMsg); // Broadcast system/risk response
        setIsLoading(false);
      }, 500);
      return;
    }

    // 3. Static Q&A Check
    const staticAnswer = getStaticAnswer(textToSend);
    if (staticAnswer) {
      setTimeout(() => {
        const staticMsg: ConversationMessage = {
          id: Date.now().toString(),
          conversationId: resolvedConversationId,
          role: MessageRole.AI,
          content: staticAnswer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, staticMsg]);
        addMessage(resolvedConversationId, staticMsg);
        broadcastMessage(staticMsg); // Broadcast AI response
        setIsLoading(false);
      }, 600);
      return;
    }

    // 4. AI Processing (Gemini)
    try {
      const aiResponseText = await sendMessageToGemini(textToSend);

      const aiMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: resolvedConversationId,
        role: MessageRole.AI,
        content: aiResponseText,
        timestamp: new Date()
      };

      // Check if loading is still true. If false, it means Supervisor interrupted!
      setIsLoading(prevIsLoading => {
        if (prevIsLoading) {
          setMessages(prev => [...prev, aiMsg]);
          addMessage(resolvedConversationId, aiMsg);
          broadcastMessage(aiMsg); // Broadcast AI response
          return false;
        }
        return false;
      });

    } catch (err) {
      const errorMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: resolvedConversationId,
        role: MessageRole.AI,
        content: "系统繁忙，如有紧急需求请联系您的客户经理或在对话框内发送您的联系方式与基本诉求，耐心等待我司工作人员主动联系。",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      addMessage(resolvedConversationId, errorMsg);
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
        <div className="w-[375px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">

          {/* Header */}
          <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <i className="fa-solid fa-robot text-xs"></i>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-800">企业保险管家</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] text-emerald-500">在线</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsVoiceMode(!isVoiceMode)} className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className={`fa-solid ${isVoiceMode ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
              </button>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          {isVoiceMode ? (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-500">语音接口加载中...</div>}>
              <VoiceCallInterface onHangup={() => setIsVoiceMode(false)} />
            </Suspense>
          ) : (
            <>
              {viewState === 'home' && (
                <div className="p-4 pb-20 flex-1 overflow-y-auto space-y-6">
                  {/* Greeting */}
                  <div className="text-center py-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">您好！</h2>
                    <p className="text-sm text-gray-500">我是您的24小时在线企业保险管家，请随时告诉我您的疑问。</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {QUICK_ACTIONS.map((action, i) => (
                      <button key={i} className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow flex flex-col items-center justify-center gap-2 group">
                        <i className={`fa-solid ${action.icon} text-xl ${action.color} group-hover:scale-110 transition-transform`}></i>
                        <span className="text-xs text-gray-600 font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hidden">
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* FAQ List */}
                  <div className="space-y-1">
                    {FAQ_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
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
              )}

              {viewState === 'chat' && (
                <div className="p-4 pb-20 min-h-full flex-1 overflow-y-auto">
                  {/* Default Welcomer if empty */}
                  {messages.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                      <p className="text-sm">开始与企业保险管家对话...</p>
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
            </>
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
