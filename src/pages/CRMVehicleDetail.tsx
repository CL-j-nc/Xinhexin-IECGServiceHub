import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 简化的类型定义（客户服务系统本地）
interface VehicleProfile {
    vehiclePolicyUid: string;
    plate: string;
    vin: string;
    currentStatus: string;
    contacts: Contact[];
    flags: Flag[];
    policySummary?: {
        latestPolicyNo: string;
        effectiveDate: string;
        expiryDate: string;
    };
}

interface Contact {
    contactId: string;
    roleType: string;
    name: string;
    phone: string;
}

interface TimelineEvent {
    timelineId: string;
    eventType: string;
    eventDesc: string;
    eventTime: string;
}

interface Interaction {
    interactionId: string;
    contactMethod: string;
    topic: string;
    result: string;
    followUpStatus: string;
    interactionTime: string;
    operatorName: string;
}

interface Flag {
    flagId: string;
    flagType: string;
    flagNote: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string;
}

const CRMVehicleDetail: React.FC = () => {
    const { plateOrVin } = useParams<{ plateOrVin: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "interactions" | "flags">("overview");
    const [profile, setProfile] = useState<VehicleProfile | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [flags, setFlags] = useState<Flag[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataMode, setDataMode] = useState<"database" | "mock">("mock");

    useEffect(() => {
        if (!plateOrVin) return;
        loadData();
    }, [plateOrVin]);

    const loadData = async () => {
        if (!plateOrVin) return;
        setLoading(true);

        try {
            // 尝试从API加载 - 使用规范路径 /api/crm/by-vehicle
            const response = await fetch(`/api/crm/by-vehicle?plate=${encodeURIComponent(plateOrVin)}`);
            if (response.ok) {
                const data = await response.json() as any;
                if (data && data.vehicle_policy_uid) {
                    // 转换字段名从snake_case到camelCase
                    const profile: VehicleProfile = {
                        vehiclePolicyUid: data.vehicle_policy_uid,
                        plate: data.plate,
                        vin: data.vin,
                        currentStatus: data.current_status || "ACTIVE",
                        contacts: (data.contacts || []).map((c: any) => ({
                            contactId: c.contact_id,
                            roleType: c.role_type,
                            name: c.name,
                            phone: c.phone
                        })),
                        flags: (data.flags || []).map((f: any) => ({
                            flagId: f.flag_id,
                            flagType: f.flag_type,
                            flagNote: f.flag_note,
                            isActive: f.is_active === 1,
                            createdAt: f.created_at || "",
                            createdBy: f.created_by || ""
                        }))
                    };
                    setProfile(profile);
                    setDataMode("database");

                    // 加载其他数据 - 使用规范路径
                    const vehiclePolicyUid = data.vehicle_policy_uid;
                    const [timelineRes, interactionsRes, flagsRes] = await Promise.all([
                        fetch(`/api/crm/timeline?vehicle_policy_uid=${vehiclePolicyUid}`),
                        fetch(`/api/crm/vehicle/${vehiclePolicyUid}/interactions`),
                        fetch(`/api/crm/vehicle/${vehiclePolicyUid}/flags`),
                    ]);

                    if (timelineRes.ok) setTimeline(await timelineRes.json() as TimelineEvent[]);
                    if (interactionsRes.ok) setInteractions(await interactionsRes.json() as Interaction[]);
                    if (flagsRes.ok) setFlags((await flagsRes.json() as Flag[]).filter((f: Flag) => f.isActive));
                } else {
                    // 使用模拟数据
                    loadMockData();
                }
            } else {
                // 使用模拟数据
                loadMockData();
            }
        } catch (error) {
            console.log("API不可用，使用模拟数据");
            loadMockData();
        } finally {
            setLoading(false);
        }
    };



    const loadMockData = () => {
        setDataMode("mock");
        setProfile({
            vehiclePolicyUid: `mock_${plateOrVin}`,
            plate: plateOrVin || "",
            vin: "LHGCM1234567890XX",
            currentStatus: "测试数据",
            contacts: [
                { contactId: "1", roleType: "车主", name: "张三", phone: "138****1234" },
                { contactId: "2", roleType: "投保人", name: "李四", phone: "139****5678" },
            ],
            flags: [],
            policySummary: {
                latestPolicyNo: "MOCK-2024-001",
                effectiveDate: "2024-01-01",
                expiryDate: "2025-01-01",
            },
        });
        setTimeline([]);
        setInteractions([]);
        setFlags([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-400 text-sm">加载中...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const tabs = [
        { key: "overview", label: "总览" },
        { key: "timeline", label: `时间轴 (${timeline.length})` },
        { key: "interactions", label: `沟通记录 (${interactions.length})` },
        { key: "flags", label: "标记管理" },
    ] as const;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            {/* Header */}
            <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/crm/search")} className="text-slate-400 hover:text-white transition">
                        ← 返回搜索
                    </button>
                    <h1 className="font-bold text-sm tracking-wider">车辆档案详情</h1>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {dataMode === "database" ? "数据库模式" : "测试数据"}
                </span>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                {/* Vehicle Info Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{profile.plate}</h2>
                            <p className="text-sm text-slate-400 mt-1">VIN: {profile.vin}</p>
                        </div>
                        <span className="px-3 py-1.5 bg-purple-900/50 border border-purple-700 text-purple-300 text-xs rounded-lg">
                            {profile.currentStatus}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                        <div>
                            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">关系人</h4>
                            {profile.contacts.length > 0 ? (
                                <div className="space-y-2">
                                    {profile.contacts.map((c) => (
                                        <div key={c.contactId} className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{c.roleType}</span>
                                            <span className="text-white">{c.name}</span>
                                            <span className="text-slate-500">{c.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">暂无关系人</p>
                            )}
                        </div>
                        <div>
                            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">风险标记</h4>
                            {flags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {flags.map((f) => (
                                        <span key={f.flagId} className="px-2 py-1 bg-amber-900/50 border border-amber-700 text-amber-300 text-xs rounded">
                                            {f.flagType}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">无活跃标记</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="flex border-b border-slate-700 bg-slate-900/50">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-3 text-sm font-medium transition ${activeTab === tab.key
                                    ? "text-purple-400 border-b-2 border-purple-500"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === "overview" && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">保单概览</h3>
                                {profile.policySummary ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">最新保单号</p>
                                            <p className="text-sm text-white">{profile.policySummary.latestPolicyNo}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">生效日期</p>
                                            <p className="text-sm text-white">{profile.policySummary.effectiveDate}</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">到期日期</p>
                                            <p className="text-sm text-white">{profile.policySummary.expiryDate}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-500">暂无保单信息</p>
                                )}
                            </div>
                        )}

                        {activeTab === "timeline" && (
                            <div className="space-y-4">
                                {timeline.length > 0 ? (
                                    timeline.map((event) => (
                                        <div key={event.timelineId} className="flex gap-4 pb-4 border-b border-slate-700 last:border-0">
                                            <div className="text-xs text-slate-500 w-20">{new Date(event.eventTime).toLocaleDateString()}</div>
                                            <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-purple-400 text-xs">●</span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-medium">{event.eventType}</p>
                                                <p className="text-sm text-slate-400">{event.eventDesc}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500">暂无时间轴数据</p>
                                        {dataMode === "mock" && <p className="text-xs text-slate-600 mt-1">(测试模式)</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "interactions" && (
                            <div className="space-y-4">
                                {interactions.length > 0 ? (
                                    interactions.map((i) => (
                                        <div key={i.interactionId} className="bg-slate-900/50 rounded-lg p-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-slate-400">{i.contactMethod}</span>
                                                <span className="text-xs text-slate-500">{new Date(i.interactionTime).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-white font-medium">{i.topic}</p>
                                            <p className="text-sm text-slate-400 mt-1">{i.result}</p>
                                            <div className="flex gap-3 mt-2 text-xs text-slate-500">
                                                <span>客服: {i.operatorName}</span>
                                                <span className={`px-2 py-0.5 rounded ${i.followUpStatus === "已完成" ? "bg-emerald-900/50 text-emerald-400" : "bg-amber-900/50 text-amber-400"}`}>
                                                    {i.followUpStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500">暂无沟通记录</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "flags" && (
                            <div className="space-y-4">
                                {flags.length > 0 ? (
                                    flags.map((f) => (
                                        <div key={f.flagId} className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-amber-300">{f.flagType}</span>
                                                <span className="text-xs text-amber-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {f.flagNote && <p className="text-sm text-amber-200/80">{f.flagNote}</p>}
                                            <p className="text-xs text-amber-500/70 mt-2">标记人: {f.createdBy}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-500">暂无风险标记</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMVehicleDetail;
