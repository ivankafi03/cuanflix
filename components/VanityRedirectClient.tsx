"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function VanityRedirectClient({ targetUrl }: { targetUrl: string }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate top progress bar
        let current = 0;
        const interval = setInterval(() => {
            current += Math.random() * 20 + 10;
            if (current >= 90) {
                current = 90;
                clearInterval(interval);
            }
            setProgress(current);
        }, 150);

        // Redirect to target URL after short loading delay (~1.8 seconds)
        const timer = setTimeout(() => {
            setProgress(100);
            window.location.href = targetUrl;
        }, 1800);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [targetUrl]);

    return (
        <div className="fixed inset-0 z-[99999] bg-[#0c0c0e] flex flex-col items-center justify-center p-4 font-sans select-none">
            {/* Top progress bar */}
            <div
                className="fixed top-0 left-0 z-[100000] h-[3px] transition-all ease-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #f472b6, #fb7185, #f97316)",
                    boxShadow: "0 0 10px rgba(244,114,182,0.7), 0 0 20px rgba(244,114,182,0.4)",
                    transition: progress === 100 ? "width 0.2s ease-out" : "width 0.15s ease-out"
                }}
            />
            <div
                className="fixed top-0 z-[100000] w-3 h-3 rounded-full -translate-y-[4px]"
                style={{
                    left: `calc(${progress}% - 6px)`,
                    background: "#f472b6",
                    boxShadow: "0 0 10px 4px rgba(244,114,182,0.8)",
                    transition: progress === 100 ? "left 0.2s ease-out" : "left 0.15s ease-out"
                }}
            />

            {/* Center Loading Container — matches NavigationProgress styling without card wrapper */}
            <div className="flex flex-col items-center justify-center gap-5 w-full max-w-md">
                {/* Branding Animation Header */}
                <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative flex items-center justify-center">
                        <Logo className="w-12 h-12" showText={false} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-black tracking-tight text-white uppercase italic">
                            CUAN<span className="text-primary">FLIX</span>
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                            <span>Memuat Konten...</span>
                        </div>
                    </div>
                </div>

                {/* Fallback link */}
                <a
                    href={targetUrl}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 underline transition-colors pt-2"
                >
                    Klik di sini jika tidak dialihkan otomatis
                </a>
            </div>
        </div>
    );
}
