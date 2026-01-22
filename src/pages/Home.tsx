import React from 'react';
import { useNavigate } from 'react-router-dom';

const SystemIdentitySection = () => (
    <header className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                上海保交所-中国人寿财险新核心承保系统
            </h1>
            <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-emerald-500 rounded-full" />
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    大宗团体客户业务服务系统
                </p>
            </div>
        </div>
        <div className="flex items-center gap-6 bg-white px-5 py-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="text-right">
                <img
                    src="/logo/longlogo.jpeg"
                    alt="中国人寿财产保险"
                    className="h-14 md:h-16 lg:h-18 w-auto object-contain"
                />
            </div>
        </div>
    </header>
);

const CoreServiceEntrySection = () => {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { title: '保单服务中心', route: '/service-hub' },
                { title: '团体客户服务管家', route: '/customer-service' },
                { title: '报案中心', route: '/claim-center' },
                { title: '理赔中心', route: '/claim-process-hub' }
            ].map((item) => (
                <button
                    key={item.title}
                    onClick={() => navigate(item.route)}
                    className="group bg-slate-50 border border-slate-200 p-6 rounded-lg text-left hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all cursor-pointer"
                >
                    <div className="flex items-start gap-5">
                        <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition-colors">
                            <i className="fa-solid fa-file-lines h-5 w-5 text-slate-300 group-hover:text-emerald-500"></i>
                        </div>
                        <div>
                            <p className="text-base font-medium text-slate-800">{item.title}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

const AuthorityNoticeSection = () => (
    <div className="bg-white rounded-lg p-8 border border-slate-100 mt-12">
        <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="h-14 w-14 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-shield-halved h-8 w-8 text-emerald-600"></i>
            </div>
            <div className="space-y-3">
                <h4 className="text-base font-medium text-slate-800">系统权威性声明</h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    本系统为大宗团体客户业务服务的唯一权威平台，数据来源于核心承保系统。
                </p>
            </div>
        </div>
    </div>
);

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16">
                <SystemIdentitySection />
                <CoreServiceEntrySection />
                <AuthorityNoticeSection />
            </div>
            <div className="py-6 text-center text-slate-400 text-xs border-t border-slate-100">
                <p className="mb-2">
                    © 2025 China Life Property & Casualty Insurance Company Limited. All Rights Reserved.
                </p>
                <div className="flex justify-center gap-4">
                    <span>隐私政策</span>
                    <span>服务条款</span>
                    <span className="text-slate-300">|</span>
                    <button
                        onClick={() => navigate('/staff-dashboard')}
                        className="hover:text-emerald-600 transition-colors font-semibold flex items-center gap-1"
                    >
                        <i className="fa-solid fa-lock text-[10px]"></i>
                        员工内部通道
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
