import { ClaimCase } from '../claim.types';
import { addMessage } from '../conversationService';
import { MessageRole } from '../conversation.types';
import { canTransition } from './claimProcessStateMachine';
import {
    ClaimProcess,
    ClaimProcessActor,
    ClaimProcessMaterial,
    ClaimProcessState,
    ClaimProcessTimelineEntry
} from './claimProcess.types';

const processStore: Record<string, ClaimProcess> = {};

const DEFAULT_MATERIALS: ClaimProcessMaterial[] = [
    {
        materialId: 'mat-accident-report/事故责任认定书',
        name: '事故证明/情况说明',
        description: '事故经过的书面说明或相关证明材料。',
        required: true,
        uploaded: false
    },
    {
        materialId: 'mat-insured-list',
        name: '被保险人名单或身份证明',
        description: '第一受益人组成人员的身份证明或企业员工名单。',
        required: true,
        uploaded: false
    },
    {
        materialId: 'mat-medical-bills',
        name: '医疗/费用票据',
        description: '医疗费用清单或相关票据复印件。',
        required: false,
        uploaded: false
    }
];

const STATE_COPY: Record<ClaimProcessState, { stateText: string; stateDescription: string; nextStepHint?: string }> = {
    [ClaimProcessState.CLAIM_ACCEPTED]: {
        stateText: '报案已受理',
        stateDescription: '报案信息已进入理赔流程，系统正在建立理赔档案并预整理所需材料。',
        nextStepHint: '如需提前准备，可在下方上传材料，系统将继续审核。'
    },
    [ClaimProcessState.MATERIALS_REVIEWING]: {
        stateText: '理赔材料审核中',
        stateDescription: '理赔人员正在核对已提交材料的完整性与有效性。',
        nextStepHint: '请保持联系方式畅通，暂不需要操作。'
    },
    [ClaimProcessState.MATERIALS_REQUIRED]: {
        stateText: '需补充理赔材料',
        stateDescription: '为继续推进理赔，需要补充关键材料或证明文件。',
        nextStepHint: '请在下方上传所列材料，提交后将进入审核。'
    },
    [ClaimProcessState.UNDER_INVESTIGATION]: {
        stateText: '事故调查中',
        stateDescription: '案件进入事实核查与外部协查阶段，必要时会联系您补充说明。',
        nextStepHint: '请留意会话通知，如有新材料可提交。'
    },
    [ClaimProcessState.ASSESSING]: {
        stateText: '理赔责任与金额评估中',
        stateDescription: '理赔人员正在依据保单责任与事实材料评估责任范围。',
        nextStepHint: '无需操作，等待核定结果。'
    },
    [ClaimProcessState.APPROVED]: {
        stateText: '理赔已核定',
        stateDescription: '责任范围与金额已核定，流程进入赔付准备。',
        nextStepHint: '如需确认收款信息将另行提示。'
    },
    [ClaimProcessState.PAYMENT_IN_PROGRESS]: {
        stateText: '赔付处理中',
        stateDescription: '赔付流程正在处理，资金将在完成核对后入账。',
        nextStepHint: '请留意收款信息，如有变更请及时告知。'
    },
    [ClaimProcessState.COMPLETED]: {
        stateText: '理赔完成',
        stateDescription: '理赔流程已完成，相关结果已归档。',
        nextStepHint: '如需进一步帮助，可通过会话咨询。'
    },
    [ClaimProcessState.REJECTED]: {
        stateText: '理赔不予受理/拒赔',
        stateDescription: '经核查，本次理赔不符合受理条件或责任范围。具体原因可单独咨询理赔中心客服代表或您的企业保险管家，向其申取拒赔通知书和情况说明。',
        nextStepHint: '如需复核，请通过会话提交说明。'
    }
};

const STATE_TIMELINE_NOTE: Record<ClaimProcessState, string> = {
    [ClaimProcessState.CLAIM_ACCEPTED]: '系统建立理赔档案并受理报案。',
    [ClaimProcessState.MATERIALS_REVIEWING]: '进入材料审核阶段。',
    [ClaimProcessState.MATERIALS_REQUIRED]: '通知补充理赔材料。',
    [ClaimProcessState.UNDER_INVESTIGATION]: '进入事故调查阶段。',
    [ClaimProcessState.ASSESSING]: '进入责任与金额评估阶段。',
    [ClaimProcessState.APPROVED]: '理赔责任已核定。',
    [ClaimProcessState.PAYMENT_IN_PROGRESS]: '赔付流程启动。',
    [ClaimProcessState.COMPLETED]: '理赔流程结束。',
    [ClaimProcessState.REJECTED]: '理赔不予受理。'
};

