import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLogin from '../components/StaffLogin';
import ConversationHub from '../components/ConversationHub';

const StaffDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'hub' | 'conversation'>('hub');
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <StaffLogin
        onLogin={() => setIsAuthenticated(true)}
        onBack={() => navigate('/')}
      />
    );
  }

  // 如果选择了会话管理，显示 ConversationHub
  if (currentView === 'conversation') {
    return <ConversationHub onExit={() => setCurrentView('hub')} />;
  }

  // 业务员功能中心
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Header */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="font-bold text-sm tracking-wider">
            业务员工作台 <span className="text-slate-600">|</span> STAFF HUB
          </h1>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-900/50 transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">欢迎回来</h2>
          <p className="text-slate-400">选择需要处理的业务模块</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CRM 车辆客户档案 */}
          <button
            onClick={() => navigate('/crm/search')}
            className="bg-gradient-to-br from-purple-900/50 to-purple-950 border border-purple-800/50 rounded-xl p-6 text-left hover:border-purple-600 hover:shadow-lg hover:shadow-purple-900/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-800/50 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                  <path
                    d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zM4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                车辆客户档案
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              按车牌/VIN查询客户档案、历史保单、沟通记录与风险标记
            </p>
          </button>

          {/* 续保提醒 */}
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-950/50 border border-amber-800/30 rounded-xl p-6 text-left opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-800/30 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-500/50">
                  <rect x="4" y="8" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 4v4M16 4v4M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-400">续保提醒</h3>
                <span className="text-[10px] text-amber-500/70 uppercase tracking-wider">即将上线</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              即将到期保单提醒与续保跟进管理
            </p>
          </div>

          {/* 会话管理 */}
          <button
            onClick={() => setCurrentView('conversation')}
            className="bg-gradient-to-br from-emerald-900/50 to-emerald-950 border border-emerald-800/50 rounded-xl p-6 text-left hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-900/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-800/50 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
                会话管理
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              客服会话监控、人工介入与资料协助
            </p>
          </button>

          {/* 保单服务 */}
          <button
            onClick={() => navigate('/service-hub')}
            className="bg-gradient-to-br from-blue-900/50 to-blue-950 border border-blue-800/50 rounded-xl p-6 text-left hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-800/50 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2v6h6M16 13H8M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                保单服务中心
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              保单查询、变更申请与批单管理
            </p>
          </button>

          {/* 理赔中心 */}
          <button
            onClick={() => navigate('/claim-center')}
            className="bg-gradient-to-br from-orange-900/50 to-orange-950 border border-orange-800/50 rounded-xl p-6 text-left hover:border-orange-600 hover:shadow-lg hover:shadow-orange-900/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-800/50 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-400">
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                理赔中心
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              理赔报案、进度查询与案件处理
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
