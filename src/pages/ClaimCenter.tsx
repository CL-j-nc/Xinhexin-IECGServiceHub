import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ClaimEntry from '../components/claim/ClaimEntry';
import ClaimStatusBanner from '../components/claim/ClaimStatusBanner';
import ClaimForm from '../components/claim/ClaimForm';
import ClaimUploadSection from '../components/claim/ClaimUploadSection';
import ClaimSummary from '../components/claim/ClaimSummary';
import ClaimHistory from '../components/claim/ClaimHistory';
import ClaimStepBar from '../components/claim/ClaimStepBar';
import { createDraftClaim, updateClaimField, addAttachment, submitClaim, getClaim } from '../services/claimService';
import { ClaimCase, ClaimState } from '../services/claim/claim.types';

const ClaimCenter: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [claim, setClaim] = useState<ClaimCase | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    useEffect(() => {
        const policyNo = searchParams.get('policyNo');
        const conversationId = searchParams.get('conversationId') || undefined;
        const existingClaimId = searchParams.get('claimId'); // Support loading existing

        const init = async () => {
            if (existingClaimId) {
                try {
                    const data = await getClaim(existingClaimId);
                    setClaim(data);
                } catch (e) {
                    alert('无法加载报案记录');
                }
                return;
            }

            if (policyNo && /^(65|66)\d+$/.test(policyNo)) {
                try {
                    // Initialize new draft
                    const newClaim = await createDraftClaim(policyNo, conversationId);
                    setClaim(newClaim);
                } catch (e) {
                    alert('无法创建报案草稿：' + (e as Error).message);
                }
            } else {
                // Do nothing or alert only if explicit intent?
                // alert('无效的保单号或参数缺失');
            }
        };
        init();
    }, [searchParams]);

    const handleFieldChange = async (field: keyof ClaimCase, value: any) => {
        if (!claim) return;
        try {
            const updated = await updateClaimField(claim.claimId, field, value);
            setClaim(updated);
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpload = async (fileName: string) => {
        if (!claim) return;
        try {
            const updated = await addAttachment(claim.claimId, fileName);
            setClaim(updated);
        } catch (e) {
            alert('上传失败');
        }
    };

    const handleSubmit = async () => {
        if (!claim) return;
        setLoading(true);
        try {
            const updated = await submitClaim(claim.claimId);
            setClaim(updated);
        } catch (e) {
            alert('提交失败：' + (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleNewClaim = () => {
        if (claim?.policyNo) {
            // clear claimId, keep policyNo
            const newParams = new URLSearchParams();
            newParams.set('policyNo', claim.policyNo);
            if (claim.conversationId) newParams.set('conversationId', claim.conversationId);
            setSearchParams(newParams);
            setClaim(null); // Clear current claim to trigger re-init
        }
    };

    if (!claim) return <div className="min-h-screen flex items-center justify-center text-slate-400">正在初始化报案中心...</div>;

    const showProcessEntry = [
        ClaimState.SUBMITTED,
        ClaimState.UNDER_REVIEW,
        ClaimState.NEEDS_MORE_INFO,
        ClaimState.CLOSED,
        ClaimState.ACCEPTED,
        ClaimState.REJECTED
    ].includes(claim.state);

    const isEditable = claim.state === ClaimState.DRAFT || claim.state === ClaimState.NEEDS_MORE_INFO || claim.state === ClaimState.READY_TO_SUBMIT;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-700 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Card: Policy Info & Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <ClaimEntry policyNo={claim.policyNo} conversationId={claim.conversationId} />
                    <button 
                        onClick={handleNewClaim}
                        className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i>
                        发起新报案
                    </button>
                </div>

                {/* Progress Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <i className="fa-solid fa-chart-line text-emerald-500"></i>
                            当前进度
                        </h2>
                        {showProcessEntry && (
                             <Link
                                to={`/claim-process-hub?claimId=${claim.claimId}`}
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                            >
                                查看详细流程 <i className="fa-solid fa-chevron-right text-xs"></i>
                            </Link>
                        )}
                    </div>

                    <ClaimStepBar state={claim.state} />
                    <ClaimStatusBanner state={claim.state} />
                </div>

                {/* Details & History Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'details' ? 'text-emerald-700 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            报案详情
                            {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'history' ? 'text-emerald-700 bg-emerald-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                            历史记录
                            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500"></div>}
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'details' ? (
                            <div className="space-y-6">
                                <ClaimForm claim={claim} onChange={handleFieldChange} />
                                <ClaimUploadSection claim={claim} onUpload={handleUpload} />
                                {isEditable && (
                                    <ClaimSummary claim={claim} onSubmit={handleSubmit} loading={loading} />
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300">
                                <ClaimHistory claim={claim} />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClaimCenter;
