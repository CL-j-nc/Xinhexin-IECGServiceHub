import React, { useState, useEffect } from 'react';
import { getHubData, addMessage, uploadDocument } from '../services/conversationService';
import { broadcastMessage, onBroadcastMessage } from '../services/eventBus';
import { ConversationMessage, BusinessDocument, MessageRole } from '../services/conversation.types';

const ConversationHub: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [hubData, setHubData] = useState(getHubData());
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [interventionText, setInterventionText] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [policyNo, setPolicyNo] = useState('');

    useEffect(() => {
        // 监听广播，更新 hubData
        const unsubscribe = onBroadcastMessage((msg) => {
            addMessage(msg.conversationId, msg);
            setHubData(getHubData());
        });
        return () => unsubscribe();
    }, []);

    const selectedConv = hubData.activeConversations.find(c => c.conversationId === selectedConvId);

    const handleIntervention = () => {
        if (selectedConvId && interventionText) {
            const msg: ConversationMessage = {
                id: Date.now().toString(),
                conversationId: selectedConvId,
                role: MessageRole.AGENT,
                content: interventionText,
                timestamp: new Date()
            };
            addMessage(selectedConvId, msg);
            broadcastMessage(msg); // 发回客户
            setInterventionText('');
            setHubData(getHubData());
        }
    };

    const handleUpload = () => {
        if (selectedConvId && docFile) {
            const doc: BusinessDocument = {
                id: Date.now().toString(),
                conversationId: selectedConvId,
                name: docFile.name,
                type: 'POLICY_PDF',
                url: URL.createObjectURL(docFile),
                uploadedBy: 'agent-9527',
                timestamp: new Date(),
                linkedPolicyNo: policyNo
            };
            uploadDocument(selectedConvId, doc);
            setDocFile(null);
            setPolicyNo('');
            setHubData(getHubData());
        }
    };

    const handleInitiateClaim = () => {
        if (!selectedConvId) return;

        let targetPolicy = policyNo;
        if (!targetPolicy) {
            const input = window.prompt("请输入关联的团体保单号 (65/66开头):");
            if (!input || !/^(65|66)\d+$/.test(input)) return alert("保单号格式错误");
            targetPolicy = input;
        }
        window.open(`/claim-center?policyNo=${targetPolicy}&conversationId=${selectedConvId}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex flex-col">
            {/* Header with Exit Button */}
            <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <h1 className="font-bold text-sm tracking-wider">CONVERSATION HUB <span className="text-slate-600">|</span> ADMIN</h1>
                </div>
                <button onClick={onExit} className="text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-900/50 transition-colors">
                    退出系统
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* 左侧：会话列表 */}
                <div className="w-80 bg-slate-950 p-4 border-r border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">活跃会话</h3>
                    {hubData.activeConversations.map(conv => (
                        <button key={conv.conversationId} onClick={() => setSelectedConvId(conv.conversationId)} className="w-full text-left p-2 hover:bg-slate-800 rounded">
                            <p className="text-sm">ID: {conv.conversationId.slice(0, 8)}... ({conv.status})</p>
                            <p className="text-[10px] text-slate-500">介入: {conv.interventions}</p>
                        </button>
                    ))}
                </div>

                {/* 右侧：详情 */}
                <div className="flex-1 p-6 space-y-6">
                    {selectedConv ? (
                        <>
                            <h2 className="text-base font-medium text-emerald-500">会话详情: {selectedConv.conversationId}</h2>
                            {/* 消息预览 */}
                            <div className="bg-slate-800 p-4 rounded-lg space-y-2">
                                {selectedConv.messages.map(msg => (
                                    <p key={msg.id} className="text-xs">{msg.role}: {msg.content}</p>
                                ))}
                            </div>
                            {/* 干预输入 */}
                            <input value={interventionText} onChange={e => setInterventionText(e.target.value)} placeholder="输入干预回复" className="bg-slate-700 p-2 rounded" />
                            <button onClick={handleIntervention} className="bg-emerald-600 px-4 py-2 rounded">发送干预</button>
                            {/* 资料写入 */}
                            <div className="space-y-2">
                                <input type="file" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                                <input value={policyNo} onChange={e => setPolicyNo(e.target.value)} placeholder="绑定 Policy No" />
                                <button onClick={handleUpload} className="bg-emerald-600 px-4 py-2 rounded">上传资料</button>
                                <button onClick={handleInitiateClaim} className="bg-orange-600 px-4 py-2 rounded w-full mt-2">发起报案 (ClaimHub)</button>
                            </div>
                            {/* 监控指标 */}
                            <div className="text-xs text-slate-400">
                                平均响应: {hubData.monitoring.responseTimeAvg}ms | 介入率: {hubData.monitoring.interventionRate}
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-500">选择一个会话查看详情</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationHub;
