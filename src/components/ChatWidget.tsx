import React, { useState, useEffect, useRef, Suspense } from 'react';
import ChatMessage from './ChatMessage';
import { containsRiskContent, getStaticAnswer } from '../utils/riskControl';
import { sendMessageToGemini } from '../services/geminiService';
import { broadcastMessage, onBroadcastMessage } from '../services/eventBus';
import { addMessage, createConversation } from '../services/conversationService';
import { escalateToHumanAgent } from '../services/escalationService'; // 导入转接服务
import { ConversationMessage, MessageRole } from '../services/conversation.types';
import { fetchPolicyLifecycle, isPolicyFormatValid } from '../services/policyEngine';
import { PolicyLifecycleData } from '../services/policyEngine.types';
import { STATIC_QA } from '../constants'; // <-- 导入 STATIC_QA
import { FAQ_CONFIG } from '../constants/faq.config';

// Performance Optimization: Lazy load the heavy Voice Interface
const VoiceCallInterface = React.lazy(() => import('./VoiceCallInterface'));

const QUICK_ACTIONS = [
  { icon: 'fa-comments', label: '产品咨询', color: 'text-orange-400' },
  { icon: 'fa-file-lines', label: '保单查询', color: 'text-amber-500' },
  { icon: 'fa-hand-holding-heart', label: '办理理赔', color: 'text-orange-500' },
  { icon: 'fa-ticket', label: '更多服务', color: 'text-orange-600' }
];

const TABS = ['平台功能', '车险理赔', '承保问题', '企业投保附加险'];

interface ChatWidgetProps {
  mode?: 'widget' | 'embedded';
  initialOpen?: boolean;
  containerClassName?: string;
}

const POLICY_NO_PATTERN = /\b(65|66)\d{3,}\b/;

