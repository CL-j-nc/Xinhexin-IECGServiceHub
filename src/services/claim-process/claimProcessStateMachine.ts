import { ClaimProcessState } from './claimProcess.types';

const PROCESS_FLOW: ClaimProcessState[] = [
    ClaimProcessState.CLAIM_ACCEPTED,
    ClaimProcessState.MATERIALS_REVIEWING,
    ClaimProcessState.MATERIALS_REQUIRED,
    ClaimProcessState.UNDER_INVESTIGATION,
    ClaimProcessState.ASSESSING,
    ClaimProcessState.APPROVED,
    ClaimProcessState.PAYMENT_IN_PROGRESS,
    ClaimProcessState.COMPLETED
];

export const canTransition = (currentState: ClaimProcessState, targetState: ClaimProcessState): boolean => {
    if (currentState === ClaimProcessState.COMPLETED || currentState === ClaimProcessState.REJECTED) {
        return false;
    }

    if (targetState === ClaimProcessState.REJECTED) {
        return currentState === ClaimProcessState.ASSESSING;
    }

    const currentIndex = PROCESS_FLOW.indexOf(currentState);
    const targetIndex = PROCESS_FLOW.indexOf(targetState);
    return targetIndex === currentIndex + 1;
};
