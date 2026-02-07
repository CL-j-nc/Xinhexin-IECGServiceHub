import React from 'react';
import { ClaimState } from '../../services/claim/claim.types';

const STATUS_CONFIG: Record<ClaimState, { color: string; icon: string; text: string; desc: string }> = {
    [ClaimState.DRAFT]: { color: 'bg-slate-100 text-slate-600', icon: 'fa-pen', text: '草稿', desc: '请填写完整的事故信息以继续。' },
    [ClaimState.READY_TO_SUBMIT]: { color: 'bg-emerald-50 text-emerald-600', icon: 'fa-check', text: '待提交', desc: '信息已完善，请确认无误后点击提交。' },
    [ClaimState.SUBMITTED]: { color: 'bg-blue-50 text-blue-600', icon: 'fa-paper-plane', text: '已提交', desc: '报案单已发送至核心系统，正在排队。' },
    [ClaimState.UNDER_REVIEW]: { color: 'bg-indigo-50 text-indigo-600', icon: 'fa-rotate', text: '处理中', desc: '专员正在审核您的报案材料。' },
    [ClaimState.ACCEPTED]: { color: 'bg-emerald-50 text-emerald-600', icon: 'fa-check-double', text: '已受理', desc: '案件已正式受理，即将进入理赔流程。' },
    [ClaimState.NEEDS_MORE_INFO]: { color: 'bg-amber-50 text-amber-600', icon: 'fa-triangle-exclamation', text: '需补充材料', desc: '请根据提示补充相关证明文件。' },
    [ClaimState.CLOSED]: { color: 'bg-gray-100 text-gray-600', icon: 'fa-lock', text: '已结案', desc: '该案件已处理完毕。' },
    [ClaimState.REJECTED]: { color: 'bg-rose-50 text-rose-600', icon: 'fa-xmark', text: '已驳回', desc: '案件不符合受理条件。' }
};

const ClaimStatusBanner: React.FC<{ state: ClaimState }> = ({ state }) => {
    const config = STATUS_CONFIG[state];
    return (
        <div className={`p-4 rounded-lg border border-transparent ${config.color} flex items-start gap-4`}>
            <i className={`fa-solid ${config.icon} mt-1`}></i>
            <div>
                <h3 className="font-bold text-sm">{config.text}</h3>
                <p className="text-xs opacity-80 mt-1">{config.desc}</p>
            </div>
        </div>
    );
};

export default ClaimStatusBanner;