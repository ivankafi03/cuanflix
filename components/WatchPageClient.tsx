"use client";

import React, { useState } from "react";
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
    const [isWatching, setIsWatching] = useState(false);
    const [showEpisodes, setShowEpisodes] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 relative">


            {/* Main Video Area */}
            <div className="flex-1 flex flex-col">
                {/* Watch earning — only active when user has clicked Play */}
                <div className="empty:hidden mb-4">
                    {/* The Earning Manager is now stacked higher in its own CSS */}
                    {isWatching && (
                        <div className="mobile-earning-stack">
                            <WatchEarningManager videoId={videoId} />
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
