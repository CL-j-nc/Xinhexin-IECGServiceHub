import React from 'react';
import { ClaimCase } from '../../services/claim/claim.types';

const ClaimHistory: React.FC<{ claim: ClaimCase }> = ({ claim }) => {
    return (
        <div className="mt-8">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">流转记录</h4>
            <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-6 relative">
                {claim.timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                        <p className="text-xs text-slate-500 mb-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                        <p className="text-sm font-medium text-slate-700">{event.action}</p>
                        <p className="text-xs text-slate-400">{event.description} <span className="bg-slate-100 px-1 rounded text-[10px] ml-1">{event.actor}</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClaimHistory;