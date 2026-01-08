import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import SupervisorDashboard from './components/SupervisorDashboard';
import FleetQueryPage from './components/FleetQueryPage';
import StaffLogin from './components/StaffLogin';

const App: React.FC = () => {
  // Navigation State
  // 'landing' | 'fleet-query'  => Customer Facing (Client System)
  // 'staff-login' | 'staff-dashboard' => Internal Facing (Backend System)
  const [view, setView] = useState<'landing' | 'fleet-query' | 'staff-login' | 'staff-dashboard'>('landing');

  // --- INTERNAL BACKEND VIEWS ---

  if (view === 'staff-login') {
    return (
      <StaffLogin 
        onLogin={() => setView('staff-dashboard')} 
        onBack={() => setView('landing')} 
      />
    );
  }

  if (view === 'staff-dashboard') {
    return <SupervisorDashboard onExit={() => setView('staff-login')} />;
  }

  // --- CUSTOMER FRONTEND VIEWS ---

  if (view === 'fleet-query') {
    return (
      <>
        <FleetQueryPage onBack={() => setView('landing')} />
        <ChatWidget />
      </>
    );
  }

  // Default: Landing Page
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-100 to-slate-50 -z-10"></div>
      
      <div className="flex-1 container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-slate-800">
           {/* Badge */}
           <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-600/10 text-emerald-800 text-sm font-bold mb-6 border border-emerald-600/20">
             新一代核心业务系统 2.0
           </div>
           
           {/* Main Title */}
           <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-950 mb-6 tracking-tight drop-shadow-sm">
             中国人寿财险 - JHPCIC<br/>
             <span className="text-emerald-700 text-2xl md:text-4xl mt-3 block font-bold">大宗团体客户业务服务系统</span>
           </h1>
           
           {/* Subtitle */}
           <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
             致力于为大型企业车队提供专业的商业车险解决方案与实时服务。
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { id: 'query', title: '车队保单查询', icon: 'fa-truck-fast', desc: '商业车队承保状态实时查询与校验。' },
                { id: 'claims', title: '团体理赔服务', icon: 'fa-file-signature', desc: '大宗业务批量理赔申请与进度追踪。' },
                { id: 'consult', title: '业务承保咨询', icon: 'fa-briefcase', desc: '大型团体承保方案专家咨询服务。' }
              ].map((item) => (
                <div 
                  key={item.title}
                  onClick={() => {
                    if (item.id === 'query') {
                      setView('fleet-query');
                    }
                  }}
                  className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 border-emerald-600 group
                    ${item.id === 'query' ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default opacity-80'}`}
                >
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <i className={`fa-solid ${item.icon} text-2xl`}></i>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* The Floating AI Chat Widget - Only visible on Customer Side */}
      <ChatWidget />

      {/* Footer with Discreet Staff Login */}
      <div className="py-6 text-center text-slate-400 text-xs relative z-20">
         <p className="mb-2">© 2025 China Life Property & Casualty Insurance Company Limited. All Rights Reserved.</p>
         <div className="flex justify-center gap-4">
            <span>隐私政策</span>
            <span>服务条款</span>
            <span className="text-slate-300">|</span>
            <button 
                onClick={() => setView('staff-login')} 
                className="hover:text-emerald-600 transition-colors font-semibold flex items-center gap-1"
            >
                <i className="fa-solid fa-lock text-[10px]"></i> 员工内部通道
            </button>
         </div>
      </div>
      
    </div>
  );
};

export default App;