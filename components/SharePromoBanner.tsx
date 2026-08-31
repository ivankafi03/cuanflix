"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Share2 } from "lucide-react";

interface SharePromoBannerProps {
    className?: string;
}

export default function SharePromoBanner({ className = "" }: SharePromoBannerProps) {
    const { data: session } = useSession();
    const targetHref = session?.user ? "/dashboard/share" : "/auth/register";

    return (
        <div className={`w-full ${className}`}>
            <Link 
                href={targetHref}
                className="group relative block w-full rounded-2xl md:rounded-3xl overflow-hidden border border-sky-500/30 bg-[#0a0a0f] shadow-[0_0_30px_rgba(56,189,248,0.2)] hover:border-sky-400 hover:shadow-[0_0_45px_rgba(56,189,248,0.4)] transition-all duration-500 transform hover:-translate-y-0.5 active:scale-[0.99]"
            >
                {/* Landscape Banner Image - Strict 16:9 to Prevent Cropping */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center">
                    <img 
                        src="/sharelink_blue_banner.jpg?v=3" 
                        alt="Bagikan Link & Dapatkan Saldo Otomatis — CUANFLIX.SITE" 
                        className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay for Sleek Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

                    {/* Small Blinking Dot at Top-Left Corner */}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center justify-center pointer-events-none z-10">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 shadow-[0_0_10px_#38bdf8]" />
                        </span>
                    </div>

                    {/* Hover Badge Floating Button */}
                    <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 flex items-center gap-2 px-3.5 py-1.5 md:px-5 md:py-2.5 bg-sky-500/90 hover:bg-sky-400 backdrop-blur-md text-white rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider shadow-xl shadow-sky-500/40 group-hover:scale-105 transition-all duration-300">
                        <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-pulse" />
                        <span>Mulai Bagikan Sekarang</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
