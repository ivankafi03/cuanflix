"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Search, Plus, Check, Loader2, X,
    ChevronLeft, ChevronRight, BookmarkPlus, Sparkles
} from "lucide-react";
import { useToast } from "../ToastContext";

// ─── Batik Pink Pattern ────────────────────────────────────────────────────
const BatikPattern = ({ opacity = 0.06 }: { opacity?: number }) => (
    <div className="absolute inset-0 bg-batik-pink pointer-events-none overflow-hidden" style={{ opacity }} />
);

interface Video {
    title: string;
    videoId: string;
    videoUrl: string;
    episode?: string;
}

export default function CariLinkClient({ user }: { user: any }) {
    const [query, setQuery] = useState("");
    const [videos, setVideos] = useState<Video[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<Set<string>>(new Set());
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [origin, setOrigin] = useState("");
    const [justAdded, setJustAdded] = useState<string | null>(null);

    const { showToast } = useToast();
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setOrigin(window.location.origin);
        // Load existing collection IDs so we know which are already added
        fetch(`/api/links?t=${Date.now()}`).then(r => r.json()).then(data => {
            if (Array.isArray(data)) {
                setAddedIds(new Set(data.map((l: any) => l.videoId)));
            }
        });
        fetchVideos("", 1);
    }, []);

    const fetchVideos = useCallback(async (q: string, p: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/member/videos?q=${encodeURIComponent(q)}&page=${p}&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setVideos(data.videos || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch {
            showToast("Gagal memuat video", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (val: string) => {
        setQuery(val);
        setPage(1);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchVideos(val, 1), 500);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        fetchVideos(query, p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const addToCollection = async (video: Video) => {
        if (addedIds.has(video.videoId) || adding.has(video.videoId)) return;
        setAdding(prev => new Set(prev).add(video.videoId));
        try {
            const watchUrl = `${origin}/watch/${video.videoId}`;
            const res = await fetch("/api/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoId: video.videoId,
                    videoTitle: video.title,
                    videoUrl: watchUrl
                })
            });
            if (res.ok) {
                setAddedIds(prev => new Set(prev).add(video.videoId));
                setJustAdded(video.videoId);
                setTimeout(() => setJustAdded(null), 2000);
                showToast(`Ditambahkan ke koleksi!`, "success");
            }
        } catch {
            showToast("Gagal menambah link", "error");
        } finally {
            setAdding(prev => { const s = new Set(prev); s.delete(video.videoId); return s; });
        }
    };

    const totalAdded = addedIds.size;

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-bold text-white tracking-tight">
                        Cari <span className="text-primary">Link</span>
                    </h2>
                    <p className="text-xs text-zinc-500">
                        Temukan video dan tambahkan ke koleksi linkmu untuk di-share.
                    </p>
                </div>
                {/* Collection counter badge */}
                <div className="flex items-center gap-2 bg-[#0F0F11] border border-white/5 px-4 py-2.5 rounded-2xl shrink-0 relative overflow-hidden">
                    <BatikPattern opacity={0.08} />
                    <BookmarkPlus className="w-3.5 h-3.5 text-primary relative z-10" />
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-white">{totalAdded}</span>
                        <span className="text-xs text-zinc-500"> link di koleksi</span>
                    </div>
                </div>
            </div>

            {/* Search Box */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Ketik judul, kode JAV, atau nama aktris..."
                    className="w-full bg-[#0F0F11] border border-white/8 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {query && (
                    <button onClick={() => handleSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-all">
                        <X className="w-4 h-4 text-zinc-500" />
                    </button>
                )}
            </div>

            {/* Stats row */}
            {!loading && (
                <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                    <Sparkles className="w-3 h-3 text-primary/60" />
                    <span>
                        {query
                            ? `${videos.length} hasil untuk "${query}"`
                            : `Menampilkan ${videos.length} video terbaru`}
                        {totalPages > 1 && ` · Halaman ${page} dari ${totalPages}`}
                    </span>
                </div>
            )}

            {/* Video List */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden relative">
                <BatikPattern opacity={0.03} />

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 relative z-10">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                        </div>
                        <span className="text-xs text-zinc-500">Memuat video...</span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && videos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-25 relative z-10">
                        <Search className="w-10 h-10" />
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-widest">Tidak ada hasil</p>
                            <p className="text-[9px] text-zinc-500 mt-1">Coba kata kunci yang berbeda</p>
                        </div>
                    </div>
                )}

                {/* Video list */}
                {!loading && videos.length > 0 && (
                    <>
                        {/* Table header */}
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-white/[0.02] relative z-10">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.15em] w-8 text-center">#</span>
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.15em] flex-1">Judul Video</span>
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.15em] w-24 text-right">Aksi</span>
                        </div>

                        <div className="divide-y divide-white/[0.03] relative z-10">
                            {videos.map((video, idx) => {
                                const isAdded = addedIds.has(video.videoId);
                                const isAdding = adding.has(video.videoId);
                                const isJustAdded = justAdded === video.videoId;
                                const rowNum = ((page - 1) * 20) + idx + 1;

                                return (
                                    <div
                                        key={`${video.videoId}-${idx}`}
                                        className={`flex items-center gap-3 px-5 py-3.5 transition-all group ${isJustAdded ? "bg-green-500/5" : isAdded ? "bg-white/[0.01]" : "hover:bg-white/[0.025]"}`}
                                    >
                                        {/* Row number */}
                                        <span className="text-[9px] font-bold text-zinc-700 w-8 text-center shrink-0">
                                            {rowNum}
                                        </span>

                                        {/* Title + episode */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate transition-colors leading-snug ${isAdded ? "text-zinc-500" : "text-white group-hover:text-primary/90"}`}>
                                                {video.title}
                                            </p>
                                            {video.episode && (
                                                <span className="text-[9px] text-zinc-600 font-medium">{video.episode}</span>
                                            )}
                                        </div>

                                        {/* Add button */}
                                        <button
                                            onClick={() => addToCollection(video)}
                                            disabled={isAdded || isAdding}
                                            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${isAdded
                                                ? "bg-transparent text-zinc-600 cursor-default"
                                                : isAdding
                                                    ? "bg-primary/10 text-primary/50 cursor-wait"
                                                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black hover:shadow-[0_0_12px_rgba(244,114,182,0.4)] hover:scale-105 active:scale-95"
                                                }`}
                                        >
                                            {isAdded ? (
                                                <><Check className="w-3.5 h-3.5 stroke-[3] text-green-500" /> <span className="text-green-600">Saved</span></>
                                            ) : isAdding ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding</>
                                            ) : (
                                                <><Plus className="w-3.5 h-3.5 stroke-[3]" /> Koleksi</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0F0F11] border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const p = i + 1;
                            return (
                                <button key={p} onClick={() => handlePageChange(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? "bg-primary text-black" : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white"}`}>
                                    {p}
                                </button>
                            );
                        })}
                        {totalPages > 5 && <span className="text-zinc-600 text-xs">...</span>}
                    </div>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0F0F11] border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Info banner */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
                <BookmarkPlus className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                    Link yang ditambahkan akan muncul di tab <span className="text-white font-semibold">Koleksi</span>. Dari sana kamu bisa copy semua URL sekaligus dan share ke mana saja.
                </p>
            </div>
        </div>
    );
}
