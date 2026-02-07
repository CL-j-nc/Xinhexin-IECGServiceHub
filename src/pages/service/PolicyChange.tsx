import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PolicyChangeRecord {
  changeId: string;
  policyNo: string;
  changeType: string;
  changeDetails: string;
  status: string;
  applicantName: string;
  createdAt: string;
}

const changeTypeLabels: Record<string, string> = {
  ADDRESS: '地址变更',
  CONTACT: '联系方式变更',
  BENEFICIARY: '受益人变更',
  OTHER: '其他变更',
};

const statusLabels: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待审核', color: 'text-amber-600 bg-amber-50' },
  REVIEWING: { text: '审核中', color: 'text-blue-600 bg-blue-50' },
  APPROVED: { text: '已通过', color: 'text-emerald-600 bg-emerald-50' },
  REJECTED: { text: '已拒绝', color: 'text-red-600 bg-red-50' },
};

const PolicyChange: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [policyNo, setPolicyNo] = useState(searchParams.get('policyNo') || '');
  const [records, setRecords] = useState<PolicyChangeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [changeType, setChangeType] = useState('ADDRESS');
  const [changeDetails, setChangeDetails] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantContact, setApplicantContact] = useState('');

  const fetchRecords = async () => {
    if (!policyNo || !/^(65|66)\d+$/.test(policyNo)) return;

    setLoading(true);
    try {
      const resp = await fetch(`/api/policy/change/list?policyNo=${policyNo}`);
      const data: any = await resp.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (e) {
      console.error('获取变更记录失败', e);
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
    if (!policyNo || !changeDetails) return;

    setSubmitting(true);
    try {
      const resp = await fetch('/api/policy/change/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNo,
          changeType,
          changeDetails,
          applicantName,
          applicantContact,
        }),
      });
      const data: any = await resp.json();
      if (data.success) {
        alert(`变更申请已提交！编号：${data.data.changeId}`);
        setMode('list');
        setChangeDetails('');
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
          <h1 className="text-2xl font-black text-slate-900">保单变更</h1>
          <p className="text-sm text-slate-500">保单信息变更与批改单据入口</p>
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
              {loading ? '查询中...' : '查询记录'}
            </button>
            <button
              onClick={() => setMode('form')}
              disabled={!policyNo}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              申请变更
            </button>
          </div>
        </div>

        {/* Form Mode */}
        {mode === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">填写变更信息</h2>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">变更类型</span>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
              >
                {Object.entries(changeTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">变更详情 *</span>
              <textarea
                value={changeDetails}
                onChange={(e) => setChangeDetails(e.target.value)}
                required
                rows={4}
                placeholder="请详细描述需要变更的内容"
                className="mt-1 block w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none"
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
                disabled={submitting || !changeDetails}
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
                暂无变更记录
              </div>
            )}
            {records.map((record) => (
              <div key={record.changeId} className="bg-white border border-slate-100 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{record.changeId}</span>
                  <span className={`text-xs px-2 py-1 rounded ${statusLabels[record.status]?.color || 'bg-slate-100'}`}>
                    {statusLabels[record.status]?.text || record.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">
                  {changeTypeLabels[record.changeType] || record.changeType}
                </p>
                <p className="text-sm text-slate-600">{record.changeDetails}</p>
                <p className="text-xs text-slate-400">
                  {new Date(record.createdAt).toLocaleString('zh-CN')}
                </p>
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

export default PolicyChange;
