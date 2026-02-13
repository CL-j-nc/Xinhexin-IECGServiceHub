import React from 'react';
import { ClaimState } from '../../services/claim/claim.types';

interface ClaimStepBarProps {
    state: ClaimState;
}

const STEPS = [
    { label: '报案', icon: 'fa-file-signature' }, // Report
    { label: '审核', icon: 'fa-clipboard-check' }, // Review
    { label: '查勘', icon: 'fa-magnifying-glass' }, // Investigate
    { label: '赔付', icon: 'fa-hand-holding-dollar' }, // Pay
    { label: '结案', icon: 'fa-flag-checkered' }, // Close
];

const ClaimStepBar: React.FC<ClaimStepBarProps> = ({ state }) => {
    // Map state to step index
    // 0: DRAFT, READY_TO_SUBMIT, SUBMITTED
    // 1: UNDER_REVIEW, NEEDS_MORE_INFO
    // 2: ACCEPTED
    // 3: (No direct mapping, maybe imply passing through)
    // 4: CLOSED, REJECTED

    let currentStep = 0;
    switch (state) {
        case ClaimState.DRAFT:
        case ClaimState.READY_TO_SUBMIT:
        case ClaimState.SUBMITTED:
            currentStep = 0;
            break;
        case ClaimState.UNDER_REVIEW:
        case ClaimState.NEEDS_MORE_INFO:
            currentStep = 1;
            break;
        case ClaimState.ACCEPTED:
            currentStep = 2; // Assuming Accepted starts Investigation
            break;
        // No direct state for Pay, so we might skip to Close or stay at Investigate
        case ClaimState.CLOSED:
        case ClaimState.REJECTED:
            currentStep = 4;
            break;
        default:
            currentStep = 0;
    }

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
                
                {/* Active Line (Progress) */}
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    
                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center group">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 border-2 
                                    ${isCompleted 
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' 
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }
                                    ${isCurrent ? 'scale-110 ring-4 ring-emerald-50' : ''}
                                `}
                            >
                                <i className={`fa-solid ${step.icon}`}></i>
                            </div>
                            <span 
                                className={`mt-2 text-xs font-medium transition-colors duration-300
                                    ${isCompleted ? 'text-emerald-700' : 'text-slate-400'}
                                    ${isCurrent ? 'font-bold' : ''}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClaimStepBar;
