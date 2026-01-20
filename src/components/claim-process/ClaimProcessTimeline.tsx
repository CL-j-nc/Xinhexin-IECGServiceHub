import React from 'react';
import { ClaimProcessTimelineEntry } from '../../services/claim-process/claimProcess.types';

interface Props {
    timeline: ClaimProcessTimelineEntry[];
}

const ClaimProcessTimeline: React.FC<Props> = ({ timeline }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-lg p-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">理赔时间轴</p>
            {timeline.length === 0 ? (
                <p className="text-sm text-slate-400 mt-4">暂无可展示的关键节点。</p>
            ) : (
                <div className="mt-5 space-y-6 border-l border-slate-100 ml-2 pl-6">
                    {timeline.map((entry, index) => (
                        <div key={`${entry.timestamp}-${index}`} className="relative">
                            <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                            <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                            <p className="text-sm text-slate-700 mt-1">{entry.description}</p>
                            <span className="inline-flex items-center text-[10px] text-slate-400 mt-2">
                                {entry.actor}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClaimProcessTimeline;
