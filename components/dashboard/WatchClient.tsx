"use client";

import React, { useState, useEffect } from "react";
import {
    Play, History, Clock, TrendingUp, Eye, DollarSign, Zap, BarChart2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

// ─── Batik Pink Pattern ────────────────────────────────────────────────────
const BatikPattern = ({ opacity = 0.06 }: { opacity?: number }) => (
    <div className="absolute inset-0 bg-batik-pink pointer-events-none overflow-hidden transition-all" style={{ opacity }} />
);

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111115] border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
            <p className="text-zinc-400 font-semibold mb-2">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-zinc-300 capitalize">{p.name}:</span>
                    <span className="text-white font-bold">
                        {p.dataKey.includes("views") || p.dataKey === "self" || p.dataKey === "total" || p.dataKey === "referral" && !p.dataKey.includes("Earning")
                            ? p.value
                            : `$${p.value}`}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function WatchClient({ user }: { user: any }) {
    const [watchHistory, setWatchHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalWatchtime: 0, avgRetention: 0, todayWatchEarnings: 0 });
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartTab, setChartTab] = useState<"earning" | "views">("earning");

    useEffect(() => {
        const fetchAll = async () => {
            const [histRes, statsRes, analyticsRes] = await Promise.all([
                fetch("/api/history?t=" + Date.now()),
                fetch("/api/member/stats?t=" + Date.now()),
                fetch("/api/member/analytics?t=" + Date.now())
            ]);
            if (histRes.ok) setWatchHistory(await histRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            setLoading(false);
        };
        fetchAll();
    }, []);

    const totalHours = Math.floor(stats.totalWatchtime / 3600);
    const totalMins = Math.floor((stats.totalWatchtime % 3600) / 60);

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-white tracking-tight">Watch <span className="text-primary">Analytics</span></h2>
                <p className="text-xs text-zinc-500">Statistik tontonan dan rewardmu 7 hari terakhir.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        label: "Total Ditonton", icon: Play, color: "text-blue-400",
                        value: watchHistory.length.toString(), sub: "video"
                    },
                    {
                        label: "Total Waktu", icon: Clock, color: "text-purple-400",
                        value: `${totalHours}h ${totalMins}m`, sub: "watchtime"
                    },
                    {
                        label: "Avg Retensi", icon: TrendingUp, color: "text-primary",
                        value: `${stats.avgRetention}s`, sub: "per sesi"
                    },
                    {
                        label: "Watch Balance", icon: DollarSign, color: "text-green-400",
                        value: `$${(user?.balanceWatch || 0).toFixed(3)}`, sub: "total reward"
                    },
                ].map((item) => (
                    <div key={item.label} className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-white/10 transition-all">
                        <BatikPattern />
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">{item.label}</p>
                            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div className="relative z-10">
                            <h3 className={`text-xl font-bold tracking-tighter ${item.color}`}>{item.value}</h3>
                            <span className="text-[9px] text-zinc-600">{item.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                <BatikPattern opacity={0.04} />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-2">
                            <BarChart2 className="w-3.5 h-3.5 text-primary" />
                            Grafik 7 Hari Terakhir
                        </h3>
                        <p className="text-[9px] text-zinc-600 mt-0.5">Tren aktivitas watch kamu</p>
                    </div>
                    <div className="flex p-0.5 bg-black/40 border border-white/5 rounded-lg">
                        {[
                            { id: "earning", label: "Earning" },
                            { id: "views", label: "Views" }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setChartTab(t.id as any)}
                                className={`px-3 py-1.5 text-[9px] font-bold rounded-md transition-all ${chartTab === t.id ? "bg-primary text-black" : "text-zinc-500 hover:text-white"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading || !analytics ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="relative z-10">
                        {chartTab === "earning" ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={analytics.earningChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="watchGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="watch" name="Watch Earning" stroke="#3b82f6" fill="url(#watchGrad)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={analytics.viewChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="self" name="Watch Self" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}
            </div>

            {/* 7-Day Summary Cards */}
            {analytics && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 relative overflow-hidden">
                        <BatikPattern />
                        <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wide relative z-10">Tontonan 7 Hari</p>
                        <h3 className="text-2xl font-bold text-white tracking-tighter relative z-10">{analytics.summary.totalSelfViews7d} <span className="text-xs text-zinc-500 font-normal">video</span></h3>
                    </div>
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 relative overflow-hidden">
                        <BatikPattern />
                        <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wide relative z-10">Earning 7 Hari</p>
                        <h3 className="text-2xl font-bold text-green-400 tracking-tighter relative z-10">${analytics.summary.totalWatchEarnings7d.toFixed(4)}</h3>
                    </div>
                </div>
            )}

            {/* Watch History */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-blue-400" />
                        Watch History
                    </h3>
                    <span className="text-[9px] font-semibold text-zinc-600">{watchHistory.length} video</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {watchHistory.length === 0 && !loading && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 gap-4">
                            <Play className="w-12 h-12 text-zinc-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-center">Belum ada tontonan. Mulai nonton sekarang!</p>
                        </div>
                    )}
                    {watchHistory.map((video, idx) => (
                        <a
                            key={idx}
                            href={video.videoUrl}
                            className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-bold text-zinc-500">{idx + 1}</span>
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                                <h4 className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">{video.videoTitle}</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-wide">Verified View</span>
                                    <span className="text-[9px] text-zinc-700">·</span>
                                    <span className="text-[9px] text-zinc-600">{new Date(video.updatedAt).toLocaleDateString("id-ID")}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
