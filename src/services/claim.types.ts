export enum ClaimState {
    DRAFT = 'DRAFT',
    READY_TO_SUBMIT = 'READY_TO_SUBMIT',
    SUBMITTED = 'SUBMITTED',
    IN_REVIEW = 'IN_REVIEW',
    NEEDS_MORE_INFO = 'NEEDS_MORE_INFO',
    CLOSED = 'CLOSED',
    REJECTED = 'REJECTED'
}

export interface ClaimTimelineEvent {
    timestamp: number;
    action: string;
    description: string;
    actor: string; // 'USER' | 'SYSTEM' | 'AGENT'
}

export interface ClaimCase {
    claimId: string;
    createdAt: number;
    updatedAt: number;
    state: ClaimState;
    policyNo: string; // 65/66 prefix
    conversationId?: string;
    insuredEntityName?: string;

    // 事故信息
    accidentType?: string;
    accidentDateTime?: string;
    accidentLocation?: string;
    accidentDescription?: string;
    reporterName?: string;
    reporterContact?: string;
    attachments: string[];
    timeline: ClaimTimelineEvent[];
}