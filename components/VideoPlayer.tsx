"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { VideoServer } from "@/lib/jav";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface VideoPlayerProps {
    servers: VideoServer[];
    downloads?: any[];
    onPlay?: () => void;
}

export default function VideoPlayer({ servers, downloads = [], onPlay }: VideoPlayerProps) {
    const { data: session } = useSession();
    const pathname = usePathname() || "";
    const [activeServerIndex, setActiveServerIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const handleStart = () => {
        setIsStarted(true);
        if (onPlay) onPlay();
    };

    if (!servers || servers.length === 0) {
        return (
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col items-center justify-center gap-4">
                <p className="text-white/60">Gagal memuat video player.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 md:gap-4">
            {/* Player Container - Full Width Edge-to-Edge on Mobile */}
            <div className="relative aspect-video bg-black -mx-4 md:mx-0 rounded-none md:rounded-2xl overflow-hidden border-y md:border border-white/5 shadow-2xl group/player">
                {!isStarted ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[4px] group-hover/player:bg-black/50 transition-all">
                        <button 
                            onClick={handleStart}
                            className="relative group/btn flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(244,114,182,0.3)] group-hover/btn:scale-110 active:scale-95 transition-all duration-500">
                                <Play className="w-10 h-10 fill-current ml-1" />
                            </div>
                            <span className="text-sky-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-60 group-hover/btn:opacity-100 transition-opacity">
                                Play Video
                            </span>
                        </button>
                    </div>
                ) : (
                    <iframe
                        src={servers[activeServerIndex].iframe}
                        className="w-full h-full video-player-iframe"
                        allowFullScreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        referrerPolicy="no-referrer"
                        frameBorder="0"
                    />
                )}
            </div>

            {/* Server Switcher & Download */}
            <div className="flex flex-col gap-3.5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Side-by-side Server Cards on Mobile (Berdampingan) */}
                    <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
                        {servers.map((server, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveServerIndex(i)}
                                className={`w-full md:w-auto px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-wider md:tracking-widest border text-center transition-all duration-300 ${i === activeServerIndex
                                    ? "bg-sky-500/10 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                                    : "bg-black/40 border-white/5 text-zinc-400 hover:text-sky-400 hover:border-sky-500/30"
                                    }`}
                            >
                                {server.name}
                            </button>
                        ))}
                    </div>

                    <Link
                        href={`/download?url=${encodeURIComponent(downloads?.[0]?.links?.[0]?.link || servers[activeServerIndex].iframe)}&title=${encodeURIComponent(pathname.split('/').pop() || 'Video Content')}`}
                        className="flex items-center justify-center gap-2 px-5 py-2 md:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-primary/20"
                    >
                        <svg className="w-4 h-4 group-hover:animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        download
                    </Link>
                </div>
            </div>
        </div>
    );
}
