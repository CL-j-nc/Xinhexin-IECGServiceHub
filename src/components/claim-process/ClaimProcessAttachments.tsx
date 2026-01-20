import React from 'react';

interface Props {
    attachments: string[];
}

const ClaimProcessAttachments: React.FC<Props> = ({ attachments }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-lg p-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">已上传材料</p>
            {attachments.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">暂无已上传材料。</p>
            ) : (
                <ul className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                        <li key={`${file}-${index}`} className="text-sm text-slate-600 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            <span className="truncate">{file}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ClaimProcessAttachments;
