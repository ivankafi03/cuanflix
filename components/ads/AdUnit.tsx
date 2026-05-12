"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type AdType = "leaderboard" | "rectangle" | "mobile" | "halfpage" | "banner" | "native";

interface AdUnitProps {
    type: AdType;
    className?: string;
}

const AD_CONFIG: Record<AdType, { key: string; width: number; height: number }> = {
    // Key terbaru dari pengguna
    leaderboard: { key: "863f6aef8282a41ad5ebdefcf161468b", width: 728, height: 90 },
    rectangle:   { key: "863f6aef8282a41ad5ebdefcf161468b", width: 300, height: 250 },
    mobile:      { key: "863f6aef8282a41ad5ebdefcf161468b", width: 320, height: 50 },
    halfpage:    { key: "863f6aef8282a41ad5ebdefcf161468b", width: 160, height: 600 },
    banner:      { key: "863f6aef8282a41ad5ebdefcf161468b", width: 468, height: 60 },
    native:      { key: "863f6aef8282a41ad5ebdefcf161468b", width: 300, height: 250 }, // Native container placeholder
};

export default function AdUnit({ type, className = "" }: AdUnitProps) {
    const pathname  = usePathname() || "";
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loaded       = useRef(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const config          = AD_CONFIG[type];
    const isAdmin         = (session?.user as any)?.role === "ADMIN";
    const isRestricted    = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth") || isAdmin;
    const shouldRender    = mounted && !isRestricted;

    // ── HOOK 2: inject ad script (runs only when shouldRender is true) ─
    useEffect(() => {
        if (!shouldRender || loaded.current || !containerRef.current) return;
        
        const updateAd = () => {
            if (!containerRef.current || loaded.current) return;
            
            const isMobile = window.innerWidth < 768;
            const finalKey = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.key : config.key;
            const finalWidth = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.width : config.width;
            const finalHeight = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.height : config.height;

            // ISOLATED IFRAME METHOD - PREVENTS GLOBAL VARIABLE CONFLICTS
            const iframe = document.createElement('iframe');
            iframe.width = finalWidth.toString();
            iframe.height = finalHeight.toString();
            iframe.frameBorder = "0";
            iframe.scrolling = "no";
            iframe.style.display = "block";
            iframe.style.margin = "0 auto";
            iframe.style.maxWidth = "100%";

            const adScript = `
                <html>
                    <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;">
                        <script async="async" data-cfasync="false" src="https://downconvenientmagnetic.com/${finalKey}/invoke.js"></script>
                        <div id="container-${finalKey}"></div>
                    </body>
                </html>
            `;
            
            iframe.srcdoc = adScript;
            
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(iframe);
            loaded.current = true;
        };

        // Run once on mount
        updateAd();
    }, [shouldRender, config.key, config.height, config.width, type, pathname]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!shouldRender) return null;

    const isMobile = mounted && window.innerWidth < 768;
    const finalWidth = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.width : config.width;
    const finalHeight = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.height : config.height;

    return (
        <div
            className={`overflow-hidden flex items-center justify-center mx-auto ${className}`}
            style={{ 
                maxWidth: "100%", 
                width: finalWidth,
                minHeight: finalHeight,
                height: "auto"
            }}
        >
            <div ref={containerRef} className="w-full flex justify-center" />
        </div>
    );
}
