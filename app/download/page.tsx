"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, ArrowLeft, Loader2, Film, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { decryptStreamToken } from "@/lib/token";
import NativeBannerAd from "@/components/ads/NativeBannerAd";

function DownloadContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawUrl = searchParams.get("url") || "";
    const title = (searchParams.get("title") || "Video").replace(/-/g, ' ');
    const [isPreparing, setIsPreparing] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsPreparing(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleDownload = () => {
        if (rawUrl) {
            window.open(rawUrl, "_blank");
        }
    };

    if (!rawUrl) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 text-center">
                <p className="text-zinc-400 text-sm mb-4">Link download tidak valid.</p>
                <Link href="/" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl uppercase tracking-wider">
                    Kembali ke Beranda
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-sm bg-[#0f0f12] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center gap-6 shadow-2xl relative z-10">
                {/* Header Badge */}
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Film className="w-6 h-6" />
                </div>

                {/* Title */}
                <div className="flex flex-col gap-1.5 w-full">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Cuanflix Download</span>
                    <h1 className="text-base font-bold text-white leading-snug line-clamp-2">
                        {title}
                    </h1>
                </div>

                {/* Status / Action */}
                <div className="w-full pt-2 flex flex-col gap-3">
                    {isPreparing ? (
                        <div className="py-4 flex flex-col items-center justify-center gap-2.5 bg-white/5 rounded-xl border border-white/5">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Menyiapkan File...</span>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-4 h-4" /> Download Sekarang
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" /> Kembali
                            </button>
                        </>
                    )}
                </div>

                <NativeBannerAd />

                {/* Security Note */}
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-medium pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>File aman & bebas virus</span>
                </div>
            </div>
        </div>
    );
}

export default function DownloadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <DownloadContent />
        </Suspense>
    );
}
