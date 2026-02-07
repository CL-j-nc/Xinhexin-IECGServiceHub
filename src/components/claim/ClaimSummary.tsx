import React from 'react';
import { ClaimCase, ClaimState } from '../../services/claim/claim.types';

interface Props {
    claim: ClaimCase;
    onSubmit: () => void;
    loading?: boolean;
}

const ClaimSummary: React.FC<Props> = ({ claim, onSubmit, loading }) => {
    const canSubmit = claim.state === ClaimState.READY_TO_SUBMIT || claim.state === ClaimState.NEEDS_MORE_INFO;

    return (
        <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
                onClick={onSubmit}
                disabled={!canSubmit || loading}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
            >
                {claim.state === ClaimState.NEEDS_MORE_INFO ? '补充材料并提交' : '确认并提交报案'}
            </button>
        </div>
    );
};

export default ClaimSummary;