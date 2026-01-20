import { ClaimCase, ClaimState } from './claim.types';
import { transition } from './claimStateMachine';
import { ensureClaimProcessForClaim } from './claim-process/claimProcessService';
import { addMessage } from './conversationService';
import { MessageRole } from './conversation.types';

// In-memory mock store
let claimsStore: Record<string, ClaimCase> = {};

export const createDraftClaim = (policyNo: string, conversationId?: string): ClaimCase => {
    const now = Date.now();
    const id = `CLM-${now}-${Math.floor(Math.random() * 10000)}`;
    const newClaim: ClaimCase = {
        claimId: id,
        createdAt: now,
        updatedAt: now,
        state: ClaimState.DRAFT,
        policyNo,
        conversationId,
        attachments: [],
        timeline: [{
            timestamp: now,
            action: 'CREATED',
            description: 'Draft claim initialized',
            actor: 'USER'
        }]
    };
    claimsStore[id] = newClaim;
    return newClaim;
};

export const updateClaimField = (claimId: string, field: keyof ClaimCase, value: any): ClaimCase => {
    const claim = claimsStore[claimId];
    if (!claim) throw new Error('Claim not found');

    // 禁止在提交后修改关键字段
    if (claim.state !== ClaimState.DRAFT && claim.state !== ClaimState.READY_TO_SUBMIT && claim.state !== ClaimState.NEEDS_MORE_INFO) {
        return claim;
    }

    const updated = { ...claim, [field]: value, updatedAt: Date.now() };

    // 简易校验逻辑：检查必填项
    const isComplete = !!(
        updated.policyNo &&
        updated.accidentType &&
        updated.accidentDateTime &&
        updated.accidentLocation &&
        updated.accidentDescription &&
        updated.reporterName &&
        updated.reporterContact
    );

    if (updated.state === ClaimState.DRAFT && isComplete) {
        return transition(updated, ClaimState.READY_TO_SUBMIT, 'SYSTEM', 'All required fields filled');
    } else if (updated.state === ClaimState.READY_TO_SUBMIT && !isComplete) {
        // 回退到 Draft
        updated.state = ClaimState.DRAFT;
    }

    claimsStore[claimId] = updated;
    return updated;
};

export const addAttachment = (claimId: string, fileName: string): ClaimCase => {
    const claim = claimsStore[claimId];
    if (!claim) return claim; // Should throw
    const updated = { ...claim, attachments: [...claim.attachments, fileName], updatedAt: Date.now() };
    claimsStore[claimId] = updated;
    return updated;
};

export const submitClaim = (claimId: string): ClaimCase => {
    let claim = claimsStore[claimId];
    if (!claim) throw new Error('Claim not found');

    if (claim.state === ClaimState.READY_TO_SUBMIT || claim.state === ClaimState.NEEDS_MORE_INFO) {
        claim = transition(claim, ClaimState.SUBMITTED, 'USER', 'User submitted claim');
        ensureClaimProcessForClaim(claim);

        // MVP: Auto transition to IN_REVIEW
        setTimeout(() => {
            const current = claimsStore[claimId];
            if (current && current.state === ClaimState.SUBMITTED) {
                const updated = transition(current, ClaimState.IN_REVIEW, 'SYSTEM', 'Auto-processed to review');
                claimsStore[claimId] = updated;
                ensureClaimProcessForClaim(updated);
            }
        }, 1500);

        // Conversation Integration
        if (claim.conversationId) {
            addMessage(claim.conversationId, {
                id: Date.now().toString(),
                conversationId: claim.conversationId,
                role: MessageRole.SYSTEM,
                content: `已为您创建报案单：${claim.claimId}。报案已提交，进入处理中状态。后续如需补充材料，将在此会话提示。请保管好您的报案受理编号，后续可根据该编号查询您的案件理赔流程和进度。`,
                timestamp: new Date()
            });
        }
    }
    claimsStore[claimId] = claim;
    return claim;
};

export const getClaim = (claimId: string): ClaimCase | undefined => claimsStore[claimId];
export const listClaims = (): ClaimCase[] => Object.values(claimsStore);
