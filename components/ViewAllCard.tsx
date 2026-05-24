"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function ViewAllCard({ href }: { href: string }) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleMouseEnter = useCallback(() => {
        router.prefetch(href);
    }, [router, href]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (isNavigating) return;
        setIsNavigating(true);

        if (typeof window !== "undefined" && (window as any).__startNavProgress) {
            (window as any).__startNavProgress();
        }

        router.push(href);
    }, [isNavigating, router, href]);

    return (
        <div 
            className="group flex flex-col gap-2 h-full"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/30 block shadow-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer flex items-center justify-center">
                {!isNavigating ? (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-500 shadow-[0_0_20px_rgba(244,114,182,0)] group-hover:shadow-[0_0_30px_rgba(244,114,182,0.4)]">
                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors drop-shadow-md">
                            View All
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                        {/* Spinner cincin */}
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                            <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-pink-400 animate-spin [animation-duration:0.7s] [animation-direction:reverse]" />
                        </div>
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.25em] animate-pulse">
                            Loading...
                        </span>
                    </div>
                )}
            </div>
            
            {/* Metadata (empty space for alignment with AnimeCard) */}
            <div className="px-1 mt-1 flex flex-col gap-1 invisible">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">TYPE</span>
                <h3 className="text-xs sm:text-sm font-bold line-clamp-1 leading-snug">Title</h3>
                <span className="text-[10px] font-medium leading-none">EP</span>
            </div>
        </div>
    );
}
