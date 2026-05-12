import React from "react";
import { Sparkles, Play } from "lucide-react";

export default function Loading() {
    return (
        <main className="min-h-screen bg-black pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                
                {/* 1. Header/Breadcrumb Skeleton */}
                <div className="flex flex-col gap-2 mb-8 animate-pulse">
                    <div className="h-4 w-32 bg-white/5 rounded-full" />
                    <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
                </div>

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Player Skeleton */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Player Container Skeleton */}
                        <div className="relative aspect-video w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent animate-pulse" />
                            
                            {/* Animated Play Button Placeholder */}
                            <div className="relative z-10 w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-bounce">
                                <Play className="w-10 h-10 text-white/20 fill-white/10" />
                            </div>

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                        </div>

                        {/* Actions Skeleton */}
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="h-10 w-32 bg-white/5 rounded-xl" />
                            <div className="h-10 w-32 bg-white/5 rounded-xl" />
                            <div className="ml-auto h-10 w-10 bg-white/5 rounded-xl" />
                        </div>

                        {/* Synopsis Skeleton */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
                            <div className="h-6 w-40 bg-white/10 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-white/5 rounded-full" />
                                <div className="h-4 w-full bg-white/5 rounded-full" />
                                <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar Skeleton */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        
                        {/* Server List Skeleton */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6 animate-pulse">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 bg-primary/20 rounded" />
                                <div className="h-4 w-24 bg-white/10 rounded-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-12 bg-white/5 rounded-xl border border-white/5" />
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Skeleton */}
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-20 aspect-[2/3] bg-white/5 rounded-lg shrink-0" />
                                        <div className="flex flex-col gap-2 py-1 flex-1">
                                            <div className="h-4 w-full bg-white/10 rounded-full" />
                                            <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
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
