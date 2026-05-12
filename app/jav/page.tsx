import React from "react";
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
        <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
            {/* Visual Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-dot-grid opacity-20" />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col gap-10 pt-32 pb-32 relative">
                
                {/* Async Content Wrapper */}
                <JavContent searchParams={searchParams} />

            </main>
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
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full w-fit">
                        <Database className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Premium Archive</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Explore <span className="text-primary italic">Database.</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Found {total.toLocaleString()} Videos &bull; Page {currentPage} of {totalPages}
                    </p>
                </div>
                <Link 
                    href="/" 
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest group"
                    prefetch={false}
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            {/* Banner Iklan */}
            <div className="flex justify-center mt-8 -mb-4">
                <AdUnit type="leaderboard" />
            </div>

            {/* Video Grid */}
            <div className="min-h-[60vh]">
                {javData.length > 0 ? (
                    <AnimeSection title="" data={javData} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                        <Database className="w-12 h-12 text-zinc-800" />
                        <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">No data available on this page</p>
                    </div>
                )}
            </div>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl="/jav" 
            />
        </>
    );
}

