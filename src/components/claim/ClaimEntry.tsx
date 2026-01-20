import React from 'react';

const ClaimEntry: React.FC<{ policyNo: string; conversationId?: string }> = ({ policyNo, conversationId }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                    <h2 className="text-lg font-medium text-slate-800">团体保险报案中心</h2>
                    <p className="text-xs text-slate-500">关联保单: <span className="font-mono font-bold text-slate-700">{policyNo}</span> {conversationId && <span className="ml-2 bg-slate-100 px-1 rounded text-[10px]">来自会话</span>}</p>
                </div>
            </div>
        </div>
    );
};

export default ClaimEntry;