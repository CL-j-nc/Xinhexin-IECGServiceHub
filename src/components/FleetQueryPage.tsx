import React, { useState, useEffect } from 'react';
import { verifyPolicy } from '../services/policyEngine'; // 假设已重命名/调整为 policyEngine
import { PolicyVerifyResult } from '../services/policyEngine.types'; // 如有类型文件则导入，否则内联

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
            setError('保单号格式错误，应以65或66开头后接数字');
            setFormatValid(false);
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        setShowStatusFlow(false);
        setShowPreservationMenu(false);

        // 模拟延迟
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
                    <h1 className="text-xl font-bold">保单真实性核验</h1>
                    <p className="text-xs opacity-80 mt-0.5">输入保单号进行系统核验</p>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-12 max-w-3xl">
                <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            <i className="fa-solid fa-hashtag absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                            <input
                                type="text"
                                value={policyId}
                                onChange={handleChange}
                                placeholder="# 660120120251102555668"
                                className={`w-full pl-12 pr-4 py-4 rounded-xl border transition-all outline-none
                  ${formatValid === false ? 'border-rose-300 bg-rose-50 focus:ring-2 focus:ring-rose-300' : ''}
                  ${formatValid === true ? 'border-emerald-300 bg-emerald-50 focus:ring-2 focus:ring-emerald-300' : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'}`}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !policyId.trim() || formatValid === false}
                            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
                            {loading ? '核验中...' : '核验'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 flex items-start gap-3">
                            <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                            <div>
                                <div className="font-medium">核验失败</div>
                                <div className="text-sm">{error}</div>
                            </div>
                        </div>
                    )}
                </section>

                {loading && (
                    <div className="mt-8 text-center py-12 bg-white rounded-2xl shadow-xl border border-slate-100">
                        <i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-500 mb-4"></i>
                        <p className="text-slate-700 font-medium">系统核验中...</p>
                    </div>
                )}

                {result && (
                    <section className="mt-8 space-y-8">
                        <div className={`rounded-2xl border ${style.border} overflow-hidden shadow-xl`}>
                            <div className={`px-8 py-6 ${style.bg} flex items-center gap-4`}>
                                <i className={`fa-solid ${style.icon} text-2xl ${style.text}`}></i>
                                <div>
                                    <h2 className={`text-xl font-bold ${style.text}`}>{result.systemMessage}</h2>
                                    <p className="text-sm opacity-80">状态码: {result.status}</p>
                                </div>
                            </div>
                            <div className="bg-white divide-y divide-slate-100">
                                <div className="px-8 py-5 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase">保单号</label>
                                        <p className="font-mono text-slate-800">{result.policy?.policyNo}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase">状态</label>
                                        <p className="text-slate-800">{result.policy?.statusLabel}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 uppercase">投保企业</label>
                                        <p className="text-slate-800 font-medium">{result.policy?.orgName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase">生效日期</label>
                                        <p className="text-slate-800">{result.policy?.startDate}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase">到期日期</label>
                                        <p className="text-slate-800">{result.policy?.endDate}</p>
                                    </div>
                                </div>
                                {result.coverages?.length > 0 && (
                                    <div className="px-8 py-5">
                                        <label className="text-xs text-slate-500 uppercase block mb-2">保障项目</label>
                                        <div className="space-y-2">
                                            {result.coverages.map((cov, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-slate-700">{cov.name}</span>
                                                    <span className="text-slate-800 font-mono">{cov.amount} {cov.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {result.documents?.electronicPolicyAvailable && result.documents.pdfUrl && (
                                    <div className="px-8 py-5">
                                        <label className="text-xs text-slate-500 uppercase block mb-2">电子保单</label>
                                        <a
                                            href={result.documents.pdfUrl}
                                            download
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                        >
                                            <i className="fa-solid fa-download"></i>
                                            下载 PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {showStatusFlow && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">保单状态流程</h2>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                                    <div className="space-y-6 pl-10">
                                        <div className="relative">
                                            <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">1</div>
                                            <p className="font-medium">投保申请提交</p>
                                            <p className="text-sm text-slate-500">系统记录初始信息</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
                                            <p className="font-medium">核保审核</p>
                                            <p className="text-sm text-slate-500">风险评估与确认</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-[-30px] top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">3</div>
                                            <p className="font-medium">保单生效</p>
                                            <p className="text-sm text-slate-500">保障正式启动</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {allowExtension && (
                            <section className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">保全与批改</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <button disabled className="p-4 bg-white border border-slate-200 rounded-xl text-left disabled:opacity-60 disabled:cursor-not-allowed">
                                        <div className="font-medium text-slate-800">提交保全申请</div>
                                        <div className="text-xs text-slate-500 mt-1">新增 / 变更 / 删除保障项目</div>
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
                            </section>
                        )}
                    </section>
                )}

                <section className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">常见问题说明</h2>
                        <p className="text-sm text-slate-500 mt-1">系统权威解答，仅供参考，以核验结果为准</p>
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