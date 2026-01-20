import { ClaimCase, ClaimState, ClaimTimelineEvent } from './claim.types';

const TRANSITIONS: Record<ClaimState, ClaimState[]> = {
    [ClaimState.DRAFT]: [ClaimState.READY_TO_SUBMIT],
    [ClaimState.READY_TO_SUBMIT]: [ClaimState.SUBMITTED], // 提交后不可回退
    [ClaimState.SUBMITTED]: [ClaimState.IN_REVIEW],
    [ClaimState.IN_REVIEW]: [ClaimState.NEEDS_MORE_INFO, ClaimState.CLOSED, ClaimState.REJECTED],
    [ClaimState.NEEDS_MORE_INFO]: [ClaimState.IN_REVIEW],
    [ClaimState.CLOSED]: [],
    [ClaimState.REJECTED]: []
};

export function canTransition(currentState: ClaimState, targetState: ClaimState): boolean {
    // 特殊处理：表单校验不通过时，READY_TO_SUBMIT 可退回 DRAFT (虽然状态机图主要描述正向，但编辑行为会导致状态回退)
    // 严格按照指令：SUBMITTED 之后不得回到 READY_TO_SUBMIT。
    // 这里的 TRANSITIONS 定义了严格的正向流转。
    // 若需回退到 DRAFT (如用户清空了必填项)，在业务逻辑中处理，这里仅校验正向或特定允许的流转。
    if (currentState === ClaimState.READY_TO_SUBMIT && targetState === ClaimState.DRAFT) return true;

    const allowed = TRANSITIONS[currentState];
    return allowed ? allowed.includes(targetState) : false;
}

export function transition(claim: ClaimCase, targetState: ClaimState, actor: string = 'SYSTEM', description: string = ''): ClaimCase {
    if (!canTransition(claim.state, targetState)) {
        console.warn(`[ClaimStateMachine] Invalid transition: ${claim.state} -> ${targetState}`);
        return claim;
    }

    const now = Date.now();
    const event: ClaimTimelineEvent = {
        timestamp: now,
        action: `TRANSITION_${targetState}`,
        description: description || `State changed to ${targetState}`,
        actor
    };

    return {
        ...claim,
        state: targetState,
        updatedAt: now,
        timeline: [...claim.timeline, event]
    };
}