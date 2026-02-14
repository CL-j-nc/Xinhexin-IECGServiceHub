import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth, getRoleDisplayName } from '../contexts/StaffAuthContext';

interface UnderwritingRecord {
    decision_id: string;
    proposal_id: string;
    acceptance: 'ACCEPT' | 'REJECT' | 'MODIFY';
    reason?: string;
    underwriting_confirmed_at: string;
    final_premium?: number;
    auth_code: string | null;
    qr_url: string | null;
    owner_mobile?: string;
    proposal_status: string;
    plate_number?: string;
    brand_model?: string;
}

const UnderwritingLookup: React.FC = () => {
    const navigate = useNavigate();
    const { staff, canSubstituteAuth } = useStaffAuth();
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<UnderwritingRecord[]>([]);
    const [searched, setSearched] = useState(false);

    // 选中的记录详情
    const [selectedRecord, setSelectedRecord] = useState<UnderwritingRecord | null>(null);
    const [showQrModal, setShowQrModal] = useState(false);

    // 重发验证码状态
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    // 代认证状态 (L1+)
    const [showSubstituteForm, setShowSubstituteForm] = useState(false);
    const [substituteMethod, setSubstituteMethod] = useState<'PHONE' | 'VIDEO' | 'IN_PERSON'>('PHONE');
    const [substituteReason, setSubstituteReason] = useState('');
    const [substituting, setSubstituting] = useState(false);
    const [substituteSuccess, setSubstituteSuccess] = useState(false);
    const [substituteError, setSubstituteError] = useState<string | null>(null);

    // 手机号输入处理
    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        setMobile(value);
        if (error) setError(null);
    };

    // 搜索核保记录
    const handleSearch = async () => {
        if (!mobile) {
            setError('请输入手机号');
            return;
        }
        if (mobile.length !== 11 || !mobile.startsWith('1')) {
            setError('请输入正确的11位手机号');
            return;
        }

        setLoading(true);
        setError(null);
        setSearched(true);

        try {
            const res = await fetch(`/api/underwriting/by-phone?mobile=${mobile}`);
            const data = await res.json() as { success: boolean; error?: string; results?: UnderwritingRecord[] };

            if (!data.success) {
                setError(data.error || '查询失败');
                setRecords([]);
                return;
            }

            setRecords(data.results || []);
        } catch (e) {
            setError('网络请求失败，请重试');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 状态显示
    const getStatusDisplay = (record: UnderwritingRecord) => {
        if (record.acceptance === 'ACCEPT') {
            if (record.proposal_status === 'PAID' || record.proposal_status === 'COMPLETED') {
                return { text: '已支付', color: 'bg-emerald-100 text-emerald-700' };
            }
            return { text: '待支付', color: 'bg-amber-100 text-amber-700' };
        }
        if (record.acceptance === 'REJECT') {
            return { text: '已拒保', color: 'bg-red-100 text-red-700' };
        }
        if (record.acceptance === 'MODIFY') {
            return { text: '已打回', color: 'bg-orange-100 text-orange-700' };
        }
        return { text: record.proposal_status, color: 'bg-gray-100 text-gray-600' };
    };

    // 查看验证码/二维码
    const handleViewAuth = (record: UnderwritingRecord) => {
        setSelectedRecord(record);
        setShowQrModal(true);
        setResendSuccess(false);
        // 重置代认证状态
        setShowSubstituteForm(false);
        setSubstituteMethod('PHONE');
        setSubstituteReason('');
        setSubstituteSuccess(false);
        setSubstituteError(null);
    };

    // 重发验证码
    const handleResendAuth = async () => {
        if (!selectedRecord) return;

        setResending(true);
        setResendSuccess(false);

        try {
            const res = await fetch('/api/underwriting/resend-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId: selectedRecord.proposal_id,
                    reason: '客服协助重发'
                })
            });

            const data = await res.json() as { success: boolean; authCode?: string; qrUrl?: string; error?: string };

            if (!data.success) {
                alert(data.error || '重发失败');
                return;
            }

            // 更新当前显示的记录
            setSelectedRecord({
                ...selectedRecord,
                auth_code: data.authCode || selectedRecord.auth_code,
                qr_url: data.qrUrl || selectedRecord.qr_url
            });

            // 更新列表中的记录
            setRecords(prev => prev.map(r =>
                r.proposal_id === selectedRecord.proposal_id
                    ? { ...r, auth_code: data.authCode || r.auth_code, qr_url: data.qrUrl || r.qr_url }
                    : r
            ));

            setResendSuccess(true);
        } catch (e) {
            alert('网络请求失败');
        } finally {
            setResending(false);
        }
    };

    // L1+ 代完成认证
    const handleSubstituteAuth = async () => {
        if (!selectedRecord) return;

        // 校验理由长度
        if (substituteReason.trim().length < 10) {
            setSubstituteError('操作理由至少需要10个字符');
            return;
        }

        setSubstituting(true);
        setSubstituteError(null);
        setSubstituteSuccess(false);

        try {
            const res = await fetch('/api/admin/substitute-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId: selectedRecord.proposal_id,
                    operatorId: staff?.id || 'unknown',
                    operatorRole: staff?.role || 'CS',
                    verificationMethod: substituteMethod,
                    reason: substituteReason.trim()
                })
            });

            const data = await res.json() as { success: boolean; auditLogId?: string; error?: string };

            if (!data.success) {
                setSubstituteError(data.error || '代认证操作失败');
                return;
            }

            setSubstituteSuccess(true);
            setShowSubstituteForm(false);
        } catch (e) {
            setSubstituteError('网络请求失败');
        } finally {
            setSubstituting(false);
        }
    };

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
                        核保记录查询 <span className="text-slate-600">|</span> UNDERWRITING LOOKUP
                    </h1>
                </div>
                {staff && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{staff.name}</span>
                        <span className={`px-2 py-0.5 rounded ${
                            staff.role === 'L3' ? 'bg-purple-600/20 text-purple-400' :
                            staff.role === 'L2' ? 'bg-blue-600/20 text-blue-400' :
                            staff.role === 'L1' ? 'bg-cyan-600/20 text-cyan-400' :
                            'bg-slate-700 text-slate-400'
                        }`}>
                            {getRoleDisplayName(staff.role)}
                        </span>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* 搜索区域 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">按手机号查询</h2>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={11}
                                value={mobile}
                                onChange={handleMobileChange}
                                onKeyDown={handleKeyDown}
                                placeholder="请输入客户手机号（11位）"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                            />
                            {mobile && mobile.length < 11 && (
                                <p className="text-xs text-slate-500 mt-1">还需输入 {11 - mobile.length} 位</p>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading || mobile.length !== 11}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                        >
                            {loading ? '查询中...' : '查询'}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-3 text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}
                </div>

                {/* 结果区域 */}
                {searched && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-white">
                                查询结果 <span className="text-slate-400 font-normal">({records.length} 条记录)</span>
                            </h3>
                        </div>

                        {records.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-500">
                                未找到该手机号的核保记录
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {records.map((record) => {
                                    const status = getStatusDisplay(record);
                                    return (
                                        <div
                                            key={record.decision_id}
                                            className="px-6 py-4 hover:bg-slate-800/50 transition"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white font-medium">
                                                            {record.plate_number || '未上牌'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-400 space-y-1">
                                                        <p>车型: {record.brand_model || '—'}</p>
                                                        <p>投保单号: <span className="font-mono text-slate-300">{record.proposal_id}</span></p>
                                                        <p>核保时间: {new Date(record.underwriting_confirmed_at).toLocaleString('zh-CN')}</p>
                                                        {record.final_premium && (
                                                            <p>核定保费: <span className="text-emerald-400">¥{record.final_premium.toLocaleString()}</span></p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {record.auth_code && (
                                                        <button
                                                            onClick={() => handleViewAuth(record)}
                                                            className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-600/50 text-emerald-400 text-xs rounded hover:bg-emerald-600/30 transition"
                                                        >
                                                            查看验证码
                                                        </button>
                                                    )}
                                                    {!record.auth_code && record.acceptance === 'ACCEPT' && (
                                                        <span className="px-3 py-1.5 bg-slate-700 text-slate-400 text-xs rounded">
                                                            无验证码
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 使用提示 */}
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-sm text-blue-300">
                    <h4 className="font-medium mb-2">使用说明</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                        <li>输入客户手机号可查询该号码关联的所有核保记录</li>
                        <li>核保通过的记录可查看验证码和二维码</li>
                        <li>如客户有多条记录，请通过车牌号确认具体是哪一条</li>
                        <li>如客户收不到验证码，可点击"重发验证码"生成新验证码</li>
                        <li>重发后请将新验证码告知客户</li>
                        <li className="text-cyan-300/80">[L1+] 如客户无法自行完成认证，可通过电话/视频/当面核实身份后代为完成</li>
                    </ul>
                </div>
            </div>

            {/* 验证码/二维码弹窗 */}
            {showQrModal && selectedRecord && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowQrModal(false)}
                >
                    <div
                        className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-white mb-2 text-center">认证信息</h3>
                        <p className="text-sm text-slate-400 mb-4 text-center">
                            投保单: {selectedRecord.proposal_id.slice(-8)}
                        </p>

                        <div className="bg-slate-900 p-4 rounded-xl mb-4 border border-slate-700">
                            {selectedRecord.qr_url && (
                                <div className="flex justify-center mb-4">
                                    <div className="bg-white p-2 rounded-lg">
                                        {/* 简易二维码显示 - 实际应使用 qrcode 库 */}
                                        <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs">
                                            <a
                                                href={selectedRecord.qr_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline text-center"
                                            >
                                                点击打开<br />认证链接
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="text-center">
                                <div className="text-sm text-slate-400 mb-1">验证码</div>
                                <div className="text-2xl font-mono font-bold text-emerald-400 tracking-widest select-all cursor-text">
                                    {selectedRecord.auth_code}
                                </div>
                            </div>
                        </div>

                        {/* 重发成功提示 */}
                        {resendSuccess && (
                            <div className="mb-4 px-3 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-400 text-sm text-center">
                                验证码已重新生成！
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedRecord.auth_code || '');
                                    }}
                                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
                                >
                                    复制验证码
                                </button>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                                >
                                    关闭
                                </button>
                            </div>

                            {/* 重发验证码按钮 */}
                            <button
                                onClick={handleResendAuth}
                                disabled={resending}
                                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                            >
                                {resending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        重发中...
                                    </>
                                ) : (
                                    '重发验证码'
                                )}
                            </button>
                            <p className="text-xs text-slate-500 text-center">
                                如客户收不到验证码，可点击重发生成新验证码
                            </p>

                            {/* 分隔线 */}
                            <div className="border-t border-slate-700 my-4" />

                            {/* 代认证成功提示 */}
                            {substituteSuccess && (
                                <div className="mb-3 px-3 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-lg text-emerald-400 text-sm text-center">
                                    已代客户完成身份认证
                                </div>
                            )}

                            {/* L1+ 代完成认证 - 仅 L1 及以上角色可见 */}
                            {!substituteSuccess && canSubstituteAuth && (
                                <>
                                    <button
                                        onClick={() => setShowSubstituteForm(!showSubstituteForm)}
                                        className="w-full py-2 text-left text-sm text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
                                    >
                                        <span>[L1+] 代完成客户认证</span>
                                        <span className="text-xs">{showSubstituteForm ? '▲' : '▼'}</span>
                                    </button>

                                    {showSubstituteForm && (
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-4">
                                            {/* 身份核实方式 */}
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-2">身份核实方式</label>
                                                <div className="flex gap-3">
                                                    {[
                                                        { value: 'PHONE', label: '电话' },
                                                        { value: 'VIDEO', label: '视频' },
                                                        { value: 'IN_PERSON', label: '当面' }
                                                    ].map(opt => (
                                                        <label
                                                            key={opt.value}
                                                            className={`flex-1 py-2 px-3 rounded-lg border text-center text-sm cursor-pointer transition ${
                                                                substituteMethod === opt.value
                                                                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                                                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="verificationMethod"
                                                                value={opt.value}
                                                                checked={substituteMethod === opt.value}
                                                                onChange={() => setSubstituteMethod(opt.value as 'PHONE' | 'VIDEO' | 'IN_PERSON')}
                                                                className="sr-only"
                                                            />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 操作理由 */}
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-2">
                                                    操作理由 <span className="text-slate-500">（至少10字）</span>
                                                </label>
                                                <textarea
                                                    value={substituteReason}
                                                    onChange={(e) => {
                                                        setSubstituteReason(e.target.value);
                                                        if (substituteError) setSubstituteError(null);
                                                    }}
                                                    placeholder="请说明为何需要代客户完成认证..."
                                                    rows={3}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                                                />
                                                <div className="flex justify-between mt-1">
                                                    <span className={`text-xs ${substituteReason.length < 10 ? 'text-slate-500' : 'text-emerald-500'}`}>
                                                        {substituteReason.length}/10
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 错误提示 */}
                                            {substituteError && (
                                                <div className="text-red-400 text-xs bg-red-900/20 border border-red-800/50 rounded px-3 py-2">
                                                    {substituteError}
                                                </div>
                                            )}

                                            {/* 确认按钮 */}
                                            <button
                                                onClick={handleSubstituteAuth}
                                                disabled={substituting || substituteReason.trim().length < 10}
                                                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                            >
                                                {substituting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        提交中...
                                                    </>
                                                ) : (
                                                    '确认代完成认证'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnderwritingLookup;
