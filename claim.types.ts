export enum ClaimState {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
    // Legacy mapping or specific sub-states
    READY_TO_SUBMIT = 'READY_TO_SUBMIT', 
    NEEDS_MORE_INFO = 'NEEDS_MORE_INFO',
}

export enum ClaimProcessState {
    PENDING_REVIEW = 'PENDING_REVIEW',
    MATERIALS_REQUIRED = 'MATERIALS_REQUIRED',
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID',
}

export interface TimelineEntry {
    timestamp: number;
    action: string;
    description: string;
    actor: 'USER' | 'SYSTEM' | 'AGENT';
    stage?: string;
}

export interface Attachment {
    id: string;
    fileName: string;
    fileUrl?: string; // For frontend display if needed, though usually just ID/Name is stored
    uploadTime: number;
    type: string; // 'evidence' | 'material'
}

export interface ClaimCase {
    claimId: string;
    policyNo: string;
    conversationId?: string;
    state: ClaimState;
    
    // Accident Details
    accidentType?: 'LIFE' | 'MEDICAL' | 'ACCIDENT' | 'OTHER';
    accidentDateTime?: string;
    accidentLocation?: string;
    accidentDescription?: string;
    
    // Reporter Details
    reporterName?: string;
    reporterContact?: string;
    relationshipToInsured?: string;
    
    attachments: string[]; // List of filenames/keys
    timeline: TimelineEntry[];
    
    createdAt: number;
    updatedAt: number;
}

export interface Material {
    materialId: string;
    name: string;
    required: boolean;
    uploaded: boolean;
    uploadedAt?: string;
    fileName?: string;
    description?: string;
}

export interface ClaimResult {
    decision: 'APPROVED' | 'REJECTED';
    amount?: number;
    currency?: string;
    reason: string;
    paidAt?: string;
}

export interface ClaimProcess {
    processId: string;
    claimId: string;
    state: ClaimProcessState;
    stateText: string;
    stateDescription: string;
    nextStepHint: string;
    requiredMaterials: Material[];
    timeline: TimelineEntry[];
    attachments: string[];
    result?: ClaimResult;
    createdAt: number;
    updatedAt: number;
}
