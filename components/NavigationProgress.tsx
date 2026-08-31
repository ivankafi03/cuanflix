"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Logo from "./Logo";

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const [showBannerOverlay, setShowBannerOverlay] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = (session?.user as any)?.role === "ADMIN";

    // Reset progress & hide banner when route changes (navigation complete)
    useEffect(() => {
        setProgress(100);
        const finish = setTimeout(() => {
            setVisible(false);
            setShowBannerOverlay(false);
            setProgress(0);
        }, 300);
        return () => clearTimeout(finish);
    }, [pathname, searchParams]);

    // Expose start function globally so link/card clicks can trigger it
    useEffect(() => {
        (window as any).__startNavProgress = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);

            setProgress(0);
            setVisible(true);

            // Instantly show raw banner overlay on navigation (Non-Admin only)
            if (!isAdmin) {
                setShowBannerOverlay(true);
            }

            // Simulate progress up to 85% while loading
            let current = 0;
            intervalRef.current = setInterval(() => {
                current += Math.random() * 15;
                if (current >= 85) {
                    current = 85;
                    clearInterval(intervalRef.current!);
                }
                setProgress(current);
            }, 150);
        };

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAdmin]);

    const bannerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { background: transparent; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; }
                #container-863f6aef8282a41ad5ebdefcf161468b { width: 100%; display: flex; justify-content: center; align-items: center; }
                #container-863f6aef8282a41ad5ebdefcf161468b img { max-width: 100% !important; height: auto !important; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div id="container-863f6aef8282a41ad5ebdefcf161468b"></div>
            <script async="async" data-cfasync="false" src="https://pl29429652.effectivecpmnetwork.com/863f6aef8282a41ad5ebdefcf161468b/invoke.js"></script>
        </body>
        </html>
    `;

    if (!visible) return null;

    return (
        <>
            {/* Top progress bar */}
            <div
                className="fixed top-0 left-0 z-[99999] h-[3px] transition-all ease-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #f472b6, #fb7185, #f97316)",
                    boxShadow: "0 0 10px rgba(244,114,182,0.7), 0 0 20px rgba(244,114,182,0.4)",
                    transition: progress === 100 ? "width 0.3s ease-out" : "width 0.2s ease-out"
                }}
            />
            {/* Glow dot at the tip */}
            <div
                className="fixed top-0 z-[99999] w-3 h-3 rounded-full -translate-y-[4px]"
                style={{
                    left: `calc(${progress}% - 6px)`,
                    background: "#f472b6",
                    boxShadow: "0 0 10px 4px rgba(244,114,182,0.8)",
                    transition: progress === 100 ? "left 0.3s ease-out" : "left 0.2s ease-out"
                }}
            />

            {/* Brand Loading + Push-Up Adsterra Banner Overlay */}
            {showBannerOverlay && (
                <div className="fixed inset-0 z-[99990] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300 pointer-events-auto">
                    <div className="flex flex-col items-center justify-center gap-5 w-full max-w-md transition-all duration-500 ease-out transform">
                        {/* Cuanflix Branding Animation Header */}
                        <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                            {/* Pure Floating Logo Icon */}
                            <div className="relative flex items-center justify-center">
                                <Logo className="w-12 h-12" showText={false} />
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                </span>
                            </div>

                            {/* Cuanflix Text & Loading Status */}
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

                        {/* Banner Ad Iframe (Positioned Underneath Branding Header) */}
                        <div className="w-full flex items-center justify-center overflow-hidden transition-all duration-500">
                            <iframe
                                srcDoc={bannerHtml}
                                title="transit-ad-banner"
                                className="w-full max-w-[360px] h-[280px] border-0 overflow-hidden"
                                scrolling="no"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
