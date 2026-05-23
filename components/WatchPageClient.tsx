"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import VideoPlayer from "./VideoPlayer";
import WatchEarningManager from "./WatchEarningManager";
import { VideoServer } from "@/lib/jav";
import { List, X, ChevronRight, Sparkles, Download } from "lucide-react";
import Link from "next/link";
import AnimeCard from "./AnimeCard";

const CommentSection = dynamic(() => import("./CommentSection"), {
    loading: () => <div className="h-32 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse mt-6">Memuat Komentar...</div>,
    ssr: false
});

interface WatchPageClientProps {
    servers: VideoServer[];
    downloads?: any[];
    videoId: string;
    children?: React.ReactNode;
    sidebar?: React.ReactNode;
    episodes?: any[];
    relatedAnime?: any[];
}

export default function WatchPageClient({ 
    servers, 
    downloads = [],
    videoId, 
    children, 
    sidebar, 
    episodes = [], 
    relatedAnime = [] 
}: WatchPageClientProps) {
    const { data: session } = useSession();
    const isGuest = !session;
    const [isWatching, setIsWatching] = useState(false);
    const [showEpisodes, setShowEpisodes] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 relative">


            {/* Main Video Area */}
            <div className="flex-1 flex flex-col">
                {/* Watch earning — only active when user has clicked Play */}
                <div className="empty:hidden mb-4">
                    {/* The Earning Manager is now stacked higher in its own CSS */}
                    {isWatching && !isGuest && (
                        <div className="mobile-earning-stack">
                            <WatchEarningManager videoId={videoId} />
                        </div>
                    )}
                    {isWatching && isGuest && (
                        <div 
                            onClick={() => window.location.href = "/auth/register"}
                            className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all select-none animate-pulse"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Earning Active</span>
                                    <h4 className="text-xs font-bold text-white mt-1">Nonton video ini menghasilkan $0.005</h4>
                                </div>
                            </div>
                            <button className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-500/20 hover:opacity-90">
                                Klaim Saldo
                            </button>
                        </div>
                    )}
                </div>

                <VideoPlayer
                    servers={servers}
                    downloads={downloads}
                    onPlay={() => setIsWatching(true)}
                />



                {children}



                {/* Related Anime Section - Matching Homepage Style */}
                {relatedAnime.length > 0 && (
                    <div className="mt-12 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Rekomendasi Untukmu
                            </h3>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 md:gap-8">
                            {relatedAnime.map((anime: any, idx: number) => (
                                <AnimeCard 
                                    key={idx}
                                    id={idx}
                                    title={anime.title}
                                    image={anime.image}
                                    rating={parseFloat(anime.rating) || 0}
                                    episodes={parseInt(anime.eps) || 0}
                                    episodeRaw={anime.eps}
                                    type={anime.type || "Anime"}
                                    href={anime.link}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12">
                    <CommentSection videoId={videoId} />
                </div>
            </div>

        </div>
    );
}
