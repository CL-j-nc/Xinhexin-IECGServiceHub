import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CRMVehicleSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/crm/vehicle/${encodeURIComponent(searchQuery.trim())}`);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            {/* Header */}
            <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/staff-dashboard")}
                        className="text-slate-400 hover:text-white transition"
                    >
                        ← 返回
                    </button>
                    <h1 className="font-bold text-sm tracking-wider">
                        车辆客户档案 <span className="text-slate-600">|</span> CRM
                    </h1>
                </div>
            </div>

            {/* Search Content */}
            <div className="max-w-3xl mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-3">车辆客户档案查询</h2>
                    <p className="text-slate-400">输入车牌号或车架号查询历史保单与沟通记录</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            车牌号 / 车架号（VIN）
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="例如：粤B12345 或 LHGCM1234567890"
                            className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                        >
                            查询档案
                        </button>
                    </div>
                </form>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mt-10">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
                        <div className="text-purple-400 text-lg mb-2">📋</div>
                        <h4 className="text-white font-medium mb-1">历史保单</h4>
                        <p className="text-xs text-slate-500">查看车辆所有承保记录</p>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
                        <div className="text-purple-400 text-lg mb-2">💬</div>
                        <h4 className="text-white font-medium mb-1">沟通记录</h4>
                        <p className="text-xs text-slate-500">管理客服沟通历史</p>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
                        <div className="text-purple-400 text-lg mb-2">🚩</div>
                        <h4 className="text-white font-medium mb-1">风险标记</h4>
                        <p className="text-xs text-slate-500">VIP/高风险等标记信息</p>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5">
                        <div className="text-purple-400 text-lg mb-2">📞</div>
                        <h4 className="text-white font-medium mb-1">关系人</h4>
                        <p className="text-xs text-slate-500">车主/投保人联系方式</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMVehicleSearch;
