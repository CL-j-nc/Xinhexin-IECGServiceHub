import React, { useState } from 'react';
import { queryPolicyDatabase } from '../services/mockDatabase';
import { PolicyData } from '../types';

interface FleetQueryPageProps {
  onBack: () => void;
}

const STATUS_MAP: Record<string, string> = {
  'Active': '有效',
  'Expired': '已过期',
  'Pending': '审核中'
};

const FleetQueryPage: React.FC<FleetQueryPageProps> = ({ onBack }) => {
  const [policyId, setPolicyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PolicyData | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await queryPolicyDatabase(policyId);
      if (data) {
        setResult(data);
      } else {
        setError('未找到该保单信息，请检查保单号 (例如: POL-8888)。');
      }
    } catch (err) {
      setError('系统繁忙，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col font-sans">
      {/* Header */}
      <div className="bg-emerald-900 text-white px-6 py-4 flex items-center shadow-lg sticky top-0 z-50">
        <button onClick={onBack} className="mr-6 hover:bg-emerald-800 p-2 rounded-full transition-colors group">
          <i className="fa-solid fa-arrow-left text-lg group-hover:-translate-x-1 transition-transform"></i>
        </button>
        <div>
            <h1 className="text-xl font-bold tracking-wide">车队保单查询</h1>
            <p className="text-xs text-emerald-300">大宗商业车险数据库</p>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">查询承保状态</h2>
            <p className="text-slate-500 mb-8">请输入商业车队保单号以查看实时承保详情。</p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <i className="fa-solid fa-file-contract absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        value={policyId}
                        onChange={(e) => setPolicyId(e.target.value)}
                        placeholder="请输入保单号 (例如: POL-8888)"
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl pl-12 pr-4 py-4 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-slate-700"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                    查询
                </button>
            </form>
            
            {error && (
                <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-fade-in-up">
                    <i className="fa-solid fa-circle-exclamation text-xl"></i>
                    <div>
                        <div className="font-bold text-sm">查询失败</div>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
            )}
        </div>

        {/* Result Card */}
        {result && (
            <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden animate-fade-in-up">
                <div className="bg-gradient-to-r from-emerald-50 to-white px-8 py-6 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-1">查询成功</div>
                        <h3 className="text-2xl font-bold text-slate-800">{result.companyName}</h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${result.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        <i className={`fa-solid ${result.status === 'Active' ? 'fa-check-circle' : 'fa-clock'} mr-2`}></i>
                        {STATUS_MAP[result.status] || result.status}
                    </span>
                </div>
                
                <div className="p-8">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">保单号码</label>
                            <div className="font-mono text-lg text-slate-800 font-semibold">{result.id}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">投保人 / 管理人</label>
                            <div className="text-lg text-slate-800">{result.holder}</div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">方案名称</label>
                            <div className="text-lg text-slate-800">{result.type}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">保险止期</label>
                            <div className="text-lg text-slate-800 font-mono">{result.expiryDate}</div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">车队规模</label>
                            <div className="text-lg text-slate-800 flex items-center gap-2">
                                <i className="fa-solid fa-truck text-emerald-500"></i>
                                {result.vehicleCount} 辆
                            </div>
                        </div>
                    </div>

                    {/* Coverage Detail Table */}
                    {result.coverages && result.coverages.length > 0 && (
                        <div className="mt-6">
                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3 block">承保方案明细</label>
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="px-5 py-3">险种名称</th>
                                            <th className="px-5 py-3">保额 / 限额</th>
                                            <th className="px-5 py-3 text-right">保费 (元)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {result.coverages.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-3 text-slate-700 font-medium">{item.name}</td>
                                                <td className="px-5 py-3 text-slate-600">{item.amount}</td>
                                                <td className="px-5 py-3 text-right font-mono text-emerald-600">{item.premium.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-emerald-50/50 border-t border-emerald-100">
                                        <tr>
                                            <td colSpan={2} className="px-5 py-3 text-emerald-700 font-bold text-right">总保费合计</td>
                                            <td className="px-5 py-3 text-right font-bold font-mono text-emerald-700">
                                                ¥ {result.coverages.reduce((sum, i) => sum + i.premium, 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
                     <button className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors">下载电子保单</button>
                     <button className="px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors">查看车辆清单</button>
                </div>
            </div>
        )}
        
        {!result && !loading && (
             <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                    <i className="fa-solid fa-shield-halved text-4xl text-slate-300"></i>
                </div>
                <h3 className="text-slate-500 font-medium">安全企业数据库</h3>
                <p className="text-slate-400 text-sm mt-2">仅限授权的车队管理人员访问。</p>
             </div>
        )}

      </div>
    </div>
  );
};

export default FleetQueryPage;