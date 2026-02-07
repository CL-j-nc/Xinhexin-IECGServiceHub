import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ClaimEntry from '../components/claim/ClaimEntry';
import ClaimStatusBanner from '../components/claim/ClaimStatusBanner';
import ClaimForm from '../components/claim/ClaimForm';
import ClaimUploadSection from '../components/claim/ClaimUploadSection';
import ClaimSummary from '../components/claim/ClaimSummary';
import ClaimHistory from '../components/claim/ClaimHistory';
import { createDraftClaim, updateClaimField, addAttachment, submitClaim, getClaim } from '../services/claimService';
import { ClaimCase, ClaimState } from '../services/claim/claim.types';

const ClaimCenter: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [claim, setClaim] = useState<ClaimCase | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const policyNo = searchParams.get('policyNo');
        const conversationId = searchParams.get('conversationId') || undefined;
        const existingClaimId = searchParams.get('claimId'); // Support loading existing

        const init = async () => {
            if (existingClaimId) {
                try {
                    const data = await getClaim(existingClaimId);
                    setClaim(data);
                } catch (e) {
                    alert('无法加载报案记录');
                }
                return;
            }

            if (policyNo && /^(65|66)\d+$/.test(policyNo)) {
                try {
                    // Initialize new draft
                    const newClaim = await createDraftClaim(policyNo, conversationId);
                    setClaim(newClaim);
                } catch (e) {
                    alert('无法创建报案草稿：' + (e as Error).message);
                }
            } else {
                // Do nothing or alert only if explicit intent?
                // alert('无效的保单号或参数缺失');
            }
        };
        init();
    }, [searchParams]);

    const handleFieldChange = async (field: keyof ClaimCase, value: any) => {
        if (!claim) return;
        // Optimistic update or wait?
        // Let's wait for safety with backend
        try {
            const updated = await updateClaimField(claim.claimId, field, value);
            setClaim(updated);
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpload = async (fileName: string) => {
        if (!claim) return;
        try {
            const updated = await addAttachment(claim.claimId, fileName);
            setClaim(updated);
        } catch (e) {
            alert('上传失败');
        }
    };

    const handleSubmit = async () => {
        if (!claim) return;
        setLoading(true);
        try {
            const updated = await submitClaim(claim.claimId);
            setClaim(updated);
        } catch (e) {
            alert('提交失败：' + (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (!claim) return <div className="p-10 text-center text-slate-400">正在初始化报案中心...</div>;

    const showProcessEntry = [
        ClaimState.SUBMITTED,
        ClaimState.UNDER_REVIEW, // Sync with type definition
        ClaimState.UNDER_REVIEW,    // Legacy/Typo Safety
        ClaimState.NEEDS_MORE_INFO,
        ClaimState.CLOSED,
        ClaimState.ACCEPTED,
        ClaimState.REJECTED
    ].includes(claim.state as any);

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
                            to={`/claim-process-hub?claimId=${claim.claimId}`}
                            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                            点击查看理赔进度
                        </Link>
                    </div>
                )}
                {/* Only allow editing form in DRAFT/NEEDS_MORE_INFO states */}
                {(claim.state === ClaimState.DRAFT || claim.state === ClaimState.NEEDS_MORE_INFO || claim.state === ClaimState.READY_TO_SUBMIT) && (
                    <>
                        <ClaimForm claim={claim} onChange={handleFieldChange} />
                        <ClaimUploadSection claim={claim} onUpload={handleUpload} />
                    </>
                )}

                <ClaimSummary claim={claim} onSubmit={handleSubmit} loading={loading} />
                <ClaimHistory claim={claim} />
            </div>
        </div>
    );
};

export default ClaimCenter;
