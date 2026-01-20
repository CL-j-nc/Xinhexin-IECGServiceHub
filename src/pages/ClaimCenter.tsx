import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ClaimEntry from '../components/claim/ClaimEntry';
import ClaimStatusBanner from '../components/claim/ClaimStatusBanner';
import ClaimForm from '../components/claim/ClaimForm';
import ClaimUploadSection from '../components/claim/ClaimUploadSection';
import ClaimSummary from '../components/claim/ClaimSummary';
import ClaimHistory from '../components/claim/ClaimHistory';
import { createDraftClaim, updateClaimField, addAttachment, submitClaim } from '../services/claim/claimService';
import { ClaimCase, ClaimState } from '../services/claim/claim.types';

const ClaimCenter: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [claim, setClaim] = useState<ClaimCase | null>(null);

    useEffect(() => {
        const policyNo = searchParams.get('policyNo');
        const conversationId = searchParams.get('conversationId') || undefined;

        if (policyNo && /^(65|66)\d+$/.test(policyNo)) {
            // Initialize new draft
            const newClaim = createDraftClaim(policyNo, conversationId);
            setClaim(newClaim);
        } else {
            alert('无效的保单号或参数缺失');
        }
    }, [searchParams]);

    const handleFieldChange = (field: keyof ClaimCase, value: any) => {
        if (!claim) return;
        const updated = updateClaimField(claim.claimId, field, value);
        setClaim({ ...updated });
    };

    const handleUpload = (fileName: string) => {
        if (!claim) return;
        const updated = addAttachment(claim.claimId, fileName);
        setClaim({ ...updated });
    };

    const handleSubmit = async () => {
        if (!claim) return;
        const updated = submitClaim(claim.claimId);
        setClaim({ ...updated });

        // Polling for MVP auto-transition simulation
        const interval = setInterval(() => {
            // In a real app, we would re-fetch. Here we rely on the object reference or simple force update if needed.
            // For MVP simplicity, we won't implement full polling here, relying on user action or mock service immediate return.
            // But service does setTimeout, so let's just re-read after a delay manually for demo.
        }, 2000);
    };

    if (!claim) return <div className="p-10 text-center text-slate-400">正在初始化报案中心...</div>;

    const showProcessEntry = [
        ClaimState.SUBMITTED,
        ClaimState.IN_REVIEW,
        ClaimState.NEEDS_MORE_INFO,
        ClaimState.CLOSED,
        ClaimState.REJECTED
    ].includes(claim.state);

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-6">
                <ClaimEntry policyNo={claim.policyNo} conversationId={claim.conversationId} />
                <ClaimStatusBanner state={claim.state} />
                {showProcessEntry && (
                    <div className="bg-white border border-slate-100 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">理赔流程</p>
                            <p className="text-sm text-slate-600 mt-2">报案已进入理赔流程，可查看阶段说明与材料进度。</p>
                        </div>
                        <Link
                            to={`/claim-process?claimId=${claim.claimId}`}
                            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                            点击查看理赔进度
                        </Link>
                    </div>
                )}
                <ClaimForm claim={claim} onChange={handleFieldChange} />
                <ClaimUploadSection claim={claim} onUpload={handleUpload} />
                <ClaimSummary claim={claim} onSubmit={handleSubmit} />
                <ClaimHistory claim={claim} />
            </div>
        </div>
    );
};

export default ClaimCenter;
