import React from 'react';

const ClaimEntry: React.FC<{ policyNo: string; conversationId?: string }> = ({ policyNo, conversationId }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                <i className="fa-solid fa-file-shield text-xl"></i>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">团体保险报案中心</h2>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-slate-500 font-medium">关联保单:</p>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-sm border border-slate-200">{policyNo}</span>
                    {conversationId && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium border border-emerald-100 flex items-center gap-1">
                            <i className="fa-solid fa-comments"></i> 会话
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimEntry;