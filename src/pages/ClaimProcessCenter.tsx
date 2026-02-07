import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClaimProcessHeader from '../components/claim-process/ClaimProcessHeader';
import ClaimProcessStatusExplanation from '../components/claim-process/ClaimProcessStatusExplanation';
import ClaimProcessTimeline from '../components/claim-process/ClaimProcessTimeline';
import ClaimProcessMaterials from '../components/claim-process/ClaimProcessMaterials';
import ClaimProcessAttachments from '../components/claim-process/ClaimProcessAttachments';
import ClaimProcessFooterNote from '../components/claim-process/ClaimProcessFooterNote';
import { ClaimState } from '../services/claim/claim.types';
import { getClaim } from '../services/claimService';
import { ClaimProcess } from '../services/claim-process/claimProcess.types';
import {
    ensureClaimProcessForClaim,
    uploadClaimProcessMaterial
} from '../services/claim-process/claimProcessService';

const eligibleClaimStates = new Set<string>([
    ClaimState.SUBMITTED,
    ClaimState.UNDER_REVIEW,
    ClaimState.NEEDS_MORE_INFO,
    ClaimState.CLOSED,
    ClaimState.ACCEPTED,
    ClaimState.REJECTED
]);

const ClaimProcessCenter: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [process, setProcess] = useState<ClaimProcess | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const claimId = searchParams.get('claimId');
        if (!claimId) {
            setError('缺少报案编号，无法加载理赔流程。');
            return;
        }

        const init = async () => {
            try {
                // Get Claim first to verify state
                const claim = await getClaim(claimId);
                if (!eligibleClaimStates.has(claim.state)) {
                    // If DRAFT, not eligible
                    setError('该案件仍在报案填写阶段或不满足理赔查询条件。');
                    return;
                }

                // Get Process
                const currentProcess = await ensureClaimProcessForClaim(claimId);
                if (!currentProcess) {
                    setError('无法加载理赔流程信息。');
                    return;
                }
                setProcess(currentProcess);
                setError(null);
            } catch (e) {
                setError('系统错误，无法查询。');
            }
        };
        init();
    }, [searchParams]);

    const handleUpload = async (materialId: string, fileName: string) => {
        if (!process) return;
        try {
            const updated = await uploadClaimProcessMaterial(process.claimId, materialId, fileName);
            if (updated) setProcess(updated);
        } catch (e) {
            alert('上传失败');
        }
    };

    if (error) {
        return <div className="min-h-screen bg-[#FDFDFD] p-10 text-center text-slate-400">{error}</div>;
    }

    if (!process) {
        return <div className="min-h-screen bg-[#FDFDFD] p-10 text-center text-slate-400">正在加载理赔流程...</div>;
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-6">
                <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">ClaimProcessHub</p>
                    <h1 className="text-2xl font-medium text-slate-800">团体客户理赔中心</h1>
                    <p className="text-sm text-slate-500">理赔流程可视化与协同处理中心</p>
                </div>
                <ClaimProcessHeader
                    processId={process.processId}
                    claimId={process.claimId}
                    state={process.state}
                    stateText={process.stateText}
                />
                <ClaimProcessStatusExplanation
                    stateText={process.stateText}
                    stateDescription={process.stateDescription}
                    nextStepHint={process.nextStepHint}
                />
                <ClaimProcessTimeline timeline={process.timeline} />
                <ClaimProcessMaterials materials={process.requiredMaterials} onUpload={handleUpload} />
                <ClaimProcessAttachments attachments={process.attachments} />
                <ClaimProcessFooterNote />
            </div>
        </div>
    );
};

export default ClaimProcessCenter;