const STATE_MESSAGES: Partial<Record<ClaimProcessState, string>> = {
    [ClaimProcessState.MATERIALS_REQUIRED]: '您的理赔已进入材料审核阶段，如需补充材料，将在此通知。',
    [ClaimProcessState.APPROVED]: '理赔已核定，正在进入赔付处理流程。',
    [ClaimProcessState.COMPLETED]: '理赔流程已完成，如需进一步协助请在此会话咨询。',
    [ClaimProcessState.REJECTED]: '经核查，本次理赔暂不予受理。如需复核，请在此会话补充说明。'
};

const cloneMaterials = (materials: ClaimProcessMaterial[]) =>
    materials.map(item => ({ ...item }));

const buildTimelineEntry = (state: ClaimProcessState, actor: ClaimProcessActor): ClaimProcessTimelineEntry => ({
    timestamp: Date.now(),
    actor,
    description: STATE_TIMELINE_NOTE[state]
});

const applyStateCopy = (state: ClaimProcessState) => ({
    stateText: STATE_COPY[state].stateText,
    stateDescription: STATE_COPY[state].stateDescription,
    nextStepHint: STATE_COPY[state].nextStepHint
});

const notifyConversation = (process: ClaimProcess, state: ClaimProcessState) => {
    if (!process.conversationId) return;
    const message = STATE_MESSAGES[state];
    if (!message) return;
    addMessage(process.conversationId, {
        id: Date.now().toString(),
        conversationId: process.conversationId,
        role: MessageRole.SYSTEM,
        content: message,
        timestamp: new Date()
    });
};

export const getClaimProcessByClaimId = (claimId: string): ClaimProcess | undefined => processStore[claimId];

export const createClaimProcessFromClaim = (claim: ClaimCase): ClaimProcess => {
    const now = Date.now();
    const processId = `CP-${now}-${Math.floor(Math.random() * 10000)}`;
    const initialState = ClaimProcessState.CLAIM_ACCEPTED;
    const process: ClaimProcess = {
        processId,
        claimId: claim.claimId,
        policyNo: claim.policyNo,
        conversationId: claim.conversationId,
        state: initialState,
        ...applyStateCopy(initialState),
        timeline: [buildTimelineEntry(initialState, 'SYSTEM')],
        requiredMaterials: cloneMaterials(DEFAULT_MATERIALS),
        attachments: [],
        createdAt: now,
        updatedAt: now
    };
    processStore[claim.claimId] = process;
    return process;
};

export const ensureClaimProcessForClaim = (claim: ClaimCase): ClaimProcess => {
    const existing = processStore[claim.claimId];
    if (existing) return existing;
    return createClaimProcessFromClaim(claim);
};

export const transitionClaimProcess = (
    claimId: string,
    targetState: ClaimProcessState,
    actor: ClaimProcessActor = 'SYSTEM'
): ClaimProcess => {
    const process = processStore[claimId];
    if (!process) throw new Error('Claim process not found');
    if (!canTransition(process.state, targetState)) return process;

    const timelineEntry = buildTimelineEntry(targetState, actor);
    const requiredMaterials =
        targetState === ClaimProcessState.MATERIALS_REQUIRED && process.requiredMaterials.length === 0
            ? cloneMaterials(DEFAULT_MATERIALS)
            : process.requiredMaterials;

    const updated: ClaimProcess = {
        ...process,
        state: targetState,
        ...applyStateCopy(targetState),
        requiredMaterials,
        updatedAt: timelineEntry.timestamp,
        timeline: [...process.timeline, timelineEntry]
    };

    processStore[claimId] = updated;
    notifyConversation(updated, targetState);
    return updated;
};

export const uploadClaimProcessMaterial = (
    claimId: string,
    materialId: string,
    fileName: string
): ClaimProcess => {
    const process = processStore[claimId];
    if (!process) throw new Error('Claim process not found');

    const updatedMaterials = process.requiredMaterials.map(material =>
        material.materialId === materialId ? { ...material, uploaded: true } : material
    );

    const updated: ClaimProcess = {
        ...process,
        requiredMaterials: updatedMaterials,
        attachments: [...process.attachments, fileName],
        updatedAt: Date.now()
    };

    processStore[claimId] = updated;
    return updated;
};
