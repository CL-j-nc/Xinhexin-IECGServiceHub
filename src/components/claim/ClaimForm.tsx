import React, { useState } from 'react';
import { ClaimCase, ClaimState } from '../../services/claim/claim.types';

interface Props {
    claim: ClaimCase;
    onChange: (field: keyof ClaimCase, value: any) => void;
}

const ClaimForm: React.FC<Props> = ({ claim, onChange }) => {
    const readOnly = claim.state !== ClaimState.DRAFT && claim.state !== ClaimState.READY_TO_SUBMIT && claim.state !== ClaimState.NEEDS_MORE_INFO;
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: keyof ClaimCase, value: string) => {
        let error = '';
        if (field === 'accidentDateTime' && value) {
            const date = new Date(value);
            if (date > new Date()) {
                error = '出险时间不能晚于当前时间';
            }
        }
        if (field === 'reporterContact' && value) {
            const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/;
            if (!phoneRegex.test(value)) {
                error = '请输入有效的手机号或座机号码';
            }
        }
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const Input = ({ label, field, type = 'text', placeholder = '' }: { label: string, field: keyof ClaimCase, type?: string, placeholder?: string }) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase">{label}</label>
            <input
                type={type}
                disabled={readOnly}
                value={claim[field] as string || ''}
                onChange={(e) => {
                    onChange(field, e.target.value);
                    validateField(field, e.target.value);
                }}
                placeholder={placeholder}
                className={`w-full bg-slate-50 border rounded px-3 py-2 text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${errors[field] ? 'border-red-300 focus:border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-emerald-500'}`}
            />
            {errors[field] && <p className="text-[10px] text-red-500 mt-1">{errors[field]}</p>}
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-100 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">事故详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="事故类型" field="accidentType" placeholder="如：车辆碰撞、人员受伤" />
                <Input label="出险时间" field="accidentDateTime" type="datetime-local" />
                <div className="md:col-span-2">
                    <Input label="出险地点" field="accidentLocation" placeholder="详细地址" />
                </div>
                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-slate-500 uppercase">事故经过描述</label>
                    <textarea
                        disabled={readOnly}
                        value={claim.accidentDescription || ''}
                        onChange={(e) => onChange('accidentDescription', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 h-24 resize-none disabled:opacity-60"
                        placeholder="请简要描述事故发生经过..."
                    />
                </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 pt-4">报案人信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="报案人姓名" field="reporterName" />
                <Input label="联系电话" field="reporterContact" />
            </div>
        </div>
    );
};

export default ClaimForm;