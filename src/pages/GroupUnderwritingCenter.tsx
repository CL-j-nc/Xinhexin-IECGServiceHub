import React from 'react';

const GroupUnderwritingCenter: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">团体客户承保中心</h1>
        <p className="text-lg text-gray-600 mb-8">在这里，您可以管理所有团体客户的承保流程，从创建新客户到保单生效。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">新契约投保</h2>
            <p className="text-gray-600">为新团体客户或已有客户发起新的投保流程。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              发起新投保
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">承保任务列表</h2>
            <p className="text-gray-600">查看和处理所有待办的承保审核、信息录入等任务。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              进入任务列表
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">保单查询与管理</h2>
            <p className="text-gray-600">查询已生效或历史保单，进行保全、续保等操作。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              查询保单
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupUnderwritingCenter;
