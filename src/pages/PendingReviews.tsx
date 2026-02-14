import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth, getRoleDisplayName } from '../contexts/StaffAuthContext';

interface PendingReview {
    id: string;
    operator_id: string;
    operator_role: string;
    power_type: string;
    action: string;
    target_type: string;
    target_id: string;
    reason: string;
    authorization_url?: string;
    before_state?: string;
    after_state?: string;
    created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
    'PAYMENT': '代支付',
    'SURRENDER': '代退保',
};

const PendingReviews: React.FC = () => {
    const navigate = useNavigate();
    const { staff } = useStaffAuth();
    const [reviews, setReviews] = useState<PendingReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    const canReview = staff?.role === 'L2' || staff?.role === 'L3';

    const fetchReviews = async () => {
        if (!staff?.id) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/pending-reviews?reviewerId=${staff.id}`);
            const data = await res.json() as { success: boolean; reviews?: PendingReview[]; error?: string };

            if (!data.success) {
                setError(data.error || '查询失败');
                return;
            }

            setReviews(data.reviews || []);
        } catch (e) {
            setError('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canReview) {
            fetchReviews();
        }
    }, [staff?.id]);

    const handleReview = async (auditLogId: string, approved: boolean, rejectReason?: string) => {
        setProcessing(auditLogId);

        try {
            const res = await fetch('/api/admin/review-confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auditLogId,
                    reviewerId: staff?.id,
                    reviewerRole: staff?.role,
                    approved,
                    rejectReason
                })
            });

            const data = await res.json() as { success: boolean; error?: string };

            if (!data.success) {
                alert(data.error || '操作失败');
                return;
            }

            // 刷新列表
            fetchReviews();
        } catch (e) {
            alert('网络请求失败');
        } finally {
            setProcessing(null);
        }
    };

    const parseJson = (str: string | undefined) => {
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!canReview) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-white mb-2">权限不足</h2>
                    <p className="text-slate-400 mb-6">仅 L2 及以上管理员可进行复核</p>
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
                        待复核操作 <span className="text-slate-600">|</span> PENDING REVIEWS
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

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* 说明 */}
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-amber-400 text-xl">⚠️</span>
                        <div>
                            <h4 className="font-medium text-amber-400 mb-1">复核人职责</h4>
                            <p className="text-sm text-amber-300/80">
                                作为复核人，您需要核实操作的合理性和授权凭证的有效性。
                                确认通过后操作将生效，拒绝后操作将被回滚。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {/* 待复核列表 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">
                            待处理 <span className="text-slate-400 font-normal">({reviews.length} 项)</span>
                        </h3>
                        <button
                            onClick={fetchReviews}
                            disabled={loading}
                            className="text-sm text-slate-400 hover:text-white transition"
                        >
                            {loading ? '刷新中...' : '刷新'}
                        </button>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            {loading ? '加载中...' : '暂无待复核操作'}
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {reviews.map((review) => {
                                const afterState = parseJson(review.after_state);
                                const isProcessing = processing === review.id;

                                return (
                                    <div key={review.id} className="px-6 py-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-600/20 text-red-400">
                                                        Level 3 高风险
                                                    </span>
                                                    <span className="text-white font-medium">
                                                        {ACTION_LABELS[review.action] || review.action}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-400 space-y-1">
                                                    <p>
                                                        <span className="text-slate-500">操作人:</span>{' '}
                                                        <span className="text-slate-300">{review.operator_id}</span>
                                                        <span className="mx-2 text-slate-600">|</span>
                                                        <span className="text-slate-500">目标:</span>{' '}
                                                        <span className="font-mono text-slate-300">{review.target_id}</span>
                                                    </p>
                                                    <p>
                                                        <span className="text-slate-500">理由:</span>{' '}
                                                        <span className="text-slate-300">{review.reason}</span>
                                                    </p>
                                                    {afterState?.payment_amount && (
                                                        <p>
                                                            <span className="text-slate-500">金额:</span>{' '}
                                                            <span className="text-amber-400 font-medium">
                                                                ¥{afterState.payment_amount}
                                                            </span>
                                                        </p>
                                                    )}
                                                    {review.authorization_url && (
                                                        <p>
                                                            <span className="text-slate-500">授权凭证:</span>{' '}
                                                            <a
                                                                href={review.authorization_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 underline"
                                                            >
                                                                查看凭证
                                                            </a>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-slate-500 mb-3">
                                                    {formatDate(review.created_at)}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('请输入拒绝理由:');
                                                            if (reason !== null) {
                                                                handleReview(review.id, false, reason);
                                                            }
                                                        }}
                                                        disabled={isProcessing}
                                                        className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 rounded transition"
                                                    >
                                                        拒绝
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('确认通过此操作？操作将立即生效。')) {
                                                                handleReview(review.id, true);
                                                            }
                                                        }}
                                                        disabled={isProcessing}
                                                        className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded transition"
                                                    >
                                                        {isProcessing ? '处理中...' : '确认通过'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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

export default PendingReviews;
