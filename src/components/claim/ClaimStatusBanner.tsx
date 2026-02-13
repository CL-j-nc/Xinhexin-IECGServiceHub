import React from 'react';
import { ClaimState } from '../../services/claim/claim.types';

const STATUS_CONFIG: Record<ClaimState, { color: string; icon: string; text: string; desc: string }> = {
    [ClaimState.DRAFT]: { 
        color: 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 border-slate-200', 
        icon: 'fa-pen-to-square', 
        text: '草稿', 
        desc: '请填写完整的事故信息以继续。' 
    },
    [ClaimState.READY_TO_SUBMIT]: { 
        color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200', 
        icon: 'fa-check-circle', 
        text: '待提交', 
        desc: '信息已完善，请确认无误后点击提交。' 
    },
    [ClaimState.SUBMITTED]: { 
        color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200', 
        icon: 'fa-paper-plane', 
        text: '已提交', 
        desc: '报案单已发送至核心系统，正在排队。' 
    },
    [ClaimState.UNDER_REVIEW]: { 
        color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200', 
        icon: 'fa-spinner fa-spin-pulse', 
        text: '处理中', 
        desc: '专员正在审核您的报案材料。' 
    },
    [ClaimState.ACCEPTED]: { 
        color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200', 
        icon: 'fa-clipboard-check', 
        text: '已受理', 
        desc: '案件已正式受理，即将进入理赔流程。' 
    },
    [ClaimState.NEEDS_MORE_INFO]: { 
        color: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-200', 
        icon: 'fa-triangle-exclamation', 
        text: '需补充材料', 
        desc: '请根据提示补充相关证明文件。' 
    },
    [ClaimState.CLOSED]: { 
        color: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200', 
        icon: 'fa-lock', 
        text: '已结案', 
        desc: '该案件已处理完毕。' 
    },
    [ClaimState.REJECTED]: { 
        color: 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border-rose-200', 
        icon: 'fa-circle-xmark', 
        text: '已驳回', 
        desc: '案件不符合受理条件。' 
    }
};

const ClaimStatusBanner: React.FC<{ state: ClaimState }> = ({ state }) => {
    const config = STATUS_CONFIG[state];
    return (
        <div className={`relative overflow-hidden p-6 rounded-xl border shadow-sm ${config.color} flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-md`}>
            {/* Background Icon Decoration */}
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 pointer-events-none select-none">
                <i className={`fa-solid ${config.icon}`}></i>
            </div>
            
            <div className={`p-3 rounded-full bg-white/60 backdrop-blur-sm shadow-sm flex items-center justify-center shrink-0`}>
                <i className={`fa-solid ${config.icon} text-2xl`}></i>
            </div>
            
            <div className="z-10">
                <h3 className="text-lg font-bold tracking-tight">{config.text}</h3>
                <p className="text-sm font-medium opacity-90 mt-1 max-w-prose">{config.desc}</p>
            </div>
        </div>
    );
};

export default ClaimStatusBanner;