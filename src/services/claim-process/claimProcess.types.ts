export enum ClaimProcessState {
    CLAIM_ACCEPTED = 'CLAIM_ACCEPTED',
    MATERIALS_REVIEWING = 'MATERIALS_REVIEWING',
    MATERIALS_REQUIRED = 'MATERIALS_REQUIRED',
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
    ASSESSING = 'ASSESSING',
    APPROVED = 'APPROVED',
    PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
}

export type ClaimProcessActor = 'SYSTEM' | 'STAFF';

export interface ClaimProcessTimelineEntry {
    timestamp: number;
    actor: ClaimProcessActor;
    description: string;
}

export interface ClaimProcessMaterial {
    materialId: string;
    name: string;
    description: string;
    required: boolean;
    uploaded: boolean;
}

export interface ClaimProcess {
    processId: string;
    claimId: string;
    policyNo: string;
    conversationId?: string;
    state: ClaimProcessState;
    stateText: string;
    stateDescription: string;
    nextStepHint?: string;
    timeline: ClaimProcessTimelineEntry[];
    requiredMaterials: ClaimProcessMaterial[];
    attachments: string[];
    createdAt: number;
    updatedAt: number;
}
