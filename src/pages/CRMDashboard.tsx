import React from 'react';

const CRMDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">CRM 客户关系管理中心</h1>
        <p className="text-lg text-gray-600 mb-8">管理您的所有客户信息，跟踪互动历史，发现新的业务机会。</p>

        {/* Search Bar */}
        <div className="mb-8">
          <input 
            type="text" 
            placeholder="搜索客户名称、联系人或标签..." 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">客户列表</h2>
            <p className="text-gray-600">查看和管理您的所有客户。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              查看客户
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">新建客户</h2>
            <p className="text-gray-600">添加新的团体或个人客户。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              创建客户
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">销售机会</h2>
            <p className="text-gray-600">跟踪潜在的销售线索和机会。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              管理机会
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">报告与分析</h2>
            <p className="text-gray-600">查看客户数据和销售业绩分析。</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              查看报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
