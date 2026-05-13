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
        <div className={`w-full flex justify-center py-6 px-0 overflow-hidden ${className}`}>
            <div 
                id="container-863f6aef8282a41ad5ebdefcf161468b" 
                ref={containerRef} 
                className="w-full max-w-[100vw] min-h-[250px] flex justify-center items-start overflow-x-auto no-scrollbar"
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            />
            <style jsx global>{`
                #container-863f6aef8282a41ad5ebdefcf161468b,
                #container-863f6aef8282a41ad5ebdefcf161468b > div,
                #container-863f6aef8282a41ad5ebdefcf161468b iframe {
                    max-width: 100% !important;
                    height: auto !important;
                    margin: 0 auto !important;
                    display: block !important;
                }
            `}</style>
        </div>
    );
}
