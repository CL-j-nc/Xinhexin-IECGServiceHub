import React, { useState, useEffect, useRef } from 'react';
import { PolicyData, Coverage } from '../types';
import { addPolicyToDatabase, getAllPolicies } from '../services/mockDatabase';
import { extractPolicyFromPdf } from '../services/geminiService';

// Mock Dictionary extracted from system SQL
const INSURANCE_DICT = [
  "机动车损失保险",
  "第三者责任保险",
  "车上人员责任保险(司机)",
  "车上人员责任保险(乘客)",
  "全车盗抢保险",
  "玻璃单独破碎险",
  "车身划痕损失险",
  "附加医保外医疗费用责任险",
  "货物责任保险"
];

const PolicyManagementModule: React.FC = () => {
  const [formData, setFormData] = useState<PolicyData>({
    id: '66' + Math.floor(1000 + Math.random() * 9000), // Auto-generate random ID for convenience
    companyName: '',
    holder: '',
    status: 'Active',
    expiryDate: '',
    type: '商业车队综合保险',
    vehicleCount: 0,
    coverages: []
  });

  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    const data = await getAllPolicies();
    setPolicies(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vehicleCount' ? parseInt(value) || 0 : value
    }));
  };

  // PDF Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
          setMsg({type: 'error', text: '仅支持上传 PDF 格式的保单文件'});
          return;
      }

      setIsUploading(true);
      setMsg({ type: 'success', text: '正在解析保单文件，请稍候...'}); // Use success style for neutral info
      
      try {
          // Convert to Base64
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
              const base64String = reader.result as string;
              // Remove data URL prefix (e.g., "data:application/pdf;base64,")
              const base64Content = base64String.split(',')[1];
              
              const extractedData = await extractPolicyFromPdf(base64Content);
              
              if (extractedData) {
                  setFormData(prev => ({
                      ...prev,
                      ...extractedData,
                      // Ensure ID starts with 66 if AI missed it, or keep random if AI failed ID
                      id: extractedData.id?.startsWith('66') ? extractedData.id : prev.id,
                      // Default to Active if not found
                      status: 'Active' 
                  }));
                  setMsg({type: 'success', text: '保单解析成功！数据已自动填充。'});
              } else {
                  setMsg({type: 'error', text: '解析失败，未能提取有效信息。'});
              }
              setIsUploading(false);
          };
          reader.onerror = () => {
              setMsg({type: 'error', text: '文件读取失败。'});
              setIsUploading(false);
          };
      } catch (err) {
          console.error(err);
          setMsg({type: 'error', text: '系统处理异常。'});
          setIsUploading(false);
      }
      
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Coverage Management Handlers
  const addCoverage = () => {
    setFormData(prev => ({
      ...prev,
      coverages: [
        ...(prev.coverages || []),
        { name: INSURANCE_DICT[0], amount: '', premium: 0 }
      ]
    }));
  };

  const removeCoverage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coverages: prev.coverages?.filter((_, i) => i !== index)
    }));
  };

  const updateCoverage = (index: number, field: keyof Coverage, value: string | number) => {
    setFormData(prev => {
        const newCoverages = [...(prev.coverages || [])];
        newCoverages[index] = { 
            ...newCoverages[index], 
            [field]: value 
        };
        return { ...prev, coverages: newCoverages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validate ID
    if (!formData.id.startsWith('66') || formData.id.length <= 4) {
        setMsg({type: 'error', text: '保单号无效，必须以 66 开头且包含数字'});
        return;
    }
    
    // 2. Validate Required Fields
    if (!formData.companyName.trim()) {
        setMsg({type: 'error', text: '请输入承保单位名称'});
        return;
    }
    if (!formData.holder.trim()) {
        setMsg({type: 'error', text: '请输入管理人姓名'});
        return;
    }
    if (!formData.expiryDate) {
        setMsg({type: 'error', text: '请选择保险止期'});
        return;
    }

    // 3. Submit
    const success = await addPolicyToDatabase(formData);
    if (success) {
        setMsg({type: 'success', text: '保单录入成功！即刻起可被查询。'});
        loadPolicies();
        // Reset form but keep ID prefix for next entry
        setFormData({
            id: '66' + Math.floor(1000 + Math.random() * 9000),
            companyName: '',
            holder: '',
            status: 'Active',
            expiryDate: '',
            type: '商业车队综合保险',
            vehicleCount: 0,
            coverages: []
        });
    } else {
        setMsg({type: 'error', text: '录入失败：该保单号已存在。'});
    }

    setTimeout(() => setMsg(null), 3000);
  };

  const getTotalPremium = () => {
      return formData.coverages?.reduce((sum, item) => sum + (Number(item.premium) || 0), 0) || 0;
  };

  return (
    <div className="h-full flex gap-6 p-6 bg-slate-900 text-slate-100 animate-fade-in-up font-sans">
        
        {/* Form Section */}
        <div className="w-5/12 bg-slate-800 rounded-xl p-6 border border-slate-600 shadow-xl overflow-y-auto custom-scrollbar relative">
            
            {/* Loading Overlay */}
            {isUploading && (
                <div className="absolute inset-0 bg-slate-900/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm rounded-xl">
                    <i className="fa-solid fa-file-invoice-dollar text-emerald-500 text-4xl animate-bounce mb-4"></i>
                    <p className="text-emerald-400 font-bold animate-pulse">正在智能解析保单...</p>
                    <p className="text-slate-400 text-xs mt-2">Gemini 2.5 Vision Processing</p>
                </div>
            )}

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-600">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <i className="fa-solid fa-file-circle-plus text-xl"></i>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl text-white">录入新保单</h2>
                        <p className="text-xs text-slate-300">核心业务系统数据写入</p>
                    </div>
                </div>
                
                {/* Upload Button */}
                <div className="relative group">
                    <input 
                        type="file" 
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <i className="fa-solid fa-cloud-arrow-up"></i> 上传 PDF 识别
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-slate-700 text-[10px] text-slate-300 rounded shadow-xl hidden group-hover:block z-10">
                        支持上传电子保单 PDF，AI 将自动提取保单号、公司、险种明细等信息。
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">保单号码</label>
                        <input 
                            name="id" value={formData.id} onChange={handleChange} required
                            className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none font-mono text-emerald-300 font-bold"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">保险止期</label>
                        <input 
                            type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required
                            className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">承保单位 (Client)</label>
                    <input 
                        name="companyName" value={formData.companyName} onChange={handleChange} required
                        placeholder="例如: XX物流有限公司"
                        className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">管理人 (Holder)</label>
                         <input 
                            name="holder" value={formData.holder} onChange={handleChange} required
                            className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">车队规模</label>
                        <input 
                            type="number" name="vehicleCount" value={formData.vehicleCount} onChange={handleChange}
                            className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">状态</label>
                        <select 
                            name="status" value={formData.status} onChange={handleChange}
                            className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none text-white"
                        >
                            <option value="Active">有效 (Active)</option>
                            <option value="Expired">过期 (Expired)</option>
                            <option value="Pending">审核中 (Pending)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">方案名称</label>
                        <input 
                            name="type" value={formData.type} onChange={handleChange}
                            className="w-full bg-slate-700 border border-slate-500 rounded px-3 py-2 text-sm focus:border-emerald-400 outline-none text-white"
                        />
                    </div>
                </div>

                {/* Coverages Section */}
                <div className="pt-4 border-t border-slate-600">
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wide">
                            <i className="fa-solid fa-list-check mr-1"></i> 具体险种明细
                        </label>
                        <button type="button" onClick={addCoverage} className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white transition-colors">
                            <i className="fa-solid fa-plus mr-1"></i> 添加险种
                        </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {formData.coverages?.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-slate-700/50 p-2 rounded border border-slate-600">
                                <select 
                                    value={item.name}
                                    onChange={(e) => updateCoverage(idx, 'name', e.target.value)}
                                    className="flex-[2] bg-slate-800 border border-slate-600 rounded text-xs py-1 px-2 text-white outline-none"
                                >
                                    {INSURANCE_DICT.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <input 
                                    placeholder="保额"
                                    value={item.amount}
                                    onChange={(e) => updateCoverage(idx, 'amount', e.target.value)}
                                    className="flex-[1] w-16 bg-slate-800 border border-slate-600 rounded text-xs py-1 px-2 text-white outline-none"
                                />
                                <input 
                                    type="number"
                                    placeholder="保费"
                                    value={item.premium}
                                    onChange={(e) => updateCoverage(idx, 'premium', parseFloat(e.target.value))}
                                    className="flex-[1] w-16 bg-slate-800 border border-slate-600 rounded text-xs py-1 px-2 text-white outline-none"
                                />
                                <button type="button" onClick={() => removeCoverage(idx)} className="text-slate-500 hover:text-red-400 px-1">
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        ))}
                        {(!formData.coverages || formData.coverages.length === 0) && (
                            <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-600 rounded">
                                暂无险种明细，请点击添加
                            </div>
                        )}
                    </div>
                    
                    {formData.coverages && formData.coverages.length > 0 && (
                        <div className="text-right text-xs text-emerald-300 mt-2 font-mono">
                            总保费: ¥ {getTotalPremium().toLocaleString()}
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold mt-2 transition-all shadow-lg hover:shadow-emerald-500/40 flex items-center justify-center gap-2 text-sm">
                    <i className="fa-solid fa-save"></i> 提交完整保单
                </button>

                {msg && (
                    <div className={`p-3 rounded text-xs flex items-center gap-2 font-medium animate-fade-in-up ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                        <i className={`fa-solid ${msg.type === 'success' ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
                        {msg.text}
                    </div>
                )}
            </form>
        </div>

        {/* List Section */}
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <i className="fa-solid fa-list-ul text-emerald-500"></i> 已录入保单列表
                </h3>
                <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1 rounded-full border border-slate-700 font-mono">Total: {policies.length}</span>
            </div>
            <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800 text-slate-400 font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 border-b border-slate-700">ID</th>
                            <th className="p-4 border-b border-slate-700">公司名称</th>
                            <th className="p-4 border-b border-slate-700">状态</th>
                            <th className="p-4 border-b border-slate-700">险种数</th>
                            <th className="p-4 border-b border-slate-700">止期</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {policies.map(p => (
                            <tr key={p.id} className="hover:bg-slate-900/80 transition-colors group">
                                <td className="p-4 font-mono text-emerald-400 font-bold">{p.id}</td>
                                <td className="p-4 text-white font-medium">{p.companyName}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-300">
                                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{p.coverages?.length || 0}</span>
                                </td>
                                <td className="p-4 font-mono text-slate-400 group-hover:text-white transition-colors">{p.expiryDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default PolicyManagementModule;
