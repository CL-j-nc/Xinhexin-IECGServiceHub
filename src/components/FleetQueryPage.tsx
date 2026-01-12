import React, { useState, useEffect } from 'react';
import { verifyPolicy } from '../services/policyEngine';
import { PolicyVerifyResult } from '../services/policyEngine.types.ts';
import { FAQ_CONFIG } from '../constants/faq.config';

interface FleetQueryPageProps {
    onBack: () => void;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    ACTIVE: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: 'fa-check-circle'
    },
    EXPIRED: {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        border: 'border-rose-300',
        icon: 'fa-calendar-times'
    },
    PENDING: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: 'fa-file-signature'
    },
    NOT_FOUND: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        icon: 'fa-question-circle'
    }
};

const FleetQueryPage: React.FC<FleetQueryPageProps> = ({ onBack }) => {
    const [policyId, setPolicyId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PolicyVerifyResult | null>(null);
    const [error, setError] = useState<string>('');
    const [formatValid, setFormatValid] = useState<boolean | null>(null);
    const [showStatusFlow, setShowStatusFlow] = useState(false);
    const [showPreservationMenu, setShowPreservationMenu] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

    const validateFormat = (id: string) => /^(65|66)\d+$/.test(id.trim());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPolicyId(val);

        const isValid = validateFormat(val);
        setFormatValid(val === '' ? null : isValid);

        if (result || error) {
            setResult(null);
            setError('');
            setShowStatusFlow(false);
            setShowPreservationMenu(false);
            setExpandedFAQ(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = policyId.trim();

        if (!trimmed) {
            setError('请输入保单号');
            setFormatValid(false);
            return;
        }

        if (!validateFormat(trimmed)) {
            setError('保单号格式错误，应以 65 或 66 开头，后接数字');
            setFormatValid(false);
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        setShowStatusFlow(false);
        setShowPreservationMenu(false);

        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

        try {
            const verifyResult = await verifyPolicy(trimmed);
            setResult(verifyResult);

            if (verifyResult.success) {
                setShowStatusFlow(true);
            } else {
                setError(verifyResult.systemMessage || '核验未通过');
            }
        } catch {
            setError('核验服务暂时不可用');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !loading && policyId.trim() && document.activeElement?.tagName === 'INPUT') {
                handleSubmit(e as any);
            }
        };
        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
    }, [policyId, loading]);

    const toggleFAQ = (id: string) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    const status = result?.status ?? 'NOT_FOUND';
    const style = STATUS_STYLE[status] ?? STATUS_STYLE.NOT_FOUND;

    const allowExtension = result?.allowBusinessExtension ?? false;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-emerald-900 text-white px-5 py-4 flex items-center shadow-md sticky top-0 z-50">
                <button
                    onClick={onBack}
                    className="mr-5 p-2.5 hover:bg-emerald-800/60 rounded-full transition-colors"
                    aria-label="返回"
                >
                    <i className="fa-solid fa-arrow-left text-lg"></i>
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-wide">保单真实性核验</h1>
                    <p className="text-xs text-emerald-200/90">大宗团体商业车险系统</p>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-5 py-8 max-w-4xl">
                <section className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 mb-10">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">保单状态核验</h2>
                    <p className="text-slate-500 mb-8 text-[15px]">
                        输入保单号进行系统实时校验
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <i className={`fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 ${formatValid === null ? 'text-slate-400' :
                                formatValid ? 'text-emerald-500' : 'text-red-500'
                                } pointer-events-none transition-colors`}></i>
                            <input
                                type="text"
                                value={policyId}
                                onChange={handleChange}
                                placeholder="6612345678"
                                maxLength={16}
                                autoComplete="off"
                                className={`
                  w-full pl-12 pr-5 py-4 rounded-xl border text-lg font-mono tracking-wide
                  focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white
                  transition-all duration-200
                  ${formatValid === false && policyId ? 'border-red-400 bg-red-50/30' : 'border-slate-200 bg-slate-50'}
                  disabled:opacity-60
                `}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !policyId.trim() || formatValid === false}
                            className={`
                min-w-[140px] px-8 py-4 rounded-xl font-bold text-white
                flex items-center justify-center gap-2.5 shadow-md transition-all
                ${loading
                                    ? 'bg-emerald-700/60 cursor-wait'
                                    : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900'}
                disabled:opacity-55 cursor-not-allowed
              `}
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    核验中
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-shield-check"></i>
                                    核验
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-3 text-sm">
                            <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                            <div>
                                <div className="font-semibold">核验未通过</div>
                                <div>{error}</div>
                            </div>
                        </div>
                    )}
                </section>

                {result && (
                    <section className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-10">
                        <div className={`px-8 py-6 ${style.bg} border-b ${style.border}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs uppercase tracking-wider font-bold text-slate-600 mb-1">
                                        核验结果 · {new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800">
                                        {result.policy?.orgName || '—'}
                                    </h3>
                                    <div className="text-sm text-slate-600 mt-1">
                                        {result.policy?.productName || result.systemMessage}
                                    </div>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold border shadow-sm ${style.bg} ${style.text} ${style.border}`}>
                                    <i className={`fa-solid ${style.icon}`}></i>
                                    {result.policy?.statusLabel || status}
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {result.policy && (
                                <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-7 mb-10">
                                    <div>
                                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">保单号</dt>
                                        <dd className="font-mono text-xl font-semibold text-slate-800">{result.policy.policyNo}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">保险起止</dt>
                                        <dd className="font-mono text-lg text-slate-800">
                                            {result.policy.startDate} → {result.policy.endDate}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">组织名称</dt>
                                        <dd className="text-lg text-slate-800">{result.policy.orgName}</dd>
                                    </div>
                                </dl>
                            )}

                            {result.coverages && result.coverages.length > 0 && (
                                <div className="mb-10">
                                    <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">承保明细</h4>
                                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-600">
                                                <tr>
                                                    <th className="px-6 py-3.5 text-left font-medium">险种</th>
                                                    <th className="px-6 py-3.5 text-left font-medium">保额</th>
                                                    <th className="px-6 py-3.5 text-right font-medium">单位</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {result.coverages.map((item, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="px-6 py-4 text-slate-800">{item.name}</td>
                                                        <td className="px-6 py-4 text-slate-600">{item.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right text-slate-600">{item.unit || '元'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {showStatusFlow && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-5">
                                        当前所处阶段
                                    </h4>
                                    <div className="relative">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 justify-between">
                                            <div className="flex-1 text-center">
                                                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-300'
                                                    }`}>
                                                    1
                                                </div>
                                                <div className="text-sm font-medium">核保通过</div>
                                                <div className="text-xs text-slate-500 mt-1">已完成</div>
                                            </div>

                                            <div className="hidden md:block flex-1 h-0.5 bg-slate-200 relative top-7">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <i className="fa-solid fa-arrow-right text-slate-400"></i>
                                                </div>
                                            </div>

                                            <div className="flex-1 text-center">
                                                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${status === 'PENDING' ? 'bg-amber-600' : status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-300'
                                                    }`}>
                                                    2
                                                </div>
                                                <div className="text-sm font-medium">保全/批改处理</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {status === 'PENDING' ? '当前阶段' : status === 'ACTIVE' ? '已完成' : '未进入'}
                                                </div>
                                            </div>

                                            <div className="hidden md:block flex-1 h-0.5 bg-slate-200 relative top-7">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <i className="fa-solid fa-arrow-right text-slate-400"></i>
                                                </div>
                                            </div>

                                            <div className="flex-1 text-center">
                                                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-300'
                                                    }`}>
                                                    3
                                                </div>
                                                <div className="text-sm font-medium">保单生效</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {status === 'ACTIVE' ? '当前阶段' : '待生效'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 px-8 py-5 border-t flex flex-wrap justify-end gap-4">
                            {result.documents?.electronicPolicyAvailable && (
                                <button
                                    type="button"
                                    disabled={!result.documents.pdfUrl}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fa-solid fa-file-pdf"></i>
                                    下载电子保单
                                </button>
                            )}

                            {allowExtension && status === 'ACTIVE' && (
                                <button
                                    type="button"
                                    onClick={() => setShowPreservationMenu(!showPreservationMenu)}
                                    className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-file-signature"></i>
                                    保单保全
                                </button>
                            )}
                        </div>

                        {showPreservationMenu && status === 'ACTIVE' && (
                            <div className="border-t border-slate-200 bg-slate-50/70 px-8 py-6">
                                <h4 className="text-base font-bold text-slate-800 mb-5">保单保全服务</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <button disabled className="p-4 bg-white border border-slate-200 rounded-xl text-left disabled:opacity-60 disabled:cursor-not-allowed">
                                        <div className="font-medium text-slate-800">申请保单保全</div>
                                        <div className="text-xs text-slate-500 mt-1">新增/变更/删除保障项目</div>
                                    </button>

                                    <button disabled className="p-4 bg-white border border-slate-200 rounded-xl text-left disabled:opacity-60 disabled:cursor-not-allowed">
                                        <div className="font-medium text-slate-800">保单保全申请记录</div>
                                        <div className="text-xs text-slate-500 mt-1">查看历史保全申请</div>
                                    </button>

                                    <button disabled className="p-4 bg-white border border-slate-200 rounded-xl text-left disabled:opacity-60 disabled:cursor-not-allowed">
                                        <div className="font-medium text-slate-800">查看保全及批改审核进度</div>
                                        <div className="text-xs text-slate-500 mt-1">实时跟踪处理状态</div>
                                    </button>
                                </div>

                                <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 text-sm text-slate-700">
                                    <p>该保单暂无保全或批改记录。</p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                <section className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">常见问题说明</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            系统权威解答，仅供参考，以核验结果为准
                        </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {FAQ_CONFIG.map((faq) => (
                            <div key={faq.id} className="px-8">
                                <button
                                    onClick={() => toggleFAQ(faq.id)}
                                    className="w-full py-5 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-medium text-slate-800">{faq.title}</span>
                                    <i className={`fa-solid ${expandedFAQ === faq.id ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-500 transition-transform`}></i>
                                </button>

                                {expandedFAQ === faq.id && (
                                    <div className="pb-6 animate-fade-in">
                                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                            <p className="font-bold text-emerald-800 text-lg leading-relaxed">
                                                {faq.response.layer1_authoritative}
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <ul className="space-y-3 text-slate-700">
                                                {faq.response.layer2_explanation.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <span className="text-emerald-600 mt-1 text-lg">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {faq.response.layer3_action.type === 'internal_link' && (
                                            <a
                                                href={faq.response.layer3_action.target}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                <i className="fa-solid fa-arrow-right"></i>
                                                {faq.response.layer3_action.label}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {!result && !loading && !error && (
                    <div className="text-center py-24 text-slate-400">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                            <i className="fa-solid fa-shield-halved text-5xl opacity-40"></i>
                        </div>
                        <p className="text-lg font-medium text-slate-500">等待核验</p>
                        <p className="mt-2 text-sm">输入保单号后系统将进行权威校验</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FleetQueryPage;
