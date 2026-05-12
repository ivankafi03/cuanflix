import React from "react";
import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import { searchJav } from "@/lib/jav";
import { redirect } from "next/navigation";
import { Search, Database } from "lucide-react";
import Pagination from "@/components/Pagination";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const { q: query, page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || "1", 10));

    if (!query) {
        redirect("/");
    }

    const { videos, totalPages, total } = await searchJav(query, currentPage);

    const mappedData = videos.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        image: item.image,
        rating: 0,
        episodes: 1,
        episodeRaw: item.episode,
        type: item.type || "JAV",
        href: `/watch/${item.href}`
    }));

    return (
        <div className="flex flex-col min-h-screen bg-[#050505] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            <main className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col gap-12 pt-24 pb-24 relative z-10">
                
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Search className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Search Engine</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase leading-[0.9] tracking-tighter drop-shadow-2xl">
                            Hasil <span className="text-primary">Pencarian</span>
                        </h1>
                        <p className="text-zinc-500 text-sm md:text-base font-medium max-w-xl">
                            Menemukan video premium untuk kata kunci: <span className="text-white font-black italic underline decoration-primary/40 underline-offset-4">"{query}"</span>
                        </p>
                    </div>

                    {/* Stats Badge */}
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-1 pr-6 w-fit h-fit backdrop-blur-xl">
                        <div className="w-12 h-12 rounded-[1.2rem] bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
                            <Database className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Results</span>
                            <span className="text-lg font-black text-white italic leading-none">{total.toLocaleString()}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Pages</span>
                            <span className="text-lg font-black text-white italic leading-none">{totalPages.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="relative">
                    {mappedData.length > 0 ? (
                        <div className="space-y-12">
                            <AnimeSection title="" data={mappedData} />
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                baseUrl="/search" 
                                query={query} 
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 gap-8 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                            <div className="relative">
                                <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
                                    <Search className="w-10 h-10 text-zinc-700" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                    <span className="text-black font-black text-xs">!</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Tidak Ada Hasil</h3>
                                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                                    Maaf, kami tidak dapat menemukan video untuk kata kunci <span className="text-primary italic">"{query}"</span>. Cobalah menggunakan nama model atau kata kunci lain.
                                </p>
                            </div>
                            <Link href="/" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all">
                                Kembali ke Beranda
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
