import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface EndorsementRecord {
  endorseNo: string;
  policyNo: string;
  endorseType: string;
  description: string;
  status: string;
  effectiveDate: string;
  premiumChange?: number;
  applicantName: string;
  createdAt: string;
}

const endorseTypeLabels: Record<string, string> = {
  ADD_INSURED: '增加被保险人',
  REMOVE_INSURED: '减少被保险人',
  CHANGE_COVERAGE: '变更保额/险种',
  EXTEND_PERIOD: '延长保险期间',
  OTHER: '其他批改',
};

const statusLabels: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待审核', color: 'text-amber-600 bg-amber-50' },
  APPROVED: { text: '已批准', color: 'text-emerald-600 bg-emerald-50' },
  REJECTED: { text: '已拒绝', color: 'text-red-600 bg-red-50' },
  CANCELLED: { text: '已取消', color: 'text-slate-600 bg-slate-50' },
};

const EndorsementManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [policyNo, setPolicyNo] = useState(searchParams.get('policyNo') || '');
  const [records, setRecords] = useState<EndorsementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [endorseType, setEndorseType] = useState('ADD_INSURED');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantContact, setApplicantContact] = useState('');

  const fetchRecords = async () => {
    if (!policyNo || !/^(65|66)\d+$/.test(policyNo)) return;

    setLoading(true);
    try {
      const resp = await fetch(`/api/policy/endorsement/list?policyNo=${policyNo}`);
      const data: any = await resp.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (e) {
      console.error('获取批单记录失败', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (policyNo) {
      fetchRecords();
    }
  }, [policyNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyNo || !description) return;

    setSubmitting(true);
    try {
      const resp = await fetch('/api/policy/endorsement/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNo,
          endorseType,
          description,
          effectiveDate: effectiveDate || new Date().toISOString(),
          applicantName,
          applicantContact,
        }),
      });
      const data: any = await resp.json();
      if (data.success) {
        alert(`批单申请已提交！批单号：${data.data.endorseNo}`);
        setMode('list');
        setDescription('');
        fetchRecords();
      } else {
        alert(data.error || '提交失败');
      }
    } catch (e) {
      alert('网络错误，请重试');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Service Hub</p>
          <h1 className="text-2xl font-black text-slate-900">批单管理</h1>
          <p className="text-sm text-slate-500">批单流程跟踪与回传信息管理</p>
        </div>

        {/* Policy Number Input */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">保单号</span>
            <input
              type="text"
              value={policyNo}
              onChange={(e) => setPolicyNo(e.target.value)}
              placeholder="请输入65或66开头的保单号"
              className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition"
            />
          </label>
          <div className="flex gap-3">
            <button
              onClick={fetchRecords}
              disabled={!policyNo || loading}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition disabled:opacity-50"
            >
              {loading ? '查询中...' : '查询批单'}
            </button>
            <button
              onClick={() => setMode('form')}
              disabled={!policyNo}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              申请批单
            </button>
          </div>
        </div>

        {/* Form Mode */}
        {mode === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">填写批单信息</h2>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">批改类型</span>
              <select
                value={endorseType}
                onChange={(e) => setEndorseType(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
              >
                {Object.entries(endorseTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">批改说明 *</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="请详细描述批改内容，如增加的被保险人信息、变更的保额等"
                className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">生效日期</span>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">申请人姓名</span>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">联系电话</span>
                <input
                  type="text"
                  value={applicantContact}
                  onChange={(e) => setApplicantContact(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || !description}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {submitting ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        )}

        {/* Records List */}
        {mode === 'list' && (
          <div className="space-y-3">
            {records.length === 0 && !loading && policyNo && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-slate-500 text-sm">
                暂无批单记录
              </div>
            )}
            {records.map((record) => (
              <div key={record.endorseNo} className="bg-white border border-slate-100 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{record.endorseNo}</span>
                  <span className={`text-xs px-2 py-1 rounded ${statusLabels[record.status]?.color || 'bg-slate-100'}`}>
                    {statusLabels[record.status]?.text || record.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">
                  {endorseTypeLabels[record.endorseType] || record.endorseType}
                </p>
                <p className="text-sm text-slate-600">{record.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>生效日期: {new Date(record.effectiveDate).toLocaleDateString('zh-CN')}</span>
                  <span>申请时间: {new Date(record.createdAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/service-hub')}
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
        >
          <i className="fa-solid fa-arrow-left text-[10px]"></i>
          返回保单服务中心
        </button>
      </div>
    </div>
  );
};

export default EndorsementManagement;
