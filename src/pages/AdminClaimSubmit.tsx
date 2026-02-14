import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth, getRoleDisplayName } from '../contexts/StaffAuthContext';

const CLAIM_TYPES = [
    { value: 'ACCIDENT', label: '意外险理赔' },
    { value: 'VEHICLE_DAMAGE', label: '车损理赔' },
    { value: 'THIRD_PARTY', label: '第三者责任' },
    { value: 'MEDICAL', label: '医疗费用' },
    { value: 'OTHER', label: '其他' },
];

const AdminClaimSubmit: React.FC = () => {
    const navigate = useNavigate();
    const { staff } = useStaffAuth();

    const [policyId, setPolicyId] = useState('');
    const [claimType, setClaimType] = useState('');
    const [claimAmount, setClaimAmount] = useState('');
    const [claimDescription, setClaimDescription] = useState('');
    const [authorizationType, setAuthorizationType] = useState<'VERBAL' | 'WRITTEN'>('VERBAL');
    const [authorizationNote, setAuthorizationNote] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ claimId: string } | null>(null);

    // 检查权限
    const canSubmit = staff?.role === 'L2' || staff?.role === 'L3';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            setError('无权限：仅 L2 及以上角色可执行此操作');
            return;
        }

        if (!policyId) {
            setError('请输入保单号');
            return;
        }
        if (!claimType) {
            setError('请选择理赔类型');
            return;
        }
        if (claimDescription.length < 20) {
            setError('理赔描述至少需要20个字符');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/submit-claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policyId,
                    operatorId: staff?.id,
                    operatorRole: staff?.role,
                    claimType,
                    claimAmount: claimAmount ? parseFloat(claimAmount) : undefined,
                    claimDescription,
                    authorizationType,
                    authorizationNote
                })
            });

            const data = await res.json() as { success: boolean; claimId?: string; error?: string };

            if (!data.success) {
                setError(data.error || '提交失败');
                return;
            }

            setSuccess({ claimId: data.claimId || '' });
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
                    <p className="text-slate-400 mb-6">仅 L2 及以上管理员可使用此功能</p>
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
                    <h2 className="text-xl font-bold text-white mb-2">理赔申请已提交</h2>
                    <p className="text-slate-400 mb-2">理赔单号</p>
                    <p className="text-2xl font-mono text-emerald-400 mb-6">{success.claimId}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setSuccess(null);
                                setPolicyId('');
                                setClaimType('');
                                setClaimAmount('');
                                setClaimDescription('');
                                setAuthorizationNote('');
                            }}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                        >
                            继续提交
                        </button>
                        <button
                            onClick={() => navigate('/staff-dashboard')}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                        >
                            返回工作台
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
                        代提理赔 <span className="text-slate-600">|</span> SUBMIT CLAIM
                    </h1>
                </div>
                {staff && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{staff.name}</span>
                        <span className={`px-2 py-0.5 rounded ${
                            staff.role === 'L3' ? 'bg-purple-600/20 text-purple-400' :
                            'bg-blue-600/20 text-blue-400'
                        }`}>
                            {getRoleDisplayName(staff.role)}
                        </span>
                    </div>
                )}
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* 警告提示 */}
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-amber-400 text-xl">⚠️</span>
                        <div>
                            <h4 className="font-medium text-amber-400 mb-1">代行权操作提醒</h4>
                            <p className="text-sm text-amber-300/80">
                                本操作将代客户提交理赔申请。请确保已获得客户明确授权，
                                所有操作将记录审计日志。
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 保单号 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <label className="block text-sm font-medium text-white mb-3">保单号</label>
                        <input
                            type="text"
                            value={policyId}
                            onChange={(e) => setPolicyId(e.target.value)}
                            placeholder="请输入保单号"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* 理赔信息 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-medium text-white mb-3">理赔信息</h3>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">理赔类型</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {CLAIM_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setClaimType(type.value)}
                                        className={`py-2 px-3 rounded-lg border text-sm transition ${
                                            claimType === type.value
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">预估金额（可选）</label>
                            <input
                                type="number"
                                value={claimAmount}
                                onChange={(e) => setClaimAmount(e.target.value)}
                                placeholder="¥"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">
                                理赔描述 <span className="text-slate-500">（至少20字）</span>
                            </label>
                            <textarea
                                value={claimDescription}
                                onChange={(e) => setClaimDescription(e.target.value)}
                                placeholder="请详细描述事故经过、损失情况等..."
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                            <div className="text-xs text-slate-500 mt-1">
                                {claimDescription.length}/20
                            </div>
                        </div>
                    </div>

                    {/* 授权信息 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-medium text-white mb-3">客户授权</h3>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">授权方式</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAuthorizationType('VERBAL')}
                                    className={`flex-1 py-3 px-4 rounded-lg border text-sm transition ${
                                        authorizationType === 'VERBAL'
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                            : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="font-medium">口头授权</div>
                                    <div className="text-xs opacity-70 mt-1">电话/视频确认</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthorizationType('WRITTEN')}
                                    className={`flex-1 py-3 px-4 rounded-lg border text-sm transition ${
                                        authorizationType === 'WRITTEN'
                                            ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                                            : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="font-medium">书面授权</div>
                                    <div className="text-xs opacity-70 mt-1">签名/扫描件</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">授权备注</label>
                            <input
                                type="text"
                                value={authorizationNote}
                                onChange={(e) => setAuthorizationNote(e.target.value)}
                                placeholder="如：2024-02-14 电话确认，录音编号 xxx"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
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
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                提交中...
                            </>
                        ) : (
                            '代客户提交理赔'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminClaimSubmit;
