"use client";
import React from "react";

export default function Loading() {
    return (
        <main className="min-h-screen bg-black pt-24 pb-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Poster Skeleton */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="aspect-[2/3] w-full rounded-3xl bg-zinc-900 border border-white/5 animate-pulse relative overflow-hidden">
                             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>

                    {/* Right Column: Info Skeleton */}
                    <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
                        <div className="flex flex-col gap-3 animate-pulse">
                            <div className="h-10 w-3/4 bg-white/10 rounded-2xl" />
                            <div className="h-4 w-1/4 bg-white/5 rounded-full" />
                        </div>

                        <div className="flex flex-wrap gap-2 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-8 w-20 bg-white/5 rounded-full" />
                            ))}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 animate-pulse">
                            <div className="h-6 w-32 bg-white/10 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-white/5 rounded-full" />
                                <div className="h-4 w-full bg-white/5 rounded-full" />
                                <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                             {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </main>
    );
}
