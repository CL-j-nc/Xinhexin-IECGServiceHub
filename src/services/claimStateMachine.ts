import { ClaimState } from './claim/claim.types';

export const CLAIM_FLOW: Record<ClaimState, { allowedActions: string[]; nextStates: ClaimState[] }> = {
    [ClaimState.DRAFT]: {
        allowedActions: ['UPDATE', 'SUBMIT'],
        nextStates: [ClaimState.DRAFT, ClaimState.SUBMITTED],
    },
    [ClaimState.SUBMITTED]: {
        allowedActions: ['REVIEW_START'],
        nextStates: [ClaimState.UNDER_REVIEW],
    },
    [ClaimState.UNDER_REVIEW]: {
        allowedActions: ['REQUEST_INFO', 'APPROVE', 'REJECT'],
        nextStates: [ClaimState.NEEDS_MORE_INFO, ClaimState.ACCEPTED, ClaimState.REJECTED],
    },
    [ClaimState.NEEDS_MORE_INFO]: {
        allowedActions: ['SUBMIT_INFO'],
        nextStates: [ClaimState.UNDER_REVIEW], // Goes back to review
    },
    [ClaimState.ACCEPTED]: {
        allowedActions: ['CLOSE'],
        nextStates: [ClaimState.CLOSED],
    },
    [ClaimState.REJECTED]: {
        allowedActions: ['CLOSE'],
        nextStates: [ClaimState.CLOSED],
    },
    [ClaimState.CLOSED]: {
        allowedActions: [],
        nextStates: [],
    },
    [ClaimState.READY_TO_SUBMIT]: { // Virtual state, usually treated as DRAFT
        allowedActions: ['SUBMIT', 'UPDATE'],
        nextStates: [ClaimState.SUBMITTED, ClaimState.DRAFT],
    }
};

export function canTransition(currentState: ClaimState, newState: ClaimState): boolean {
    const config = CLAIM_FLOW[currentState];
    if (!config) return false;
    return config.nextStates.includes(newState);
}

// Helper to update state locally (optimistic) or validate
export function validateStateChange(currentState: ClaimState, newState: ClaimState) {
    if (!canTransition(currentState, newState)) {
        throw new Error(`Invalid transition from ${currentState} to ${newState}`);
    }
}