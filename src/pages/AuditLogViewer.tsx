import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth, getRoleDisplayName } from '../contexts/StaffAuthContext';

interface AuditLog {
    id: string;
    operator_id: string;
    operator_role: string;
    power_type: string;
    action: string;
    target_type: string;
    target_id: string;
    verification_method?: string;
    reason: string;
    before_state?: string;
    after_state?: string;
    created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
    'COMPLETE_AUTH': '代完成认证',
    'UPLOAD_MATERIAL': '代补充材料',
    'SUBMIT_CLAIM': '代提理赔',
    'PAYMENT': '代支付',
    'SURRENDER': '代退保',
    'RESEND_AUTH': '重发验证码',
    'CORRECT_DATA': '数据纠错',
};

const POWER_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    'CORRECTION': { label: '纠错权', color: 'bg-blue-600/20 text-blue-400' },
    'GUARANTEE': { label: '兜底权', color: 'bg-amber-600/20 text-amber-400' },
    'SUBSTITUTION': { label: '代行权', color: 'bg-purple-600/20 text-purple-400' },
};

const AuditLogViewer: React.FC = () => {
    const navigate = useNavigate();
    const { staff } = useStaffAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filterProposalId, setFilterProposalId] = useState('');
    const [filterOperatorId, setFilterOperatorId] = useState('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filterProposalId) params.set('proposalId', filterProposalId);
            if (filterOperatorId) params.set('operatorId', filterOperatorId);
            params.set('limit', '100');

            const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
            const data = await res.json() as { success: boolean; logs?: AuditLog[]; error?: string };

            if (!data.success) {
                setError(data.error || '查询失败');
                return;
            }

            setLogs(data.logs || []);
        } catch (e) {
            setError('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSearch = () => {
        fetchLogs();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseJson = (str: string | undefined) => {
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch {
            return null;
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
                        审计日志 <span className="text-slate-600">|</span> AUDIT LOG
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

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                {/* 筛选区域 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-slate-400 mb-2">投保单号</label>
                            <input
                                type="text"
                                value={filterProposalId}
                                onChange={(e) => setFilterProposalId(e.target.value)}
                                placeholder="PROP-xxx"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-slate-400 mb-2">操作人ID</label>
                            <input
                                type="text"
                                value={filterOperatorId}
                                onChange={(e) => setFilterOperatorId(e.target.value)}
                                placeholder="工号"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-lg transition"
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

                {/* 日志列表 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                        <h3 className="text-base font-semibold text-white">
                            操作记录 <span className="text-slate-400 font-normal">({logs.length} 条)</span>
                        </h3>
                    </div>

                    {logs.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            {loading ? '加载中...' : '暂无记录'}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {logs.map((log) => {
                                const powerType = POWER_TYPE_LABELS[log.power_type] || { label: log.power_type, color: 'bg-slate-700 text-slate-400' };
                                const isExpanded = expandedLogId === log.id;
                                const beforeState = parseJson(log.before_state);
                                const afterState = parseJson(log.after_state);

                                return (
                                    <div key={log.id} className="px-6 py-4">
                                        <div
                                            className="flex items-start justify-between cursor-pointer"
                                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        >
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${powerType.color}`}>
                                                        {powerType.label}
                                                    </span>
                                                    <span className="text-white font-medium">
                                                        {ACTION_LABELS[log.action] || log.action}
                                                    </span>
                                                    {log.verification_method && (
                                                        <span className="text-xs text-slate-400">
                                                            ({log.verification_method})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-400 space-y-1">
                                                    <p>
                                                        <span className="text-slate-500">操作人:</span>{' '}
                                                        <span className="text-slate-300">{log.operator_id}</span>
                                                        <span className="mx-2 text-slate-600">|</span>
                                                        <span className="text-slate-500">角色:</span>{' '}
                                                        <span className={`${
                                                            log.operator_role === 'L3' ? 'text-purple-400' :
                                                            log.operator_role === 'L2' ? 'text-blue-400' :
                                                            log.operator_role === 'L1' ? 'text-cyan-400' : 'text-slate-400'
                                                        }`}>{log.operator_role}</span>
                                                    </p>
                                                    <p>
                                                        <span className="text-slate-500">目标:</span>{' '}
                                                        <span className="font-mono text-slate-300">{log.target_id.slice(-12)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-slate-500">{formatDate(log.created_at)}</div>
                                                <div className="text-xs text-slate-600 mt-1">{isExpanded ? '▲' : '▼'}</div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                                                <div>
                                                    <div className="text-xs text-slate-500 mb-1">操作理由</div>
                                                    <div className="text-sm text-slate-300 bg-slate-900/50 rounded px-3 py-2">
                                                        {log.reason}
                                                    </div>
                                                </div>
                                                {beforeState && (
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">操作前状态</div>
                                                        <pre className="text-xs text-slate-400 bg-slate-900/50 rounded px-3 py-2 overflow-x-auto">
                                                            {JSON.stringify(beforeState, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {afterState && (
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">操作后状态</div>
                                                        <pre className="text-xs text-emerald-400/80 bg-slate-900/50 rounded px-3 py-2 overflow-x-auto">
                                                            {JSON.stringify(afterState, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-600 font-mono">
                                                    ID: {log.id}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogViewer;
