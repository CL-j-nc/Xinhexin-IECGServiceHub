import React from 'react';
import { ClaimCase, ClaimState } from '../../services/claim/claim.types';

interface Props {
    claim: ClaimCase;
    onUpload: (fileName: string) => void;
}

const ClaimUploadSection: React.FC<Props> = ({ claim, onUpload }) => {
    const readOnly = claim.state !== ClaimState.DRAFT && claim.state !== ClaimState.READY_TO_SUBMIT && claim.state !== ClaimState.NEEDS_MORE_INFO;

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">附件材料</h3>
            <div className="flex flex-wrap gap-2">
                {claim.attachments.map((file, idx) => (
                    <div key={idx} className="bg-slate-50 px-3 py-1.5 rounded text-xs text-slate-600 border border-slate-200 flex items-center gap-2">
                        <i className="fa-solid fa-paperclip"></i> {file}
                    </div>
                ))}
                {!readOnly && (
                    <button
                        onClick={() => onUpload(`evidence_${Date.now()}.jpg`)}
                        className="px-3 py-1.5 rounded text-xs border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                        + 添加附件 (Mock)
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClaimUploadSection;