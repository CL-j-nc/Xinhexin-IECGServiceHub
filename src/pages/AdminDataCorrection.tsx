import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth, getRoleDisplayName } from '../contexts/StaffAuthContext';

const TARGET_TYPES = [
    { value: 'PROPOSAL', label: '投保单' },
    { value: 'POLICY', label: '保单' },
    { value: 'CUSTOMER', label: '客户信息' },
];

const COMMON_FIELDS = {
    PROPOSAL: [
        { value: 'owner_name', label: '投保人姓名' },
        { value: 'owner_mobile', label: '投保人手机' },
        { value: 'owner_id_number', label: '投保人身份证' },
        { value: 'plate_number', label: '车牌号' },
        { value: 'vin', label: 'VIN码' },
    ],
    POLICY: [
        { value: 'holder_name', label: '投保人姓名' },
        { value: 'holder_mobile', label: '投保人手机' },
        { value: 'insured_name', label: '被保险人姓名' },
        { value: 'plate_number', label: '车牌号' },
    ],
    CUSTOMER: [
        { value: 'name', label: '姓名' },
        { value: 'mobile', label: '手机号' },
        { value: 'id_number', label: '身份证号' },
        { value: 'address', label: '地址' },
    ],
};

const AdminDataCorrection: React.FC = () => {
    const navigate = useNavigate();
    const { staff, canSubstituteAuth } = useStaffAuth();

    const [targetType, setTargetType] = useState<'PROPOSAL' | 'POLICY' | 'CUSTOMER'>('PROPOSAL');
    const [targetId, setTargetId] = useState('');
    const [fieldName, setFieldName] = useState('');
    const [customFieldName, setCustomFieldName] = useState('');
    const [oldValue, setOldValue] = useState('');
    const [newValue, setNewValue] = useState('');
    const [reason, setReason] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const actualFieldName = fieldName === 'custom' ? customFieldName : fieldName;

        if (!targetId) {
            setError('请输入目标ID');
            return;
        }
        if (!actualFieldName) {
            setError('请选择或输入修改字段');
            return;
        }
        if (!newValue) {
            setError('请输入新值');
            return;
        }
        if (reason.length < 10) {
            setError('修改理由至少需要10个字符');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/correct-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetType,
                    targetId,
                    operatorId: staff?.id,
                    operatorRole: staff?.role,
                    fieldName: actualFieldName,
                    oldValue,
                    newValue,
                    reason
                })
            });

            const data = await res.json() as { success: boolean; error?: string };

            if (!data.success) {
                setError(data.error || '纠错失败');
                return;
            }

            setSuccess(true);
        } catch (e) {
            setError('网络请求失败');
        } finally {
            setSubmitting(false);
        }
    };

    if (!canSubstituteAuth) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-white mb-2">权限不足</h2>
                    <p className="text-slate-400 mb-6">仅 L1 及以上管理员可使用此功能</p>
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
                    <h2 className="text-xl font-bold text-white mb-2">数据已修正</h2>
                    <p className="text-slate-400 mb-6">修改记录已保存至审计日志</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setTargetId('');
                                setFieldName('');
                                setCustomFieldName('');
                                setOldValue('');
                                setNewValue('');
                                setReason('');
                            }}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                        >
                            继续纠错
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

    const currentFields = COMMON_FIELDS[targetType];

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
                        数据纠错 <span className="text-slate-600">|</span> DATA CORRECTION
                    </h1>
                </div>
                {staff && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{staff.name}</span>
                        <span className={`px-2 py-0.5 rounded ${
                            staff.role === 'L3' ? 'bg-purple-600/20 text-purple-400' :
                            staff.role === 'L2' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-cyan-600/20 text-cyan-400'
                        }`}>
                            {getRoleDisplayName(staff.role)}
                        </span>
                    </div>
                )}
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* 说明 */}
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-blue-400 text-xl">ℹ️</span>
                        <div>
                            <h4 className="font-medium text-blue-400 mb-1">纠错权操作</h4>
                            <p className="text-sm text-blue-300/80">
                                用于修正系统或人为错误导致的数据问题。所有修改将记录完整的
                                before/after 状态，支持审计追溯。
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 目标选择 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <label className="block text-sm font-medium text-white mb-3">数据类型</label>
                        <div className="flex gap-3">
                            {TARGET_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setTargetType(type.value as any);
                                        setFieldName('');
                                    }}
                                    className={`flex-1 py-2 px-4 rounded-lg border text-sm transition ${
                                        targetType === type.value
                                            ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                                            : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs text-slate-400 mb-2">
                                {targetType === 'PROPOSAL' ? '投保单号' :
                                 targetType === 'POLICY' ? '保单号' : '客户ID'}
                            </label>
                            <input
                                type="text"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                placeholder={`请输入${TARGET_TYPES.find(t => t.value === targetType)?.label}ID`}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                        </div>
                    </div>

                    {/* 字段选择 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <label className="block text-sm font-medium text-white">修改字段</label>
                        <div className="grid grid-cols-2 gap-2">
                            {currentFields.map((field) => (
                                <button
                                    key={field.value}
                                    type="button"
                                    onClick={() => setFieldName(field.value)}
                                    className={`py-2 px-3 rounded-lg border text-sm text-left transition ${
                                        fieldName === field.value
                                            ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400'
                                            : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    {field.label}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFieldName('custom')}
                                className={`py-2 px-3 rounded-lg border text-sm text-left transition ${
                                    fieldName === 'custom'
                                        ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                                        : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                其他字段...
                            </button>
                        </div>

                        {fieldName === 'custom' && (
                            <input
                                type="text"
                                value={customFieldName}
                                onChange={(e) => setCustomFieldName(e.target.value)}
                                placeholder="请输入字段名（英文）"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                        )}
                    </div>

                    {/* 值修改 */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">原值（可选）</label>
                                <input
                                    type="text"
                                    value={oldValue}
                                    onChange={(e) => setOldValue(e.target.value)}
                                    placeholder="修改前的值"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-400 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-2">新值</label>
                                <input
                                    type="text"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder="修改后的值"
                                    className="w-full bg-slate-900 border border-cyan-600 rounded-lg px-4 py-2 text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-2">
                                修改理由 <span className="text-slate-500">（至少10字）</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="请说明修改原因..."
                                rows={3}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                            />
                            <div className="text-xs text-slate-500 mt-1">
                                {reason.length}/10
                            </div>
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
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                提交中...
                            </>
                        ) : (
                            '提交数据纠错'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDataCorrection;
