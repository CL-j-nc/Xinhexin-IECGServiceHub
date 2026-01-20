import React from 'react';
import { ClaimProcessMaterial } from '../../services/claim-process/claimProcess.types';

interface Props {
    materials: ClaimProcessMaterial[];
    onUpload: (materialId: string, fileName: string) => void;
}

const ClaimProcessMaterials: React.FC<Props> = ({ materials, onUpload }) => {
    return (
        <div className="bg-white border border-slate-100 rounded-lg p-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">材料清单</p>
            {materials.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">当前阶段无需您提供材料。</p>
            ) : (
                <div className="mt-5 space-y-4">
                    {materials.map(material => (
                        <div key={material.materialId} className="border border-slate-100 rounded-lg p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{material.name}</p>
                                    <p className="text-xs text-slate-400 mt-1">{material.description}</p>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium ${
                                        material.uploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {material.uploaded ? '已上传' : material.required ? '待上传(必交)' : '待上传(选填)'}
                                </span>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-2">上传材料</label>
                                <input
                                    type="file"
                                    disabled={material.uploaded}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        onUpload(material.materialId, file.name);
                                        event.currentTarget.value = '';
                                    }}
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-600 hover:file:bg-slate-200 disabled:opacity-60"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClaimProcessMaterials;
