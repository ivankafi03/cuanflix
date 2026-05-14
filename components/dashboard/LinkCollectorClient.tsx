"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Search, Plus, Check, Loader2, BookmarkPlus, X,
    ChevronLeft, ChevronRight, Link as LinkIcon,
    Copy, Trash2, CheckCheck, Package
} from "lucide-react";
import { useToast } from "../ToastContext";
import ConfirmModal from "../ConfirmModal";

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

interface CollectedLink {
    id: string;
    videoId: string;
    videoTitle: string;
    videoUrl: string;
    viewCount?: number;
}

export default function LinkCollectorClient({ user }: { user: any }) {
    // Browser state
    const [query, setQuery] = useState("");
    const [videos, setVideos] = useState<Video[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [browsing, setBrowsing] = useState(false);
    const [adding, setAdding] = useState<Set<string>>(new Set());
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    // Collection state
    const [collectedLinks, setCollectedLinks] = useState<CollectedLink[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copying, setCopying] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // UI state
    const [activePanel, setActivePanel] = useState<"browse" | "collection">("browse");
    const [origin, setOrigin] = useState("");

    const { showToast } = useToast();
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setOrigin(window.location.origin);
        fetchCollection();
        fetchVideos("", 1);
    }, []);

    // ─── Fetch video list ────────────────────────────────────────────────
    const fetchVideos = useCallback(async (q: string, p: number) => {
        setBrowsing(true);
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
            setBrowsing(false);
        }
    }, []);

    // ─── Fetch collection ────────────────────────────────────────────────
    const fetchCollection = async () => {
        const res = await fetch(`/api/links?t=${Date.now()}`);
        if (res.ok) {
            const data = await res.json();
            setCollectedLinks(data);
            setAddedIds(new Set(data.map((l: CollectedLink) => l.videoId)));
        }
    };

    // ─── Debounced search ────────────────────────────────────────────────
    const handleSearch = (val: string) => {
        setQuery(val);
        setPage(1);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchVideos(val, 1), 500);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchVideos(query, newPage);
    };

    // ─── Add to collection ───────────────────────────────────────────────
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
                await fetchCollection();
                showToast(`"${video.title.substring(0, 30)}..." ditambahkan!`, "success");
            }
        } catch {
            showToast("Gagal menambah link", "error");
        } finally {
            setAdding(prev => { const s = new Set(prev); s.delete(video.videoId); return s; });
        }
    };

    // ─── Collection operations ───────────────────────────────────────────
    const toggleSelect = (id: string) => {
        const s = new Set(selectedIds);
        if (s.has(id)) s.delete(id); else s.add(id);
        setSelectedIds(s);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === collectedLinks.length && collectedLinks.length > 0)
            setSelectedIds(new Set());
        else
            setSelectedIds(new Set(collectedLinks.map(l => l.id)));
    };

    const copyLinks = () => {
        const toCopy = selectedIds.size > 0
            ? collectedLinks.filter(l => selectedIds.has(l.id))
            : collectedLinks;

        if (!toCopy.length) { showToast("Koleksi kosong!", "error"); return; }

        // Copy only URLs, one per line — clean format
        const text = toCopy.map(l => `${origin}/watch/${l.videoId}`).join("\n");
        navigator.clipboard.writeText(text);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
        showToast(`${toCopy.length} link berhasil dicopy!`, "success");
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const ids = selectedIds.size > 0 ? Array.from(selectedIds) : [];
            await fetch("/api/links", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            });
            await fetchCollection();
            setSelectedIds(new Set());
            showToast("Link dihapus", "success");
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const collectionCount = collectedLinks.length;

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                    Link <span className="text-primary">Collector</span>
                </h2>
                <p className="text-xs text-zinc-500">
                    Cari video, kumpulkan link, copy dan bagikan dengan mudah.
                </p>
            </div>

            {/* Panel Toggle */}
            <div className="flex p-1 bg-black/40 border border-white/5 rounded-2xl w-full">
                <button
                    onClick={() => setActivePanel("browse")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activePanel === "browse" ? "bg-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
                >
                    <Search className="w-3.5 h-3.5" />
                    Cari Video
                </button>
                <button
                    onClick={() => setActivePanel("collection")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activePanel === "collection" ? "bg-primary text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
                >
                    <Package className="w-3.5 h-3.5" />
                    Koleksi
                    {collectionCount > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activePanel === "collection" ? "bg-black/30 text-black" : "bg-primary/20 text-primary"}`}>
                            {collectionCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ─── BROWSE PANEL ─────────────────────────────────────────── */}
            {activePanel === "browse" && (
                <div className="flex flex-col gap-4">
                    {/* Search Box */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Cari judul video... (contoh: FC2, SSIS, IPX)"
                            className="w-full bg-[#0F0F11] border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        {query && (
                            <button onClick={() => handleSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-all">
                                <X className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                        )}
                    </div>

                    {/* Video List */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden relative">
                        <BatikPattern opacity={0.04} />

                        {/* List Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 relative z-10">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                {query ? `Hasil: "${query}"` : "Video Terbaru"}
                            </span>
                            <span className="text-[9px] text-zinc-600">{videos.length} video</span>
                        </div>

                        {/* Loading */}
                        {browsing && (
                            <div className="flex items-center justify-center py-16 gap-3 relative z-10">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-xs text-zinc-500">Memuat video...</span>
                            </div>
                        )}

                        {/* Video list items */}
                        {!browsing && (
                            <div className="divide-y divide-white/[0.03] relative z-10">
                                {videos.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-30">
                                        <Search className="w-8 h-8" />
                                        <p className="text-[10px] font-semibold uppercase tracking-wide">Tidak ada hasil</p>
                                    </div>
                                )}
                                {videos.map((video, idx) => {
                                    const isAdded = addedIds.has(video.videoId);
                                    const isAdding = adding.has(video.videoId);
                                    return (
                                        <div key={idx}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-all group">
                                            {/* Nomor */}
                                            <span className="text-[9px] font-bold text-zinc-700 w-5 shrink-0 text-right">{((page - 1) * 20) + idx + 1}</span>

                                            {/* Judul */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white truncate group-hover:text-primary/90 transition-colors">
                                                    {video.title}
                                                </p>
                                                {video.episode && (
                                                    <span className="text-[9px] text-zinc-600">{video.episode}</span>
                                                )}
                                            </div>

                                            {/* Add Button */}
                                            <button
                                                onClick={() => addToCollection(video)}
                                                disabled={isAdded || isAdding}
                                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all ${isAdded
                                                    ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                                                    : isAdding
                                                        ? "bg-primary/10 text-primary/60 border border-primary/10 cursor-wait"
                                                        : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black hover:scale-105 active:scale-95"
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <><Check className="w-3 h-3 stroke-[3]" /> Added</>
                                                ) : isAdding ? (
                                                    <><Loader2 className="w-3 h-3 animate-spin" /> Adding</>
                                                ) : (
                                                    <><Plus className="w-3 h-3 stroke-[3]" /> Koleksi</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && !browsing && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 relative z-10">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-3 h-3" /> Prev
                                </button>
                                <span className="text-[9px] font-semibold text-zinc-500">
                                    Hal {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── COLLECTION PANEL ─────────────────────────────────────── */}
            {activePanel === "collection" && (
                <div className="flex flex-col gap-4">
                    {/* Action Bar */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 relative overflow-hidden">
                        <BatikPattern />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative z-10">
                            {/* Left info */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                                    <LinkIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">{collectionCount} Link Tersimpan</p>
                                    <p className="text-[9px] text-zinc-500">
                                        {selectedIds.size > 0 ? `${selectedIds.size} dipilih` : "Klik link untuk pilih"}
                                    </p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                {/* Select All */}
                                <button onClick={toggleSelectAll}
                                    className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wide">
                                    {selectedIds.size === collectionCount && collectionCount > 0 ? "Batal Pilih" : "Pilih Semua"}
                                </button>

                                {/* Copy */}
                                <button onClick={copyLinks} disabled={collectionCount === 0}
                                    className="px-4 py-2 bg-primary text-black font-black text-[9px] uppercase tracking-wide rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                                    {copying ? <CheckCheck className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                                    {selectedIds.size > 0 ? `Copy (${selectedIds.size})` : "Copy Semua"}
                                </button>

                                {/* Delete */}
                                <button onClick={() => setIsDeleteModalOpen(true)} disabled={collectionCount === 0}
                                    className="p-2 bg-red-500/10 border border-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Collection List */}
                    <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden">
                        {collectionCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-25">
                                <BookmarkPlus className="w-10 h-10" />
                                <div className="text-center">
                                    <p className="text-xs font-black uppercase tracking-widest">Koleksi Kosong</p>
                                    <p className="text-[9px] text-zinc-500 mt-1">Cari video dan klik "+ Koleksi" untuk menambah</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.03]">
                                {/* Header row */}
                                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02]">
                                    <div className="w-4 h-4 shrink-0" />
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex-1">Judul Video</span>
                                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest w-16 text-right">Hits</span>
                                </div>

                                {collectedLinks.map((link, idx) => {
                                    const isSelected = selectedIds.has(link.id);
                                    return (
                                        <div key={link.id}
                                            onClick={() => toggleSelect(link.id)}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${isSelected
                                                ? "bg-primary/10 border-l-2 border-primary"
                                                : "hover:bg-white/[0.03] border-l-2 border-transparent"
                                                }`}>
                                            {/* Checkbox */}
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-white/15 bg-white/3"}`}>
                                                {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[4]" />}
                                            </div>

                                            {/* No + Title */}
                                            <span className="text-[9px] text-zinc-700 w-5 shrink-0 text-right">{idx + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-semibold truncate transition-colors ${isSelected ? "text-primary" : "text-white/80"}`}>
                                                    {link.videoTitle}
                                                </p>
                                                <p className="text-[9px] text-zinc-600 truncate font-mono">
                                                    /watch/{link.videoId}
                                                </p>
                                            </div>

                                            {/* View count badge */}
                                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-16 text-right shrink-0 ${(link.viewCount || 0) > 0 ? "text-primary" : "text-zinc-700"}`}>
                                                {link.viewCount || 0} hits
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Preview copy result */}
                    {collectionCount > 0 && (
                        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 relative overflow-hidden">
                            <BatikPattern opacity={0.04} />
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">
                                Preview Format Copy
                            </p>
                            <div className="bg-black/60 rounded-xl p-3 font-mono text-[9px] text-zinc-400 leading-relaxed max-h-28 overflow-y-auto no-scrollbar relative z-10">
                                {(selectedIds.size > 0
                                    ? collectedLinks.filter(l => selectedIds.has(l.id))
                                    : collectedLinks.slice(0, 5)
                                ).map(l => (
                                    <div key={l.id}>{origin}/watch/{l.videoId}</div>
                                ))}
                                {selectedIds.size === 0 && collectionCount > 5 && (
                                    <div className="text-zinc-700 mt-1">... dan {collectionCount - 5} link lainnya</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={selectedIds.size > 0 ? `Hapus ${selectedIds.size} link?` : "Hapus Semua Link?"}
                message="Tindakan ini tidak bisa dibatalkan."
            />
        </div>
    );
}
