"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdNative({ className = "" }: { className?: string }) {

    const pathname  = usePathname() || "";
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loaded       = useRef(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const isRestricted = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
    const shouldRender = mounted && !isRestricted;

    // ── HOOK 2: inject native ad script ─────────────────────────────
    useEffect(() => {
        if (!shouldRender || loaded.current || !containerRef.current) return;
        loaded.current = true;

        const script = document.createElement("script");
        script.src   = "https://downconvenientmagnetic.com/863f6aef8282a41ad5ebdefcf161468b/invoke.js";
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        containerRef.current.appendChild(script);
    }, [shouldRender]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!shouldRender) return null;

    return (
        <div className={`w-full flex justify-center py-8 overflow-visible ${className}`}>
            <div 
                id="container-863f6aef8282a41ad5ebdefcf161468b" 
                ref={containerRef} 
                className="ad-native-wrapper flex justify-center items-start min-h-[280px]"
            />
            <style jsx global>{`
                .ad-native-wrapper {
                    width: 100% !important;
                    max-width: 100% !important;
                    display: flex !important;
                    justify-content: center !important;
                    overflow: visible !important;
                }
                /* Teknik Anti-Kepotong: Jika iklan lebih lebar dari layar, dia otomatis zoom-out */
                #container-863f6aef8282a41ad5ebdefcf161468b > div {
                    max-width: 95vw !important;
                    margin: 0 auto !important;
                    display: block !important;
                }
                @media (max-width: 400px) {
                    #container-863f6aef8282a41ad5ebdefcf161468b {
                        transform: scale(0.9);
                        transform-origin: center top;
                    }
                }
                @media (max-width: 350px) {
                    #container-863f6aef8282a41ad5ebdefcf161468b {
                        transform: scale(0.85);
                        transform-origin: center top;
                    }
                }
                #container-863f6aef8282a41ad5ebdefcf161468b iframe {
                    max-width: 100% !important;
                    height: auto !important;
                }
            `}</style>
        </div>
    );
}
