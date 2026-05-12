import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    query?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl, query }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages - 1, totalPages];
        if (currentPage >= totalPages - 2) return [1, 2, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    };

    const getLink = (page: number | string) => {
        const separator = baseUrl.includes("?") ? "&" : "?";
        let url = `${baseUrl}${separator}page=${page}`;
        if (query) {
            url = `${baseUrl}${separator}q=${encodeURIComponent(query)}&page=${page}`;
        }
        return url;
    };

    return (
        <div className="flex flex-col items-center gap-8 py-12 border-t border-white/5 w-full">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                    Halaman {currentPage} dari {totalPages}
                </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                {currentPage > 1 ? (
                    <Link 
                        href={getLink(currentPage - 1)} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-primary hover:text-black transition-all border border-white/10 group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 opacity-30 cursor-not-allowed border border-white/5">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                )}

                {getPageNumbers().map((item: any, idx: number) =>
                    item === "..." ? (
                        <span key={`dots-${idx}`} className="px-3 text-zinc-600 font-black tracking-widest">···</span>
                    ) : (
                        <Link
                            key={`page-${item}`}
                            href={getLink(item)}
                            className={`min-w-[48px] h-12 flex items-center justify-center rounded-2xl px-4 text-sm font-black transition-all border ${
                                item === currentPage
                                    ? "bg-primary text-black border-primary shadow-[0_10px_30px_rgba(244,114,182,0.3)] scale-110 z-10"
                                    : "bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {item}
                        </Link>
                    )
                )}

                {currentPage < totalPages ? (
                    <Link 
                        href={getLink(currentPage + 1)} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-primary hover:text-black transition-all border border-white/10 group"
                    >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 opacity-30 cursor-not-allowed border border-white/5">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
