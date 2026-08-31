"use client";

import React, { useState, useEffect } from "react";
import {
    Link2,
    Plus,
    Copy,
    Trash2,
    Check,
    Globe,
    Sparkles,
    MousePointerClick,
    Search,
    RefreshCw,
    ShieldAlert,
    X,
    Zap,
    CheckCircle2
} from "lucide-react";
import { useToast } from "@/components/ToastContext";

interface VanityLink {
    id: string;
    slug: string;
    targetUrl: string;
    clicks: number;
    isActive: boolean;
    createdAt: string;
}

interface CollectedLink {
    id: string;
    videoId: string;
    videoTitle: string;
    videoUrl: string;
}

export default function MemberVanityClient({ user }: { user: any }) {
    const [links, setLinks] = useState<VanityLink[]>([]);
    const [collectedLinks, setCollectedLinks] = useState<CollectedLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    // Form inputs
    const [slugInput, setSlugInput] = useState("");
    const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
    const [customTargetUrl, setCustomTargetUrl] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [selectedDomain, setSelectedDomain] = useState("cdn.cuanflix.site");

    // Copy Modal State
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [copyModalTargetSlug, setCopyModalTargetSlug] = useState<string | null>(null); // null = copy all

    const { showToast } = useToast();

    const DOMAIN_OPTIONS = [
        {
            domain: "cdn.cuanflix.site",
            title: "CDN Subdomain",
            badge: "⚡ REKOMENDASI TWITTER / X",
            badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            desc: "Format link file CDN (contoh: cdn.cuanflix.site/video.mp4). Anti-banned, aman di sosmed & menaikkan klik!",
            icon: Zap
        },
        {
            domain: "cuanflix.site",
            title: "Domain Utama",
            badge: "🌐 DIRECT WEBSITE",
            badgeStyle: "bg-sky-500/20 text-sky-300 border-sky-500/30",
            desc: "Alamat utama website cuanflix.site. Cocok untuk link direct ke halaman platform.",
            icon: Globe
        }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, cRes] = await Promise.all([
                fetch(`/api/member/vanity-links?t=${Date.now()}`, { cache: "no-store" }),
                fetch(`/api/links?t=${Date.now()}`, { cache: "no-store" })
            ]);

            if (vRes.ok) {
                const data = await vRes.json();
                setLinks(data.links || []);
            }

            if (cRes.ok) {
                const cData = await cRes.json();
                setCollectedLinks(cData || []);
            }
        } catch (e) {
            console.error("Fetch data error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        const targetUrl = selectedVideoUrl || customTargetUrl;

        if (!slugInput.trim() || !targetUrl.trim()) {
            setErrorMsg("Slug dan Target Video wajib diisi!");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/member/vanity-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: slugInput.trim(),
                    targetUrl: targetUrl.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || "Gagal membuat custom link");
            } else {
                setSuccessMsg(`Berhasil membuat link: https://${selectedDomain}/${data.link.slug}`);
                showToast("Custom link berhasil dibuat!", "success");
                setSlugInput("");
                setSelectedVideoUrl("");
                setCustomTargetUrl("");
                fetchData();
            }
        } catch (err) {
            setErrorMsg("Terjadi kesalahan jaringan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm(`Yakin ingin menghapus link '${slug}'?`)) return;
        try {
            const res = await fetch(`/api/member/vanity-links/${encodeURIComponent(slug)}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setLinks(prev => prev.filter(l => l.slug !== slug));
                showToast("Link berhasil dihapus", "info");
            }
        } catch (e) {
            console.error("Delete failed:", e);
        }
    };

    const executeCopy = (domainChoice: string) => {
        if (copyModalTargetSlug) {
            const fullUrl = `https://${domainChoice}/${copyModalTargetSlug}`;
            navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(copyModalTargetSlug);
            showToast(`Link berhasil disalin (${domainChoice})!`, "success");
            setTimeout(() => setCopiedSlug(null), 2000);
        } else {
            if (filteredLinks.length === 0) return;
            const text = filteredLinks.map(l => `https://${domainChoice}/${l.slug}`).join("\n");
            navigator.clipboard.writeText(text);
            showToast(`Berhasil menyalin ${filteredLinks.length} URL (${domainChoice})!`, "success");
        }
        setCopyModalOpen(false);
    };

    const openCopyModal = (slug: string | null = null) => {
        setCopyModalTargetSlug(slug);
        setCopyModalOpen(true);
    };

    const filteredLinks = links.filter(l =>
        l.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.targetUrl.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);

    return (
        <div className="space-y-5 sm:space-y-6 max-w-full overflow-hidden">

            {/* Banner Panduan */}
            <div className="bg-[#0F0F11] border border-sky-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center shrink-0">
                            <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
                                Custom Link Shortener
                                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    CDN Domain Active
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                                Ubah link video biasa menjadi URL custom unik buatanmu (contoh: <code className="text-emerald-300 font-mono font-bold">cdn.cuanflix.site/video-viral.mp4</code>). 
                                Ketika pengunjung mengklik link buatanmu, <strong className="text-white">saldo Referral milikmu otomatis bertambah!</strong>
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <MousePointerClick className="w-3 h-3 text-sky-400" /> Total Klik Linkmu
                        </div>
                        <div className="text-lg sm:text-2xl font-black text-sky-400">
                            {totalClicks.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Generator */}
            <div className="bg-[#0F0F11] border border-white/8 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-sky-400" /> Buat Custom Link Baru
                </h3>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 break-all">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4 sm:space-y-5">
                    {/* Domain Picker Options (Responsive Cards) */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-2">
                            Pilih Format Domain Link:
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {DOMAIN_OPTIONS.map((opt) => {
                                const isSelected = selectedDomain === opt.domain;
                                const IconComp = opt.icon;
                                return (
                                    <button
                                        key={opt.domain}
                                        type="button"
                                        onClick={() => setSelectedDomain(opt.domain)}
                                        className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                            isSelected
                                                ? "bg-sky-500/15 border-sky-400/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/40"
                                                : "bg-black/50 border-white/8 hover:border-white/20 hover:bg-black/70"
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <IconComp className={`w-4 h-4 ${isSelected ? "text-sky-400" : "text-zinc-400"}`} />
                                                    <span className="text-xs font-bold text-white font-mono">
                                                        {opt.domain}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeStyle}`}>
                                                    {opt.badge}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 leading-normal">
                                                {opt.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Custom Slug Input with Responsive Flex Prefix */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                                Nama Link Custom (Bisa Extension <code className="text-sky-300 font-mono">.mp4</code>):
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-white/10 bg-black/60 overflow-hidden focus-within:border-sky-400 transition-all">
                                <div className="px-3 py-2 bg-white/5 border-b sm:border-b-0 sm:border-r border-white/10 text-[11px] font-mono text-zinc-400 flex items-center shrink-0 whitespace-nowrap">
                                    https://{selectedDomain}/
                                </div>
                                <input
                                    type="text"
                                    placeholder="video-mantap.mp4"
                                    value={slugInput}
                                    onChange={(e) => setSlugInput(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-transparent text-xs font-mono text-white focus:outline-none"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-1">
                                Contoh: <span className="text-zinc-400">skandal-hot.mp4</span>, <span className="text-zinc-400">viral-indo</span>
                            </p>
                        </div>

                        {/* Target Selection */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                                Pilih Video dari Koleksimu:
                            </label>
                            {collectedLinks.length > 0 ? (
                                <select
                                    value={selectedVideoUrl}
                                    onChange={(e) => {
                                        setSelectedVideoUrl(e.target.value);
                                        setCustomTargetUrl("");
                                    }}
                                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 transition-all truncate"
                                >
                                    <option value="">-- Pilih dari Koleksi ({collectedLinks.length} video) --</option>
                                    {collectedLinks.map(c => (
                                        <option key={c.id} value={c.videoUrl}>
                                            {c.videoTitle.length > 45 ? c.videoTitle.substring(0, 45) + "..." : c.videoTitle}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Paste URL video (e.g. /watch/jav/604988)"
                                    value={customTargetUrl}
                                    onChange={(e) => {
                                        setCustomTargetUrl(e.target.value);
                                        setSelectedVideoUrl("");
                                    }}
                                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-400 transition-all"
                                />
                            )}
                            <p className="text-[10px] text-zinc-500 mt-1">
                                {collectedLinks.length > 0 ? "Atau cari video baru di tab 'Cari Link'" : "Tambah video ke Koleksi untuk memilih dari dropdown"}
                            </p>
                        </div>
                    </div>

                    {/* Live Preview */}
                    {slugInput.trim() && (
                        <div className="p-3 bg-sky-500/10 border border-sky-400/20 rounded-xl text-xs font-mono text-sky-300 flex items-center justify-between break-all">
                            <span>
                                Preview Link: <strong className="text-white">https://{selectedDomain}/{slugInput.trim()}</strong>
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                        Buat Link Custom Sekarang
                    </button>
                </form>
            </div>

            {/* List Custom Links */}
            <div className="bg-[#0F0F11] border border-white/8 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-400" /> Custom Link Buatanmu ({filteredLinks.length})
                    </h3>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {filteredLinks.length > 0 && (
                            <button
                                onClick={() => openCopyModal(null)}
                                className="px-3.5 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Semua URL ({filteredLinks.length})</span>
                            </button>
                        )}

                        {links.length > 0 && (
                            <div className="relative w-full sm:w-56">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Cari link buatanmu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> Memuat data...
                    </div>
                ) : filteredLinks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-2xl space-y-2 p-4">
                        <Link2 className="w-8 h-8 text-zinc-600 mx-auto" />
                        <p>Kamu belum membuat Custom Link. Buat link pertama milikmu di atas!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredLinks.map((link) => {
                            const isCopied = copiedSlug === link.slug;
                            const fullUrl = `https://${selectedDomain}/${link.slug}`;
                            return (
                                <div
                                    key={link.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-sky-500/30 transition-all group overflow-hidden"
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs sm:text-sm font-bold text-sky-300 font-mono bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-400/20 break-all">
                                                {fullUrl}
                                            </code>
                                        </div>

                                        <div className="text-[11px] text-zinc-400 font-mono truncate flex items-center gap-1">
                                            <span className="shrink-0">Target:</span>
                                            <span className="text-zinc-200 truncate">{link.targetUrl}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
                                        {/* Clicks */}
                                        <div className="text-left sm:text-right shrink-0">
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Klik</div>
                                            <div className="text-xs sm:text-sm font-black text-sky-400">{link.clicks || 0}</div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => openCopyModal(link.slug)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    isCopied ? "bg-emerald-500 text-white" : "bg-sky-500/10 text-sky-300 border border-sky-400/20 hover:bg-sky-500/20"
                                                }`}
                                            >
                                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{isCopied ? "Copied!" : "Copy Link"}</span>
                                            </button>

                                            <button
                                                onClick={() => handleDelete(link.slug)}
                                                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                                title="Hapus Link"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* POPUP MODAL: COPY OPTIONS WITH DOMAIN PREVIEWS */}
            {copyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="bg-[#12141A] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
                                <h3 className="text-sm sm:text-base font-black text-white">
                                    {copyModalTargetSlug ? `Copy Link /${copyModalTargetSlug}` : `Copy Semua ${filteredLinks.length} Link`}
                                </h3>
                            </div>
                            <button
                                onClick={() => setCopyModalOpen(false)}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-zinc-400">
                            Pilih format domain yang ingin disalin ke clipboard:
                        </p>

                        <div className="space-y-3">
                            {DOMAIN_OPTIONS.map((opt) => {
                                const IconComp = opt.icon;
                                return (
                                    <button
                                        key={opt.domain}
                                        onClick={() => executeCopy(opt.domain)}
                                        className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/8 hover:border-sky-400/60 hover:bg-sky-500/10 transition-all group"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <IconComp className="w-4 h-4 text-sky-400 shrink-0" />
                                                <span className="text-xs sm:text-sm font-bold text-white font-mono group-hover:text-sky-300">
                                                    https://{opt.domain}
                                                </span>
                                            </div>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${opt.badgeStyle}`}>
                                                {opt.badge}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-400 leading-normal">
                                            {opt.desc}
                                        </p>
                                        <div className="mt-2 text-right">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 group-hover:underline">
                                                <Copy className="w-3 h-3" /> Salin Pakai Domain Ini
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
