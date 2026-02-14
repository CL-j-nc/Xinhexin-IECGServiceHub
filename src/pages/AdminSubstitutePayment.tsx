import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth, getRoleDisplayName } from '../contexts/StaffAuthContext';

const AdminSubstitutePayment: React.FC = () => {
    const navigate = useNavigate();
    const { staff } = useStaffAuth();

    const [proposalId, setProposalId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [authorizationUrl, setAuthorizationUrl] = useState('');
    const [reason, setReason] = useState('');
    const [reviewerId, setReviewerId] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ auditLogId: string } | null>(null);

    const canSubmit = staff?.role === 'L3';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            setError('无权限：仅 L3 可执行代支付操作');
            return;
        }

        if (!proposalId) {
            setError('请输入投保单号');
            return;
        }
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setError('请输入有效的支付金额');
            return;
        }
        if (!authorizationUrl) {
            setError('请上传书面授权凭证');
            return;
        }
        if (reason.length < 10) {
            setError('操作理由至少需要10个字符');
            return;
        }
        if (!reviewerId) {
            setError('请指定复核人');
            return;
        }
        if (reviewerId === staff?.id) {
            setError('复核人不能是操作人本人');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/substitute-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId,
                    operatorId: staff?.id,
                    operatorRole: staff?.role,
                    paymentAmount: parseFloat(paymentAmount),
                    paymentMethod: 'SFHLT_LINK', // 四方汇来通收款链接
                    authorizationUrl,
                    reason,
                    reviewerId
                })
            });

            const data = await res.json() as { success: boolean; auditLogId?: string; error?: string };

            if (!data.success) {
                setError(data.error || '提交失败');
                return;
            }

            setSuccess({ auditLogId: data.auditLogId || '' });
        } catch (e) {
            setError('网络请求失败');
        } finally {
            setSubmitting(false);
        }
    };

    if (!canSubmit) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-white mb-2">权限不足</h2>
                    <p className="text-slate-400 mb-6">仅 L3 超级管理员可使用代支付功能</p>
                    <button
                        onClick={() => navigate('/staff-dashboard')}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                        返回工作台
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-white mb-2">代支付已提交</h2>
                    <p className="text-slate-400 mb-2">等待复核人确认</p>
                    <p className="text-xs font-mono text-amber-400 mb-6">
                        审计ID: {success.auditLogId}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setSuccess(null);
                                setProposalId('');
                                setPaymentAmount('');
                                setAuthorizationUrl('');
                                setReason('');
                                setReviewerId('');
                            }}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                        >
                            继续操作
                        </button>
                        <button
                            onClick={() => navigate('/audit-log')}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                        >
                            查看日志
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            {/* Header */}
            <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/staff-dashboard')}
                        className="text-slate-400 hover:text-white transition"
                    >
                        ← 返回工作台
                    </button>
                    <h1 className="font-bold text-sm tracking-wider">
                        代客户支付 <span className="text-slate-600">|</span> SUBSTITUTE PAYMENT
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-xs">
                        Level 3 高风险
                    </span>
                </div>
                {staff && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{staff.name}</span>
                        <span className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-400">
                            {getRoleDisplayName(staff.role)}
                        </span>
                    </div>
                )}
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* 警告提示 */}
                <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div>
                            <h4 className="font-medium text-red-400 mb-1">高风险操作警告</h4>
                            <p className="text-sm text-red-300/80">
                                代支付涉及直接资金操作，需要：<br/>
                                1. 客户书面授权凭证<br/>
                                2. 指定复核人进行双人确认<br/>
                                3. 所有操作将永久记录审计日志
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 投保单号 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <label className="block text-sm font-medium text-white mb-3">投保单号</label>
                        <input
                            type="text"
                            value={proposalId}
                            onChange={(e) => setProposalId(e.target.value)}
                            placeholder="PROP-xxx"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* 支付信息 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-medium text-white mb-3">支付信息</h3>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">支付金额（核保确认的保费）</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="¥"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="bg-slate-900/50 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">支付方式:</span>
                                <span className="text-xs text-emerald-400">四方汇来通收款链接</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                使用核保端生成的收款链接完成支付
                            </p>
                        </div>
                    </div>

                    {/* 授权凭证 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-medium text-white mb-3">
                            书面授权凭证 <span className="text-red-400">*</span>
                        </h3>
                        <input
                            type="text"
                            value={authorizationUrl}
                            onChange={(e) => setAuthorizationUrl(e.target.value)}
                            placeholder="请输入授权文件URL（扫描件/照片）"
                            className="w-full bg-slate-900 border border-red-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                        <p className="text-xs text-slate-500">
                            需上传客户签名的书面授权文件扫描件
                        </p>
                    </div>

                    {/* 复核人 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-medium text-white mb-3">
                            双人复核 <span className="text-red-400">*</span>
                        </h3>
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">指定复核人工号</label>
                            <input
                                type="text"
                                value={reviewerId}
                                onChange={(e) => setReviewerId(e.target.value)}
                                placeholder="请输入复核人工号（不能是本人）"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* 操作理由 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <label className="block text-xs text-slate-400 mb-2">
                            操作理由 <span className="text-slate-500">（至少10字）</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="请详细说明代支付原因..."
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                            {reason.length}/10
                        </div>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* 提交按钮 */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                提交中...
                            </>
                        ) : (
                            '提交代支付申请'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSubstitutePayment;
