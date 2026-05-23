"use client";

import React, { useState, useEffect } from "react";
import { 
    Users, 
    BarChart3, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp,
    Play,
    AreaChart as AreaChartIcon,
    History,
    Cpu,
    HardDrive,
    Zap,
    Clock,
    Activity,
    Server
} from "lucide-react";
import dynamic from "next/dynamic";
import { proxyImage } from "@/lib/proxy-image";

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function AdminOverviewClient({ initialData }: { initialData: any }) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [rankingData, setRankingData] = useState<any[]>([]);
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
    const [rankPeriod, setRankPeriod] = useState("daily");
    const [rankType, setRankType] = useState("total");
    const [serverHealth, setServerHealth] = useState<any>(null);

    const fetchServerHealth = async () => {
        try {
            const res = await fetch("/api/admin/server-health");
            if (res.ok) setServerHealth(await res.json());
        } catch (err) {}
    };

    useEffect(() => {
        fetchServerHealth();
        const interval = setInterval(fetchServerHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const [chartRes, rankRes, histRes, wdRes] = await Promise.all([
                fetch("/api/admin/chart-data"),
                fetch(`/api/ranking?period=${rankPeriod}&type=${rankType}`),
                fetch("/api/history?limit=10"),
                fetch("/api/admin/withdrawals?status=PENDING")
            ]);
            if (chartRes.ok) setChartData(await chartRes.json());
            if (rankRes.ok) setRankingData(await rankRes.json());
            if (histRes.ok) setWatchHistory(await histRes.json());
            if (wdRes.ok) {
                const wds = await wdRes.json();
                setPendingWithdrawals(wds.length);
            }
        };
        fetchData();
    }, [rankPeriod, rankType]);

    const stats = [
        { label: "Total Members", value: initialData.memberCount.toLocaleString(), icon: Users, color: "text-blue-400" },
        { label: "Revenue 7d", value: `$${chartData.reduce((acc, curr) => acc + curr.earnings, 0).toFixed(2)}`, icon: BarChart3, color: "text-purple-400" },
        { label: "Payouts 7d", value: `$${chartData.reduce((acc, curr) => acc + (curr.payouts || 0), 0).toFixed(2)}`, icon: CheckCircle2, color: "text-green-400" },
        { label: "Pending Payouts", value: pendingWithdrawals.toString(), icon: AlertCircle, color: "text-primary" },
    ];

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-lg font-bold text-white tracking-tight">Admin <span className="text-primary">Overview</span></h2>
                <p className="text-xs text-zinc-500">Platform Management &amp; Global Control</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0F0F11] border border-white/5 p-3 sm:p-4 rounded-2xl flex flex-col gap-2.5 sm:gap-3 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className="absolute inset-0 bg-batik-pink opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-all" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
                                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                            </div>
                            <span className="text-[8px] sm:text-[9px] bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-md text-zinc-600 font-semibold border border-white/5">LIVE</span>
                        </div>
                        <div className="flex flex-col relative z-10">
                            <p className="text-zinc-500 text-[9px] sm:text-[10px] font-medium">{stat.label}</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Infrastructure Health & VPS Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-batik-pink opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-all" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.15em] flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-green-400" />
                                Infrastructure Live Monitor
                            </h3>
                            <p className="text-[10px] text-zinc-600 font-medium">Real-time Server Resources & Response Stability</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                                <Clock className="w-3 h-3 text-zinc-500" />
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{serverHealth?.system.uptime || "---"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{serverHealth?.system.latency || "---"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* CPU Monitor */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-white">CPU Processing</span>
                                </div>
                                <span className="text-xs font-black text-white">{serverHealth?.cpu.usage || 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,114,182,0.5)]" 
                                    style={{ width: `${serverHealth?.cpu.usage || 0}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase truncate">{serverHealth?.cpu.model || "Analyzing Core..."}</p>
                        </div>

                        {/* RAM Monitor */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-white">Memory Allocation</span>
                                </div>
                                <span className="text-xs font-black text-white">{serverHealth?.memory.usage || 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(96,165,250,0.5)]" 
                                    style={{ width: `${serverHealth?.memory.usage || 0}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase">{serverHealth?.memory.used} / {serverHealth?.memory.total}</p>
                        </div>
                    </div>
                </div>

                {/* VPS Billing Card */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-batik-pink opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-all" />
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Server className="w-16 h-16 text-white" />
                    </div>
                    <div className="flex flex-col gap-1 relative z-10">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">Subscription Control</h3>
                        <p className="text-[10px] text-zinc-600 font-medium italic">Managed via Cloud Provider Billing</p>
                    </div>

                    <div className="flex flex-col gap-4 mt-4 relative z-10">
                        {initialData.vpsExpiryDate ? (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Days Remaining</span>
                                    <h4 className={`text-4xl font-black tracking-tighter ${
                                        Math.ceil((new Date(initialData.vpsExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 7 
                                        ? 'text-red-500 animate-pulse' : 'text-white'
                                    }`}>
                                        {Math.max(0, Math.ceil((new Date(initialData.vpsExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        Math.ceil((new Date(initialData.vpsExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 3 
                                        ? 'bg-red-500' : 'bg-green-500'
                                    }`} />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                        Renews: {new Date(initialData.vpsExpiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-30">
                                <AlertCircle className="w-8 h-8" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-center">Set billing date in settings</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-batik-pink opacity-[0.05] pointer-events-none group-hover:opacity-[0.08] transition-all" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.15em] flex items-center gap-1.5">
                            <AreaChartIcon className="w-3.5 h-3.5 text-primary" />
                            Global Financial Analytics
                        </h3>
                        <p className="text-[10px] text-zinc-600 font-medium">Network Earnings vs Approved Distributions</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Gross Revenue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Net Payouts</span>
                        </div>
                    </div>
                </div>

                <div className="h-[220px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#3f3f46" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                tick={{fontWeight: 700}}
                            />
                            <YAxis 
                                stroke="#3f3f46" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                tick={{fontWeight: 700}}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0F0F11', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}
                                cursor={{ stroke: '#ffffff10' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="earnings" 
                                stroke="#f472b6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorEarnings)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="payouts" 
                                stroke="#3f3f46" 
                                strokeWidth={1.5}
                                fill="transparent" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Rankings Sidebar */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-batik-pink opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-all" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-white">Member Performance</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex p-0.5 bg-black/40 border border-white/5 rounded-lg">
                            {['daily', 'weekly', 'alltime'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setRankPeriod(p)}
                                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition-all ${rankPeriod === p ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto no-scrollbar">
                            {rankingData.map((row, idx) => (
                                <div key={idx} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${idx === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold w-5 ${idx === 0 ? 'text-primary' : 'text-zinc-700'}`}>#{idx + 1}</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-white truncate w-28">{row.name}</span>
                                            <span className="text-[9px] text-zinc-600">Verified</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-primary">${row.earning.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Activity */}
                <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-batik-pink opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-all" />
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 relative z-10">
                        <Play className="w-3.5 h-3.5 text-primary" />
                        Live Platform Traffic
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
                        {watchHistory.length === 0 ? (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-20 gap-3">
                                <History className="w-8 h-8" />
                                <p className="text-xs font-medium">No activity recorded.</p>
                            </div>
                        ) : (
                            watchHistory.map((video, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl group hover:border-white/10 transition-all">
                                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-zinc-500">{idx + 1}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">{video.videoTitle}</h4>
                                        <p className="text-[10px] text-zinc-600">{new Date(video.updatedAt).toLocaleTimeString()}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[9px] text-zinc-500">Live Hit</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
