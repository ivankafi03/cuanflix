"use client";

import React, { useState, useEffect } from "react";
import {
    Link as LinkIcon, Copy, Trash2, CheckCheck, 
    BookmarkPlus, Check, Trash
} from "lucide-react";
import { useToast } from "../ToastContext";
import ConfirmModal from "../ConfirmModal";

const BatikPattern = ({ opacity = 0.06 }: { opacity?: number }) => (
    <div className="absolute inset-0 bg-batik-pink pointer-events-none overflow-hidden" style={{ opacity }} />
);

interface CollectedLink {
    id: string;
    videoId: string;
    videoTitle: string;
    videoUrl: string;
    viewCount?: number;
}

export default function LinkCollectorClient({ user }: { user: any }) {
    const [collectedLinks, setCollectedLinks] = useState<CollectedLink[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copying, setCopying] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [origin, setOrigin] = useState("");

    const { showToast } = useToast();

    useEffect(() => {
        setOrigin(window.location.origin);
        fetchCollection();
    }, []);

    const fetchCollection = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/links?t=${Date.now()}`);
            if (res.ok) {
                setCollectedLinks(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

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

        if (!toCopy.length) { 
            showToast("Koleksi masih kosong!", "error"); 
            return; 
        }

        // FORMAT: Hanya URL saja, satu per baris (Rapi kebawah)
        const refCode = user?.id?.substring(0, 8);
        const text = toCopy.map(l => {
            const baseUrl = `${origin}/watch/${l.videoId}`;
            return refCode ? `${baseUrl}?ref=${refCode}` : baseUrl;
        }).join("\n");
        
        navigator.clipboard.writeText(text);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
        showToast(`${toCopy.length} link berhasil dicopy ke clipboard!`, "success");
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
            showToast("Berhasil dihapus dari koleksi", "success");
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                    Koleksi <span className="text-primary">Link</span>
                </h2>
                <p className="text-xs text-zinc-500">
                    Kelola link yang sudah kamu kumpulkan dari tab "Cari Link".
                </p>
            </div>

            {/* Action Card */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                <BatikPattern opacity={0.1} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <BookmarkPlus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">{collectedLinks.length} Link Koleksi</h3>
                            <p className="text-[10px] text-zinc-500">
                                {selectedIds.size > 0 ? `${selectedIds.size} dipilih untuk dicopy` : "Copy semua atau pilih beberapa"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={copyLinks}
                            disabled={collectedLinks.length === 0}
                            className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            {copying ? <CheckCheck className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                            {selectedIds.size > 0 ? `Copy (${selectedIds.size})` : "Copy Semua"}
                        </button>
                        
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={collectedLinks.length === 0}
                            className="p-2.5 bg-red-500/10 border border-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-40"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Selection Info */}
            <div className="flex items-center justify-between px-1">
                <button 
                    onClick={toggleSelectAll}
                    className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                    {selectedIds.size === collectedLinks.length && collectedLinks.length > 0 ? "Batal Pilih Semua" : "Pilih Semua"}
                </button>
                <div className="h-px bg-white/5 flex-1 mx-4" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    {collectedLinks.length} Item
                </span>
            </div>

            {/* Collection List */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl overflow-hidden relative">
                <BatikPattern opacity={0.03} />

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-30">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Memuat koleksi...</span>
                    </div>
                ) : collectedLinks.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-20 relative z-10 text-center px-6">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                            <LinkIcon className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em]">Koleksi Kosong</p>
                        <p className="text-[10px] leading-relaxed max-w-[200px]">
                            Gunakan tab <span className="text-white">Cari Link</span> untuk mengumpulkan link video kamu.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.03] relative z-10">
                        {collectedLinks.map((link, idx) => {
                            const isSelected = selectedIds.has(link.id);
                            return (
                                <div 
                                    key={link.id}
                                    onClick={() => toggleSelect(link.id)}
                                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all ${isSelected ? "bg-primary/5" : "hover:bg-white/[0.02]"}`}
                                >
                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-white/10 bg-white/5"}`}>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[4]" />}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-xs font-bold truncate transition-colors ${isSelected ? "text-primary" : "text-zinc-200"}`}>
                                            {link.videoTitle}
                                        </h4>
                                        <p className="text-[10px] text-zinc-600 font-mono mt-1">
                                            {origin}/watch/{link.videoId}{user?.id ? `?ref=${user.id.substring(0, 8)}` : ""}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className={`text-[10px] font-black px-2 py-0.5 rounded-md ${link.viewCount && link.viewCount > 0 ? "bg-green-500/10 text-green-500" : "bg-white/5 text-zinc-700"}`}>
                                            {link.viewCount || 0} HITS
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Preview Box */}
            {collectedLinks.length > 0 && (
                <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                    <BatikPattern opacity={0.05} />
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 relative z-10">Preview Format Copy</h4>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-zinc-400 leading-relaxed max-h-40 overflow-y-auto no-scrollbar relative z-10">
                        {(selectedIds.size > 0 
                            ? collectedLinks.filter(l => selectedIds.has(l.id))
                            : collectedLinks
                        ).map(l => (
                            <div key={l.id} className="truncate">
                                {origin}/watch/{l.videoId}{user?.id ? `?ref=${user.id.substring(0, 8)}` : ""}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={selectedIds.size > 0 ? `Hapus ${selectedIds.size} link?` : "Hapus Semua Link?"}
                message="Link yang dihapus akan hilang dari koleksi ini."
            />
        </div>
    );
}
