import React, { useState } from 'react';
import {
  fetchPolicyLifecycle,
  isPolicyFormatValid,
  serviceHubConfig
} from '../services/policyEngine';
import type {
  PolicyLifecycleData,
  PolicyLifecycleStatus,
  PolicyDocument
} from '../services/policyEngine.types';
import {
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  LinkIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const LifecycleBadge = ({ status, text }: { status: PolicyLifecycleStatus; text: string }) => {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    EXPIRING_SOON: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    EXPIRED: 'bg-slate-50 text-slate-500 ring-slate-500/20',
    POLICY_ENDORSEMENT: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    POLICY_AMENDMENT: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    POLICY_REINSTATEMENT: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
    POLICY_AMENDMENT_DONE: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    OUT_OF_SERVICE_SCOPE: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  };

  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${styles[status] || styles.OUT_OF_SERVICE_SCOPE}`}>
      {text}
    </span>
  );
};

const ServiceHub: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [policyData, setPolicyData] = useState<PolicyLifecycleData | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const demoPolicyNumbers = ['65001', '65002', '65003', '65004', '65005'];

  const handleInputChange = (value: string) => {
    const nextVal = value.replace(/\D/g, '');
    setSearchVal(nextVal);

    if (!nextVal) {
      setInputError(null);
      return;
    }

    if (!isPolicyFormatValid(nextVal)) {
      setInputError("输入不符合团体保单编码规范 (65/66 开头)");
      return;
    }

    setInputError(null);
  };

  const handleQuery = async (val: string) => {
    if (!val) {
      setInputError(null);
      return;
    }

    if (!isPolicyFormatValid(val)) {
      setInputError("输入不符合团体保单编码规范 (65/66 开头)");
      return;
    }
    setInputError(null);
    setLoading(true);
    const data = await fetchPolicyLifecycle(val);
    setPolicyData(data);
    setView('DETAIL');
    setLoading(false);
  };

  const renderDetail = () => {
    if (!policyData) return null;
    const p = policyData.policy;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <button
          onClick={() => setView('LIST')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-700 transition-colors group"
        >
          <ArrowLeftIcon className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
          返回列表
        </button>

        <div className="bg-white border border-slate-100 p-6 sm:p-10 rounded-lg">
          {/* Fact Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-50 pb-8 mb-8">
            <div className="flex gap-5">
              <div className="h-14 w-14 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-emerald-600 stroke-1" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-medium text-slate-800">{policyData.statusText}</h3>
                  <LifecycleBadge status={policyData.status} text={policyData.statusText} />
                </div>
                <p className="text-sm text-slate-400 mt-1.5">保单编号：{p?.policyNo || searchVal}</p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Interpretation Segment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">服务说明</span>
                  <p className="text-base text-slate-600 leading-relaxed font-light">{policyData.statusDescription}</p>
                </div>
                {policyData.notice && (
                  <div className="bg-slate-50 border-l-2 border-emerald-500 p-4 flex gap-4">
                    <ExclamationTriangleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed">{policyData.notice}</p>
                  </div>
                )}
              </div>

              {/* Metrics Segment */}
              {policyData.metrics && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">关键指标</span>
                    <div className="grid grid-cols-2 gap-4">
                      {policyData.metrics.daysSinceEffective && (
                        <div className="bg-slate-50 p-4 rounded">
                          <p className="text-[10px] text-slate-400 uppercase">已生效天数</p>
                          <p className="text-lg font-medium text-slate-800 mt-1">{policyData.metrics.daysSinceEffective} 天</p>
                        </div>
                      )}
                      {policyData.metrics.daysToExpiry && (
                        <div className="bg-slate-50 p-4 rounded">
                          <p className="text-[10px] text-slate-400 uppercase">剩余有效期</p>
                          <p className="text-lg font-medium text-slate-800 mt-1">{policyData.metrics.daysToExpiry} 天</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Policy Info */}
            {p && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">投保人信息</span>
                    <p className="text-base text-slate-800 font-light">{p.holderName}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">保险产品</span>
                    <p className="text-base text-slate-800 font-light">{p.productName}</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">保险期间</span>
                    <p className="text-base text-slate-800 font-light">{p.startDate} 至 {p.endDate}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">保费 / 保额</span>
                    <p className="text-base text-slate-800 font-light">保费 {p.premium} / 保额 {p.sumInsured}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Repository */}
            {policyData.actions.canDownload && policyData.documents.length > 0 && (
              <div className="space-y-5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">数字资产库</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policyData.documents.map((doc: PolicyDocument, idx: number) => (
                    <a
                      key={idx}
                      href={doc.url}
                      download
                      className="group bg-slate-50 p-4 rounded flex items-start gap-4 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-emerald-200">
                        {doc.type === 'ORIGINAL' ? (
                          <DocumentTextIcon className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                        ) : (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-800">{doc.name}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{doc.type === 'ORIGINAL' ? '原始凭证' : '批改凭证'}</p>
                      </div>
                      <ArrowDownTrayIcon className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="space-y-12">
      {/* Search Area */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-300" />
        </div>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuery(searchVal)}
          className="w-full bg-white border border-slate-100 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          placeholder={serviceHubConfig.SEARCH_PLACEHOLDER}
        />
        {inputError && (
          <p className="absolute -bottom-6 left-0 text-[11px] text-rose-500">{inputError}</p>
        )}
      </div>

      {/* Demo List */}
      <div className="grid grid-cols-1 gap-5">
        {demoPolicyNumbers.map((id) => (
          <button
            key={id}
            onClick={() => handleQuery(id)}
            className="group bg-white border border-slate-100 p-6 rounded-lg text-left hover:border-emerald-100 hover:shadow-md hover:shadow-emerald-500/5 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-5">
                <div className="h-12 w-12 rounded bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                  <LinkIcon className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Policy ID: {id}</p>
                  <p className="text-base font-medium text-slate-800 mt-1">
                    {id === '65001' ? '中建三局第一建设工程' :
                      id === '65002' ? '顺丰速运（集团）有限公司' :
                        id === '65003' ? '北京字节跳动科技有限公司' : '团体业务记录查询中...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 ml-[68px] sm:ml-0">
                <LifecycleBadge
                  status={id === '65001' ? 'ACTIVE' : id === '65002' ? 'POLICY_AMENDMENT_DONE' : id === '65003' ? 'EXPIRING_SOON' : 'POLICY_ENDORSEMENT'}
                  text={id === '65001' ? '生效中' : id === '65002' ? '批改完成' : id === '65003' ? '即将到期' : '办理中'}
                />
                <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-600 transition-colors">进入中心 &rarr;</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Authority Banner */}
      <div className="bg-[#0f172a] rounded-xl p-8 text-white overflow-hidden relative group border border-slate-800">
        <BuildingOfficeIcon className="absolute -right-6 -bottom-6 h-40 w-40 text-white/[0.03] group-hover:scale-105 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-8">
          <div className="h-14 w-14 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <ShieldCheckIcon className="h-8 w-8 text-white stroke-2" />
          </div>
          <div className="space-y-3">
            <h4 className="text-base font-medium">系统存续权威性声明</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              本中心仅展示新核心团体保单存续数据，来源为承保核心权威库。
              95519 为集团通用热线，其查询权限与本中心隔离；两端结果不一致时，以本中心为团体保单权威依据。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16">
        <header className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {serviceHubConfig.TITLE}
            </h1>
            <div className="flex items-center gap-2">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                {serviceHubConfig.SUBTITLE}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white px-5 py-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] text-slate-300 uppercase tracking-tighter">Authorized Entity</p>
              <p className="text-xs font-semibold text-slate-800">团体机构高级授权客户</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold border-4 border-slate-50">
              GC
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Accessing Core Underwriting Assets...</p>
          </div>
        ) : (
          view === 'LIST' ? renderList() : renderDetail()
        )}
      </div>
    </div>
  );
};

export default ServiceHub;
