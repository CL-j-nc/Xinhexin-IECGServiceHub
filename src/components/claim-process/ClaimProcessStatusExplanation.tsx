import React from 'react';

interface Props {
    stateText: string;
    stateDescription: string;
    nextStepHint?: string;
}

const ClaimProcessStatusExplanation: React.FC<Props> = ({ stateText, stateDescription, nextStepHint }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-lg p-6 space-y-4">
            <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">当前阶段</p>
                <h2 className="text-lg font-medium text-slate-800 mt-2">{stateText}</h2>
                <p className="text-sm text-slate-500 leading-relaxed mt-3">{stateDescription}</p>
            </div>
            {nextStepHint && (
                <div className="bg-slate-50 border border-slate-100 rounded-md p-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">下一步提示</p>
                    <p className="text-sm text-slate-600 mt-2">{nextStepHint}</p>
                </div>
            )}
        </div>
    );
};

export default ClaimProcessStatusExplanation;
