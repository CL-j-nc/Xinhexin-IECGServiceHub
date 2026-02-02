import React, { useState } from 'react';

interface StaffLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({ onLogin, onBack }) => {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate server auth delay
    setTimeout(() => {
      // Strict Validation
      if (id === '9527' && pwd === 'admin') {
        onLogin();
      } else {
        setError('认证失败：工号或密码错误');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Tech Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('http://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-5"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-900/50 mb-4">
            <i className="fa-solid fa-shield-cat text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">核心业务管理后台</h1>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">Authorized Personnel Only</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">

            {/* ID Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">员工工号 / Agent ID</label>
              <div className="relative">
                <i className="fa-solid fa-user-astronaut absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  placeholder="请输入工号"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">安全令牌 / Password</label>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input
                  type="password"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-emerald-900/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-right-to-bracket"></i>}
              接入内网
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-xs flex items-center justify-center gap-2 mx-auto transition-colors">
            <i className="fa-solid fa-arrow-left"></i> 返回客户门户
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;