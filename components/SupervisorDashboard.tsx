import React, { useState, useEffect, useRef } from 'react';
import { CoachingTip, Message, Role } from '../types';
import { generateCoachingTip } from '../services/coachingService';
import PolicyManagementModule from './PolicyManagementModule';
import { broadcastMessage, onBroadcastMessage } from '../services/eventBus';

interface SupervisorDashboardProps {
  onExit: () => void;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'policy-db'>('monitor');
  const [tips, setTips] = useState<CoachingTip[]>([]);
  
  // Real-time Chat Sync
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Intervention Input
  const [interventionText, setInterventionText] = useState('');

  // Event Bus Listener
  useEffect(() => {
    onBroadcastMessage((msg) => {
        setChatHistory(prev => [...prev, msg]);
        
        // Also generate coaching tip if it's user input
        if (msg.role === Role.USER) {
            fetchTip(msg.content);
        }
    });
  }, []);

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchTip = async (newText: string) => {
    const tip = await generateCoachingTip(newText);
    if (tip) {
      setTips(prev => [tip, ...prev].slice(0, 5));
    }
  };

  const handleSendIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionText.trim()) return;

    const supMsg: Message = {
        id: Date.now().toString(),
        role: Role.SUPERVISOR,
        content: interventionText,
        timestamp: new Date()
    };

    // 1. Show in own dashboard
    setChatHistory(prev => [...prev, supMsg]);
    
    // 2. Broadcast to Customer
    broadcastMessage(supMsg);
    
    setInterventionText('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex flex-col">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-950 shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded flex items-center justify-center text-white">
                 <i className="fa-solid fa-server"></i>
            </div>
            <div>
                <h1 className="font-bold text-sm text-slate-100 tracking-wide uppercase">核心业务管理后台</h1>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-emerald-500">SYSTEM ONLINE</span>
                </div>
            </div>
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>

          <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
             <button 
                onClick={() => setActiveTab('monitor')}
                className={`px-4 py-1 text-xs font-medium rounded transition-all ${activeTab === 'monitor' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <i className="fa-solid fa-headset mr-2"></i>人工坐席接管
             </button>
             <button 
                onClick={() => setActiveTab('policy-db')}
                className={`px-4 py-1 text-xs font-medium rounded transition-all ${activeTab === 'policy-db' ? 'bg-emerald-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <i className="fa-solid fa-database mr-2"></i>保单数据录入
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
             <div className="text-xs text-slate-300 font-bold">Admin User</div>
             <div className="text-[10px] text-slate-500">ID: 9527</div>
           </div>
           <button onClick={onExit} className="w-8 h-8 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center" title="安全登出">
             <i className="fa-solid fa-power-off"></i>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        
        {activeTab === 'policy-db' && (
            <div className="w-full h-full relative z-10">
                <PolicyManagementModule />
            </div>
        )}

        {activeTab === 'monitor' && (
            <div className="flex w-full h-full relative z-10">
                {/* Left: Live Transcript Area */}
                <div className="flex-1 flex flex-col border-r border-slate-800">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div>
                            <h2 className="text-emerald-500 font-bold flex items-center gap-2">
                                <i className="fa-solid fa-satellite-dish animate-pulse"></i> 客户服务实时监控
                            </h2>
                            <div className="text-xs text-slate-500 mt-1">Session ID: <span className="font-mono">LIVE-CN-7721</span></div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">
                            状态: 客户在线
                        </div>
                    </div>

                    {/* Chat Stream */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                        {chatHistory.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <i className="fa-regular fa-comments text-4xl mb-4"></i>
                                <p>等待客户发起对话...</p>
                            </div>
                        )}
                        
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed
                                    ${msg.role === Role.USER 
                                        ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' 
                                        : msg.role === Role.SUPERVISOR
                                            ? 'bg-orange-600/20 border border-orange-500/50 text-orange-200 rounded-tr-none'
                                            : 'bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 rounded-tr-none'
                                    }`}>
                                    <div className="text-[10px] uppercase font-bold mb-1 opacity-50 flex items-center gap-2">
                                        {msg.role === Role.USER ? <><i className="fa-solid fa-user"></i> 客户</> : 
                                         msg.role === Role.SUPERVISOR ? <><i className="fa-solid fa-headset"></i> 我 (人工)</> : 
                                         <><i className="fa-solid fa-robot"></i> AI 助手</>}
                                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Intervention Input */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <form onSubmit={handleSendIntervention} className="flex gap-4">
                            <input 
                                type="text"
                                value={interventionText}
                                onChange={e => setInterventionText(e.target.value)}
                                placeholder="输入回复内容以接管 AI (回车发送)..."
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                            />
                            <button 
                                type="submit"
                                disabled={!interventionText.trim()}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-900/20"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                                发送
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: AI Coaching */}
                <div className="w-80 bg-slate-900 p-4 flex flex-col shadow-2xl z-20 border-l border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-brain text-purple-500"></i>
                        智能辅助分析 (Copilot)
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {tips.map((tip) => (
                        <div 
                            key={tip.id} 
                            className={`p-3 rounded border-l-2 shadow-md bg-slate-800/50
                            ${tip.priority === 'HIGH' ? 'border-red-500' : 'border-blue-500'}
                            `}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                                    ${tip.category === 'RISK' ? 'bg-red-900/50 text-red-400' : 
                                    tip.category === 'TRUST' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                    {tip.category}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-normal">{tip.content}</p>
                        </div>
                        ))}
                        {tips.length === 0 && (
                            <div className="text-center mt-10 p-6 border border-dashed border-slate-700 rounded-xl">
                                <p className="text-xs text-slate-500">暂无风险提示</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;