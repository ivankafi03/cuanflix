"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Share2, Link as LinkIcon, Copy, Trash2, Check, Rocket,
    AlertCircle, Globe, TrendingUp, Users, DollarSign, BarChart2, Eye, Plus
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useToast } from "../ToastContext";
import ConfirmModal from "../ConfirmModal";

// ─── Country flag emoji helper ─────────────────────────────────────────────
function countryToFlag(country: string): string {
    const flags: Record<string, string> = {
        "Indonesia": "🇮🇩", "United States": "🇺🇸", "Malaysia": "🇲🇾",
        "Singapore": "🇸🇬", "Philippines": "🇵🇭", "Thailand": "🇹🇭",
        "Japan": "🇯🇵", "South Korea": "🇰🇷", "India": "🇮🇳",
        "Australia": "🇦🇺", "United Kingdom": "🇬🇧", "Germany": "🇩🇪",
        "France": "🇫🇷", "Netherlands": "🇳🇱", "Canada": "🇨🇦",
        "Brazil": "🇧🇷", "Vietnam": "🇻🇳", "China": "🇨🇳",
        "Taiwan": "🇹🇼", "Unknown": "🌍"
    };
    return flags[country] || "🌍";
}

// ─── Batik Pink Pattern ────────────────────────────────────────────────────
const BatikPattern = ({ opacity = 0.06 }: { opacity?: number }) => (
    <div className="absolute inset-0 bg-batik-pink pointer-events-none overflow-hidden" style={{ opacity }} />
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
                    <span className="text-zinc-300">{p.name}:</span>
                    <span className="text-white font-bold">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function ShareClient({ user }: { user: any }) {
    const [collectedLinks, setCollectedLinks] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copying, setCopying] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [origin, setOrigin] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        setOrigin(window.location.origin);
        const fetchAll = async () => {
            const [linksRes, analyticsRes] = await Promise.all([
                fetch(`/api/links?t=${Date.now()}`),
                fetch(`/api/member/analytics?t=${Date.now()}`)
            ]);
            if (linksRes.ok) setCollectedLinks(await linksRes.json());
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            setLoading(false);
        };
        fetchAll();
    }, []);

    const toggleSelect = (id: string) => {
        const s = new Set(selectedIds);
        if (s.has(id)) s.delete(id); else s.add(id);
        setSelectedIds(s);
    };

    const handleConfirmDelete = async () => {
        setClearing(true);
        try {
            const res = await fetch("/api/links", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            if (res.ok) {
                if (selectedIds.size === 0 || selectedIds.size === collectedLinks.length)
                    setCollectedLinks([]);
                else
                    setCollectedLinks(prev => prev.filter(l => !selectedIds.has(l.id)));
                setSelectedIds(new Set());
                showToast("Links removed successfully", "success");
            }
        } catch {
            showToast("Failed to remove links", "error");
        } finally {
            setClearing(false);
            setIsDeleteModalOpen(false);
        }
    };

    const copySelectedLinks = () => {
        setCopying(true);
        const toCopy = selectedIds.size > 0
            ? collectedLinks.filter(l => selectedIds.has(l.id))
            : collectedLinks;
        if (!toCopy.length) { showToast("No links!", "error"); setCopying(false); return; }
        
        const refCode = user?.id?.substring(0, 8);
        const text = toCopy.map(l => {
            let url = l.videoUrl;
            if (refCode && !url.includes("ref=")) {
                url += (url.includes("?") ? "&" : "?") + `ref=${refCode}`;
            }
            return `${l.videoTitle}: ${url}`;
        }).join("\n");

        navigator.clipboard.writeText(text);
        showToast(`Copied ${toCopy.length} links!`, "success");
        setTimeout(() => setCopying(false), 1000);
    };

    const totalReferralViews = analytics?.summary?.totalReferralViews7d ?? 0;

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-bold text-white tracking-tight">Share <span className="text-primary">Analytics</span></h2>
                    <p className="text-xs text-zinc-500">Statistik sharelink & asal penonton kamu.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={copySelectedLinks} disabled={copying || !collectedLinks.length}
                        className="px-4 py-2 bg-primary text-white shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-wide rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50">
                        {copying ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {selectedIds.size > 0 ? `Copy (${selectedIds.size})` : "Copy All"}
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(true)} disabled={clearing || !collectedLinks.length}
                        className="p-2 bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total Link", icon: LinkIcon, color: "text-primary", value: collectedLinks.length.toString(), sub: "dikumpulkan" },
                    { label: "Views 7 Hari", icon: Eye, color: "text-blue-400", value: totalReferralViews.toString(), sub: "penonton unik" },
                    { label: "Referral Balance", icon: DollarSign, color: "text-green-400", value: `$${(user?.balanceReferral || 0).toFixed(3)}`, sub: "total reward" },
                    { label: "Earning 7 Hari", icon: TrendingUp, color: "text-orange-400", value: `$${(analytics?.summary?.totalReferralEarnings7d || 0).toFixed(4)}`, sub: "dari share" },
                ].map(item => (
                    <div key={item.label} className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-white/10 transition-all">
                        <BatikPattern />
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">{item.label}</p>
                            <div className="flex items-center gap-1.5">
                                {item.label === "Total Link" && (
                                    <Link 
                                        href="/dashboard/carilink"
                                        className="p-1 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/5 cursor-pointer relative z-20"
                                        title="Tambah Koleksi Link"
                                    >
                                        <Plus className="w-3 h-3 stroke-[3]" />
                                    </Link>
                                )}
                                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className={`text-xl font-bold tracking-tighter ${item.color}`}>{item.value}</h3>
                            <span className="text-[9px] text-zinc-600">{item.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart — Referral Views 7 Hari */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                <BatikPattern opacity={0.04} />
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-2">
                            <BarChart2 className="w-3.5 h-3.5 text-primary" />
                            Views Sharelink — 7 Hari Terakhir
                        </h3>
                        <p className="text-[9px] text-zinc-600 mt-0.5">Penonton yang datang dari linkmu</p>
                    </div>
                </div>
                {loading || !analytics ? (
                    <div className="h-44 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="relative z-10">
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={analytics.viewChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#71717a", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="referral" name="Referral Views" stroke="#f472b6" fill="url(#refGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Country Breakdown + Top Videos row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country Breakdown */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                    <BatikPattern opacity={0.05} />
                    <div className="flex items-center gap-2 relative z-10">
                        <Globe className="w-3.5 h-3.5 text-primary" />
                        <h3 className="text-xs font-bold text-white">Asal Penonton</h3>
                    </div>
                    {loading || !analytics ? (
                        <div className="flex flex-col gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : analytics.countryBreakdown.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-25 gap-3 relative z-10">
                            <Globe className="w-8 h-8" />
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-center">Belum ada data negara. Share linkmu dulu!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5 relative z-10">
                            {analytics.countryBreakdown.map((c: any, i: number) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{countryToFlag(c.country)}</span>
                                            <span className="text-xs font-semibold text-white">{c.country}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-zinc-500">{c.count} views</span>
                                            <span className="text-[9px] font-bold text-primary">{c.percent}%</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${c.percent}%`,
                                                background: i === 0
                                                    ? "linear-gradient(90deg, #f472b6, #fb7185)"
                                                    : i === 1
                                                        ? "linear-gradient(90deg, #818cf8, #6366f1)"
                                                        : "rgba(255,255,255,0.2)"
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Shared Videos */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
                    <BatikPattern opacity={0.05} />
                    <div className="flex items-center gap-2 relative z-10">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                        <h3 className="text-xs font-bold text-white">Video Terpopuler</h3>
                        <span className="text-[9px] text-zinc-500">via sharelink</span>
                    </div>
                    {loading || !analytics ? (
                        <div className="flex flex-col gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : analytics.topVideos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-25 gap-3 relative z-10">
                            <TrendingUp className="w-8 h-8" />
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-center">Belum ada data. Share videomu!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 relative z-10">
                            {analytics.topVideos.map((v: any, i: number) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-white/5 hover:bg-white/8"}`}>
                                    <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-primary" : i === 1 ? "text-zinc-300" : "text-zinc-600"}`}>#{i + 1}</span>
                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-white truncate uppercase">{v.videoId}</span>
                                        <span className="text-[9px] text-zinc-500">{v.views} views via share</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? "bg-primary/20 text-primary" : "bg-white/5 text-zinc-500"}`}>
                                            🔥 Hot
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Referral Link Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-batik-pink opacity-[0.06] pointer-events-none group-hover:opacity-[0.12] transition-all" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                            <Rocket className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Link Referral Kamu</h4>
                            <p className="text-[10px] text-primary/70 font-medium">Setiap klik = cuan masuk 💰</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-1.5 pl-4">
                        <code className="text-xs font-bold text-primary/80 truncate max-w-[180px]">
                            {origin}/?ref={user?.id?.substring(0, 8)}
                        </code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${origin}/?ref=${user?.id?.substring(0, 8)}`);
                                showToast("Referral link copied!", "success");
                            }}
                            className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                        >
                            <Copy className="w-3 h-3" /> Copy
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={selectedIds.size > 0 ? `Hapus ${selectedIds.size} Link?` : "Hapus Semua?"}
                message="Tindakan ini tidak bisa dibatalkan."
            />
        </div>
    );
}
