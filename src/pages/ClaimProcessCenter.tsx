import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClaimProcessHeader from '../components/claim-process/ClaimProcessHeader';
import ClaimProcessStatusExplanation from '../components/claim-process/ClaimProcessStatusExplanation';
import ClaimProcessTimeline from '../components/claim-process/ClaimProcessTimeline';
import ClaimProcessMaterials from '../components/claim-process/ClaimProcessMaterials';
import ClaimProcessAttachments from '../components/claim-process/ClaimProcessAttachments';
import ClaimProcessFooterNote from '../components/claim-process/ClaimProcessFooterNote';
import { ClaimState } from '../services/claim/claim.types';
import { getClaim } from '../services/claim/claimService';
import { ClaimProcess } from '../services/claim-process/claimProcess.types';
import {
    ensureClaimProcessForClaim,
    getClaimProcessByClaimId,
    uploadClaimProcessMaterial
} from '../services/claim-process/claimProcessService';

const eligibleClaimStates = new Set<ClaimState>([
    ClaimState.SUBMITTED,
    ClaimState.IN_REVIEW,
    ClaimState.NEEDS_MORE_INFO,
    ClaimState.CLOSED,
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

        let currentProcess = getClaimProcessByClaimId(claimId);
        if (!currentProcess) {
            const claim = getClaim(claimId);
            if (!claim) {
                setError('未找到关联的报案信息。');
                return;
            }
            if (!eligibleClaimStates.has(claim.state)) {
                setError('该案件仍在案件审核周期中，尚未进入理赔流程，请耐心等待案件流程顺序提示后再尝试理赔查询。');
                return;
            }
            currentProcess = ensureClaimProcessForClaim(claim);
        }

        setError(null);
        setProcess({ ...currentProcess });
    }, [searchParams]);

    const handleUpload = (materialId: string, fileName: string) => {
        if (!process) return;
        const updated = uploadClaimProcessMaterial(process.claimId, materialId, fileName);
        setProcess({ ...updated });
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
