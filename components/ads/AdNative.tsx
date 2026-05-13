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
        <div className={`w-full flex justify-center py-6 overflow-visible ${className}`}>
            <div 
                id="container-863f6aef8282a41ad5ebdefcf161468b" 
                ref={containerRef} 
                className="ad-native-container"
            />
            <style jsx global>{`
                .ad-native-container {
                    width: 100vw !important;
                    max-width: 100vw !important;
                    margin-left: calc(50% - 50vw);
                    margin-right: calc(50% - 50vw);
                    display: flex !important;
                    justify-content: center !important;
                    align-items: start !important;
                    overflow: visible !important;
                }
                /* Memaksa elemen di dalamnya untuk tidak melebihi layar */
                #container-863f6aef8282a41ad5ebdefcf161468b > div,
                #container-863f6aef8282a41ad5ebdefcf161468b iframe {
                    max-width: 100vw !important;
                    width: auto !important;
                    margin: 0 auto !important;
                }
                /* Scaling extra untuk HP kecil */
                @media (max-width: 480px) {
                    #container-863f6aef8282a41ad5ebdefcf161468b {
                        transform: scale(0.95);
                        transform-origin: center top;
                    }
                }
                @media (max-width: 380px) {
                    #container-863f6aef8282a41ad5ebdefcf161468b {
                        transform: scale(0.85);
                        transform-origin: center top;
                    }
                }
                @media (max-width: 320px) {
                    #container-863f6aef8282a41ad5ebdefcf161468b {
                        transform: scale(0.75);
                        transform-origin: center top;
                    }
                }
            `}</style>
        </div>
    );
}
