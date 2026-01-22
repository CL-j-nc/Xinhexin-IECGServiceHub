import React, { useState } from 'react';

const PolicyQuery: React.FC = () => {
  const [policyNo, setPolicyNo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    setError('');
    setResult(null);

    if (!/^(55|56)\d+$/.test(policyNo)) {
      setError('仅支持 55 / 56 开头的团体保单号');
      return;
    }

    try {
      const res = await fetch(`/api/policy/query?policyNo=${policyNo}`);
      if (!res.ok) throw new Error('接口异常');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('未查询到保单或接口不可用');
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-6">团体保单查询</h1>

        <div className="flex gap-4 mb-4">
          <input
            value={policyNo}
            onChange={e => setPolicyNo(e.target.value)}
            placeholder="请输入 55 / 56 开头保单号"
            className="flex-1 border px-4 py-3 rounded-lg"
          />
          <button
            onClick={handleQuery}
            className="bg-emerald-600 text-white px-6 rounded-lg font-bold"
          >
            查询
          </button>
        </div>

        {error && <div className="text-red-500 font-bold">{error}</div>}

        {result && (
          <pre className="mt-6 bg-slate-50 p-4 rounded-lg text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default PolicyQuery;
