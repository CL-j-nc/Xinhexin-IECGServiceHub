import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

const CustomerServiceHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 space-y-10">
        <div className="space-y-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Customer Service Hub</p>
          <h1 className="text-3xl font-black text-slate-900">团体客户服务管家</h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            面向客户的智能客服入口，支持与 AI 扮演的人工客服对话，提供保单查询、理赔指引与常见问题解答。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <ChatWidget mode="embedded" />
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">服务能力</h2>
              <ul className="text-sm text-slate-500 space-y-2">
                <li>保单状态与有效期核验（65/66 开头团体保单）</li>
                <li>常见承保、理赔与材料指引答疑</li>
                <li>复杂问题自动提示转人工处理</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">快捷入口</h2>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate('/service-hub/query')}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition"
                >
                  保单查询
                  <i className="fa-solid fa-arrow-right text-emerald-500 text-xs"></i>
                </button>
                <button
                  onClick={() => navigate('/service-hub')}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition"
                >
                  保单服务中心
                  <i className="fa-solid fa-arrow-right text-emerald-500 text-xs"></i>
                </button>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-6 text-sm text-emerald-700 leading-relaxed">
              为保护客户数据，请勿在对话中发送完整证件号码或敏感信息。系统将对高风险内容自动拦截。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceHub;
