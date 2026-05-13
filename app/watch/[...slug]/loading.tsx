import React from "react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-12">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-[80px] md:pt-[100px] flex flex-col gap-4 animate-pulse">
                
                {/* Promo Banner Skeleton */}
                <div className="h-24 w-full bg-zinc-900/50 rounded-2xl border border-white/5" />

                {/* Video Player Area Skeleton */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <div className="aspect-video w-full bg-zinc-900 rounded-[2rem] border border-white/5 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white/10 border-b-[10px] border-b-transparent ml-1" />
                            </div>
                        </div>

                        {/* Title & Info Skeleton */}
                        <div className="mt-6 bg-zinc-900/30 border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                            <div className="h-8 w-2/3 bg-zinc-800 rounded-lg" />
                            <div className="flex gap-4">
                                <div className="h-4 w-32 bg-zinc-800/50 rounded" />
                                <div className="h-4 w-32 bg-zinc-800/50 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="w-full lg:w-[350px] flex flex-col gap-4">
                        <div className="h-10 w-1/2 bg-zinc-900 rounded-lg mb-2" />
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-32 aspect-video bg-zinc-900 rounded-xl shrink-0" />
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="h-4 w-full bg-zinc-900 rounded" />
                                    <div className="h-3 w-1/2 bg-zinc-900/50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
