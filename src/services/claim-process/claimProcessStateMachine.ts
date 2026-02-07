import { ClaimProcessState } from './claimProcess.types';

const PROCESS_FLOW: ClaimProcessState[] = [
    ClaimProcessState.PENDING_REVIEW,
    ClaimProcessState.MATERIALS_REQUIRED,
    ClaimProcessState.UNDER_INVESTIGATION,
    ClaimProcessState.PENDING_APPROVAL,
    ClaimProcessState.APPROVED,
    ClaimProcessState.PAID
];

export const canTransition = (currentState: ClaimProcessState, targetState: ClaimProcessState): boolean => {
    if (currentState === ClaimProcessState.PAID || currentState === ClaimProcessState.REJECTED) {
        return false;
    }

    if (targetState === ClaimProcessState.REJECTED) {
        return currentState === ClaimProcessState.PENDING_APPROVAL || currentState === ClaimProcessState.UNDER_INVESTIGATION;
    }

    const currentIndex = PROCESS_FLOW.indexOf(currentState);
    const targetIndex = PROCESS_FLOW.indexOf(targetState);
    return targetIndex === currentIndex + 1;
};
