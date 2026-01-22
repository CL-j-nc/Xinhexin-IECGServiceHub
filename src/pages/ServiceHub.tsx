import React from 'react';

const ServiceHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-6">
          保单服务中心
        </h1>

        <p className="text-slate-500 mb-12">
          本模块用于大宗团体客户保单相关业务处理，请从下方入口选择操作。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-slate-800 mb-2">保单查询</h3>
            <p className="text-sm text-slate-500">
              查询已有团体保单的基本信息与状态。
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-slate-800 mb-2">保单变更</h3>
            <p className="text-sm text-slate-500">
              对在保期间的团体保单进行信息调整。
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
            <h3 className="font-bold text-slate-800 mb-2">批单管理</h3>
            <p className="text-sm text-slate-500">
              生成、查看和管理保单批单记录。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHub;