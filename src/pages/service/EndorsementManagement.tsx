import React from 'react';
import { useNavigate } from 'react-router-dom';

const EndorsementManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Service Hub</p>
          <h1 className="text-2xl font-black text-slate-900">批单管理</h1>
          <p className="text-sm text-slate-500">批单流程跟踪与回传信息管理</p>
        </div>

        <div className="border border-dashed border-amber-300 bg-amber-50/60 rounded-xl p-6 text-amber-900">
          <h2 className="text-base font-semibold mb-2">接口尚未接通</h2>
          <p className="text-sm text-amber-700">
            当前未接入真实接口文档内容，仅展示页面结构。接口联调完成后开放业务操作。
          </p>
        </div>

        <button
          onClick={() => navigate('/service-hub')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <i className="fa-solid fa-arrow-left text-[10px]"></i>
          返回保单服务中心
        </button>
      </div>
    </div>
  );
};

export default EndorsementManagement;