const ChatWidget: React.FC<ChatWidgetProps> = ({ mode = 'widget', initialOpen = false, containerClassName }) => {
  const isEmbedded = mode === 'embedded';
  const [isOpen, setIsOpen] = useState(isEmbedded || initialOpen);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [viewState, setViewState] = useState<'Home' | 'chat'>('Home');
  const [activeTab, setActiveTab] = useState('平台功能');

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false); // 新增状态：客服是否正在输入
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false); // 新增：语音通话是否激活
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onBroadcastMessage((msg) => {
      if (conversationIdRef.current && msg.conversationId !== conversationIdRef.current) {
        return;
      }
      if (msg.role === MessageRole.AGENT) {
        setMessages(prev => [...prev, msg]);
        addMessage(msg.conversationId, msg);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (viewState === 'chat' && !isVoiceMode) {
      scrollToBottom();
    }
  }, [messages, isOpen, isVoiceMode, viewState]);

  const formatPolicySummary = (data: PolicyLifecycleData) => {
    if (!data.policy) {
      const fallbackLines = [
        `状态：${data.statusText}`,
        data.statusDescription
      ];
      if (data.notice) fallbackLines.push(`提示：${data.notice}`);
      return fallbackLines.join('\n');
    }

    const { policy } = data;
    const lines = [
      `保单号：${policy.policyNo}`,
      `状态：${data.statusText}`,
      `投保单位：${policy.holderName}`,
      `产品名称：${policy.productName}`,
      `保险期间：${policy.startDate} 至 ${policy.endDate}`,
      `保费：${policy.premium}`,
      `保额：${policy.sumInsured}`
    ];

    if (data.notice) {
      lines.push(`提示：${data.notice}`);
    }

    return lines.join('\n');
  };

  const pushAiMessage = (conversationId: string, content: string, isError = false) => {
    const aiMsg: ConversationMessage = {
      id: Date.now().toString(),
      conversationId,
      role: MessageRole.AI,
      content,
      timestamp: new Date(),
      isError
    };
    setMessages(prev => [...prev, aiMsg]);
    addMessage(conversationId, aiMsg);
    broadcastMessage(aiMsg);
    setIsLoading(false);
  };

  const handlePolicyLookup = async (policyNo: string, conversationId: string) => {
    if (!isPolicyFormatValid(policyNo)) {
      pushAiMessage(conversationId, '保单号格式错误，请提供 65/66 开头的团体保单号。', true);
      return;
    }

    try {
      const data = await fetchPolicyLifecycle(policyNo);
      const summary = formatPolicySummary(data);
      pushAiMessage(conversationId, summary);
    } catch (err) {
      pushAiMessage(conversationId, '未查询到保单或接口不可用，请稍后再试。', true);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    setViewState('chat');

    if (!conversationId) {
      const newConv = createConversation('client-uuid');
      setConversationId(newConv.conversationId);
      conversationIdRef.current = newConv.conversationId;
    }

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
    setIsAgentTyping(true); // 客户发送消息后，显示客服正在输入

    broadcastMessage(newUserMsg);

    // --- 检查是否需要转人工客服 ---
    const lowerTextToSend = textToSend.toLowerCase();
    const needsHumanIntervention = lowerTextToSend.includes('转人工') || lowerTextToSend.includes('人工客服') || lowerTextToSend.includes('联系客服');

    if (needsHumanIntervention) {
      pushAiMessage(resolvedConversationId, '好的，我已收到您的请求。正在为您转接人工客服，请您在此期间保持在线。');
      setIsLoading(false);
      setIsAgentTyping(false); // 转人工，停止显示正在输入
      // 调用后端转接服务
      await escalateToHumanAgent(
        resolvedConversationId,
        'client-uuid-placeholder', // 真实的客户ID需要从上下文获取
        textToSend,
        '用户主动请求转人工',
        messages // 传递当前消息历史
      );
      return; // 阻止后续处理
    }
    // --- 转人工客服逻辑结束 ---

    const policyMatch = textToSend.match(POLICY_NO_PATTERN)?.[0];
    if (policyMatch) {
      await handlePolicyLookup(policyMatch, resolvedConversationId);
      setIsAgentTyping(false); // 回复后停止显示正在输入
      return;
    }

    if (/保单/.test(textToSend) && /(查询|查|核验)/.test(textToSend)) {
      pushAiMessage(resolvedConversationId, '请提供 65/66 开头的团体保单号，我将为您核验保单状态。');
      setIsAgentTyping(false); // 回复后停止显示正在输入
      return;
    }

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
        broadcastMessage(riskMsg);
        setIsLoading(false);
        setIsAgentTyping(false); // 回复后停止显示正在输入
      }, 500);
      return;
    }

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
        broadcastMessage(staticMsg);
        setIsLoading(false);
        setIsAgentTyping(false); // 回复后停止显示正在输入
      }, 600);
      return;
    }

    // --- 新增逻辑：处理未匹配静态回复的问题 ---
    // 如果没有静态回复，并且不是保单查询/一般保单业务，也不是风险内容（这些已在前面处理）
    // 则提供更友好的引导信息。
    if (!policyMatch && !(/保单/.test(textToSend) && /(查询|查|核验)/.test(textToSend))) {
        pushAiMessage(resolvedConversationId, '抱歉，我暂时无法直接回答您的问题。您可以尝试换种方式提问，或者说明需要咨询的具体业务（例如：保单变更、理赔申请）。如果问题紧急，请告知我，我可以尝试为您转接人工客服。');
        setIsLoading(false);
        setIsAgentTyping(false); // 回复后停止显示正在输入
        return;
    }
    // --- 新增逻辑结束 ---

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

      setIsLoading(prevIsLoading => {
        if (prevIsLoading) {
          setMessages(prev => [...prev, aiMsg]);
          addMessage(resolvedConversationId, aiMsg);
          broadcastMessage(aiMsg);
          setIsAgentTyping(false); // 回复后停止显示正在输入
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
      setIsAgentTyping(false); // 发生错误也停止显示正在输入
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

  const sendSignalingMessage = (type: string, payload: any) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload, conversationId: conversationIdRef.current });
      websocketRef.current.send(message);
    } else {
      console.warn('WebSocket is not open. Cannot send signaling message.');
    }
  };

  // WebRTC 相关状态和对象
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null); // 用于播放远程音频
  const websocketRef = useRef<WebSocket | null>(null);

  // 确保在组件卸载时清理 WebRTC 资源
  useEffect(() => {
    return () => {
      hangupVoiceCall(); // 清理通话
      websocketRef.current?.close(); // 关闭 WebSocket 连接
    };
  }, []);

  const startVoiceCall = async () => {
    if (isVoiceCallActive) return;

    console.log('[WebRTC] 正在发起语音通话...');
    try {
      // 1. 获取本地音流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsVoiceCallActive(true);

      // 2. 创建 RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // 使用公共STUN服务器
      });
      peerConnectionRef.current = pc;

      // 3. 将本地音流添加到 RTCPeerConnection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // 4. 处理 ICE 候选
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTC] 发送 ICE Candidate:', event.candidate);
          sendSignalingMessage('ice-candidate', event.candidate);
        }
      };

      // 5. 处理远程媒体流
      pc.ontrack = (event) => {
        console.log('[WebRTC] 收到远程媒体流', event.streams[0]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // 6. 处理连接状态变化
      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] 连接状态:', pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          console.log('[WebRTC] 连接断开或失败，自动挂断。');
          hangupVoiceCall();
        }
      };

      // 7. 创建并发送 Offer (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] 发送 SDP Offer:', offer);
      sendSignalingMessage('offer', offer);

      // 8. 初始化 WebSocket 连接（如果尚未连接）
      if (!websocketRef.current || websocketRef.current.readyState === WebSocket.CLOSED) {
        websocketRef.current = new WebSocket('ws://localhost:8080/ws'); // 替换为你的信令服务器地址
        websocketRef.current.onopen = () => {
          console.log('[WebSocket] 连接成功');
          // 连接成功后可以立即发送 Offer 或其他初始信令
        };
        websocketRef.current.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] 收到信令消息:', message);

          if (message.conversationId !== conversationIdRef.current) {
            console.warn('[WebSocket] 收到非当前会话的信令消息，忽略。');
            return;
          }

          if (message.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignalingMessage('answer', answer);
          } else if (message.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
          } else if (message.type === 'ice-candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(message.payload));
          } else if (message.type === 'hangup') {
            console.log('[WebRTC] 收到挂断信令');
            hangupVoiceCall();
          }
        };
        websocketRef.current.onclose = () => {
          console.log('[WebSocket] 连接关闭');
          hangupVoiceCall(); // WebSocket 关闭时也挂断通话
        };
        websocketRef.current.onerror = (error) => {
          console.error('[WebSocket] 连接错误:', error);
          hangupVoiceCall(); // WebSocket 错误时也挂断通话
        };
      }


      // 在这里添加一个隐藏的 audio 元素用于播放远程音频
      if (!remoteAudioRef.current) {
        remoteAudioRef.current = document.createElement('audio');
        remoteAudioRef.current.autoplay = true;
        remoteAudioRef.current.style.display = 'none';
        document.body.appendChild(remoteAudioRef.current);
      }

    } catch (error) {
      console.error('[WebRTC] 发起语音通话失败:', error);
      setIsVoiceCallActive(false);
      // 可以给用户一个错误提示
      pushAiMessage(conversationIdRef.current!, '发起语音通话失败，请稍后再试。', true);
    }
  };

  const hangupVoiceCall = () => {
    console.log('[WebRTC] 正在挂断语音通话...');

    // 发送挂断信令
    sendSignalingMessage('hangup', {});

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      // remoteAudioRef.current.remove(); // 不再自动移除，由浏览器自行管理
      remoteAudioRef.current = null;
    }
    setIsVoiceCallActive(false);

    // 不需要在这里关闭 WebSocket，因为 useEffect 已经处理
  };

  const wrapperClassName = [
    'flex flex-col',
    isEmbedded ? 'w-full items-stretch' : 'fixed bottom-6 right-6 z-50 items-end',
    containerClassName
  ]
    .filter(Boolean)
    .join(' ');

  const panelClassName = isEmbedded
    ? 'w-full h-[70vh] min-h-[560px] max-h-[780px]'
    : 'w-[375px] h-[600px]';

  return (
    <div className={wrapperClassName}>
      {isOpen && (
        <div className={`${panelClassName} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100`}>
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
              {/* 新增：语音通话按钮 */}
              <button
                onClick={isVoiceCallActive ? hangupVoiceCall : startVoiceCall}
                className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                title={isVoiceCallActive ? '挂断语音通话' : '发起语音通话'}
              >
                <i className={`fa-solid ${isVoiceCallActive ? 'fa-phone-slash text-red-500' : 'fa-phone text-emerald-500'} text-xl`}></i>
              </button>
              {!isEmbedded && (
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              )}
            </div>
          </div>
          {isVoiceMode ? (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-500">语音接口加载中...</div>}>
              <VoiceCallInterface onHangup={() => setIsVoiceMode(false)} />
            </Suspense>
          ) : (
            <>
              {viewState === 'Home' && (
                <div className="p-4 pb-20 flex-1 overflow-y-auto space-y-6">
                  <div className="text-center py-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">您好！</h2>
                    <p className="text-sm text-gray-500">我是您的24小时在线企业保险管家，请随时告诉我您的疑问。</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {QUICK_ACTIONS.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action.label)}
                        className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow flex flex-col items-center justify-center gap-2 group"
                      >
                        <i className={`fa-solid ${action.icon} text-xl ${action.color} group-hover:scale-110 transition-transform`}></i>
                        <span className="text-xs text-gray-600 font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
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
                    {FAQ_CONFIG.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleFAQClick(item.title)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex justify-between items-center group transition-colors border-b border-gray-50 last:border-0"
                      >
                        <span className="line-clamp-1">{item.title}</span>
                        <i className="fa-solid fa-chevron-right text-gray-300 text-xs group-hover:text-emerald-500"></i>
                      </button>
                    ))}
                  </div>
                  <div className="py-3 border-t border-gray-50 text-center">
                    <button className="text-emerald-500 text-sm flex items-center justify-center gap-1 mx-auto hover:text-emerald-600 transition-colors">
                      <i className="fa-solid fa-rotate text-xs"></i> 换一换
                    </button>
                  </div>
                </div>
              )}
              {viewState === 'chat' && (
                <div className="p-4 pb-20 min-h-full flex-1 overflow-y-auto">
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
          {!isVoiceMode && (
            <div className="p-3 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
              {isAgentTyping && (
                <div className="text-sm text-gray-500 mb-2 px-1">
                  客服正在输入...
                </div>
              )}
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
      {!isEmbedded && !isOpen && (
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
