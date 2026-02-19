import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceHub: React.FC = () => {
  const navigate = useNavigate();
  const serviceItems = [
    {
      title: '保单查询',
      description: '查询 55 / 56 开头的团体保单信息',
      route: '/service-hub/query',
      status: '已接入'
    },
    {
      title: '保单变更',
      description: '保单信息变更、批改申请与状态跟踪',
      route: '/service-hub/change',
      status: '已接入'
    },
    {
      title: '批单管理',
      description: '批单流程进度、历史记录与结果回传',
      route: '/service-hub/endorsement',
      status: '已接入'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-10">
          保单服务中心
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {serviceItems.map((item) => {
            const statusStyles =
              item.status === '已接入'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-amber-200 bg-amber-50 text-amber-600';
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.route)}
                className="bg-white border border-slate-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-emerald-400 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-black text-lg text-slate-800 mb-2">{item.title}</h3>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border rounded-full ${statusStyles}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServiceHub;
