import React, { Suspense } from "react";
import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import { getLatestVideos } from "@/lib/jav";
import { Compass, Database, ChevronLeft } from "lucide-react";
import AdUnit from "@/components/ads/AdUnit";
import Pagination from "@/components/Pagination";

export const metadata = {
    title: "Explore Premium Videos — Cuanflix",
    description: "Browse premium JAV videos on Cuanflix. High quality database with thousands of titles updated daily.",
};

export default function JavPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            {/* Visual Background (Glows and ambient dots) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none z-0" />
            
            {/* Ambient Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            <Suspense fallback={
                <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pt-32 pb-32">
                    <div className="h-96 bg-zinc-100 animate-pulse rounded-[2.5rem]" />
                </div>
            }>
                <JavContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function JavContent({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || "1", 10));

    const { videos, totalPages, total } = await getLatestVideos(currentPage);

    const javData = videos.map((item, index) => ({
        id: index + 1,
        title: item.title,
        image: item.image,
        rating: 0,
        episodes: 1,
        episodeRaw: item.episode,
        type: "JAV",
        href: `/watch/${item.href}`,
    }));

    return (
        <div className="flex flex-col w-full relative z-10">
            {/* Header Area (Transparent) */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pt-20 md:pt-28 pb-4 md:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-full w-fit">
                        <Database className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Archive</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tighter uppercase leading-none">
                        Explore <span className="text-primary italic">Database.</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Found {total.toLocaleString()} Videos &bull; Page {currentPage} of {totalPages}
                    </p>
                </div>
                <Link 
                    href="/" 
                    className="flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/[0.08] rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.1] transition-all uppercase tracking-widest group shadow-sm"
                    prefetch={false}
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            {/* Dark Content Wrapper */}
            <div className="bg-[#0a0a0f] relative z-20 w-full border-t border-white/[0.06] flex-grow pb-32">
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-12 flex flex-col gap-6 md:gap-8">
                    
                    {/* Banner Iklan */}
                    <div className="flex justify-center -mt-4 mb-4">
                        <AdUnit type="leaderboard" />
                    </div>

                    {/* Video Grid */}
                    <div className="min-h-[50vh]">
                        {javData.length > 0 ? (
                            <AnimeSection title="" data={javData} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white/[0.02] rounded-[3rem] border border-white/10 border-dashed">
                                <Database className="w-12 h-12 text-slate-500" />
                                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">No data available on this page</p>
                            </div>
                        )}
                    </div>

                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        baseUrl="/jav" 
                    />
                </div>
            </div>
        </div>
    );
}
