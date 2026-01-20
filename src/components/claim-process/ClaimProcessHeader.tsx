import React from 'react';
import { ClaimProcessState } from '../../services/claim-process/claimProcess.types';

interface Props {
    processId: string;
    claimId: string;
    state: ClaimProcessState;
    stateText: string;
}

const STATE_STYLES: Record<ClaimProcessState, string> = {
    [ClaimProcessState.CLAIM_ACCEPTED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [ClaimProcessState.MATERIALS_REVIEWING]: 'bg-blue-50 text-blue-700 border-blue-100',
    [ClaimProcessState.MATERIALS_REQUIRED]: 'bg-amber-50 text-amber-700 border-amber-100',
    [ClaimProcessState.UNDER_INVESTIGATION]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    [ClaimProcessState.ASSESSING]: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    [ClaimProcessState.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [ClaimProcessState.PAYMENT_IN_PROGRESS]: 'bg-teal-50 text-teal-700 border-teal-100',
    [ClaimProcessState.COMPLETED]: 'bg-slate-50 text-slate-500 border-slate-200',
    [ClaimProcessState.REJECTED]: 'bg-rose-50 text-rose-700 border-rose-100'
};

const ClaimProcessHeader: React.FC<Props> = ({ processId, claimId, state, stateText }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-lg p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">理赔流程编号</p>
                    <p className="text-base font-medium text-slate-800 mt-2">{processId}</p>
                    <p className="text-xs text-slate-400 mt-2">关联报案单：{claimId}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${STATE_STYLES[state]}`}>
                    {stateText}
                </span>
            </div>
        </div>
    );
};

export default ClaimProcessHeader;
