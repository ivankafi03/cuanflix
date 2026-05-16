import React from "react";
import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import { getAgcPage } from "@/lib/agcbokep";
import Pagination from "@/components/Pagination";
import AdUnit from "@/components/ads/AdUnit";
import { Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IndoPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || "1", 10));

    const { videos, totalPages } = await getAgcPage(currentPage);

    const mappedData = videos.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        image: item.image,
        rating: 0,
        episodes: 1,
        episodeRaw: item.episode,
        type: "Video",
        href: `/watch/${item.href}`
    }));

    return (
        <div className="flex flex-col min-h-screen bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            <main className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col gap-12 pt-24 pb-24 relative z-10">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Play className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Koleksi Lengkap</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase leading-[0.9] tracking-tighter drop-shadow-2xl">
                            Bokep <span className="text-primary">Indo</span>
                        </h1>
                        <p className="text-zinc-500 text-sm md:text-base font-medium max-w-xl">
                            Jelajahi seluruh koleksi video Indo terbaru dan terpanas.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center -mb-4">
                    <AdUnit type="leaderboard" />
                </div>

                <div className="relative">
                    {mappedData.length > 0 ? (
                        <div className="space-y-12">
                            <AnimeSection title="" data={mappedData} />
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                baseUrl="/indo" 
                                query="" 
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 gap-8 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Tidak Ada Hasil</h3>
                                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                                    Maaf, halaman yang Anda cari kosong.
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
