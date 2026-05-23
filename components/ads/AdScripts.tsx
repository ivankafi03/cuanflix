"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";

export default function AdScripts() {
    const pathname  = usePathname() || "";
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const isRestricted = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth") || pathname.startsWith("/login") || pathname.startsWith("/register") || isAdmin;

    // ── HOOK 2: toggle body class and cleanup ads ────────────────────
    useEffect(() => {
        if (!mounted) return;
        
        if (isRestricted) {
            document.body.classList.add("admin-page");
            
            // Aggressive Cleanup: Nuke all known ad scripts and elements
            const cleanup = () => {
                const adScripts = document.querySelectorAll('script[src*="profitablecpm"], script[src*="quge5"], script[src*="highperformance"], script[id*="adsterra"], script[id*="monetag"]');
                adScripts.forEach(s => s.remove());
                
                const adElements = document.querySelectorAll('[id*="container-"], [class*="ad-"], [class*="banner"], iframe[src*="profitablecpm"], iframe[src*="highperformance"], iframe[src*="quge5"]');
                adElements.forEach(el => {
                    (el as HTMLElement).style.display = 'none';
                    (el as HTMLElement).style.setProperty('display', 'none', 'important');
                    el.remove();
                });
            };

            cleanup();
            const interval = setInterval(cleanup, 1000); // Continuous cleanup
            return () => clearInterval(interval);
        } else {
            document.body.classList.remove("admin-page");
        }
    }, [mounted, isRestricted, pathname]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!mounted || status === "loading") return null;

    // Jika member login, matikan iklan Popunder/Pop-up (Script-level)
    const isMember = !!session?.user;
    
    // Guardian tetap render null di restricted page untuk scripts
    if (isRestricted) return null;

    return (
        <>
            {/* AdsTerra Popunder */}
            <Script
                id="adsterra-popunder"
                src="https://pl29429557.profitablecpmratenetwork.com/ec/06/5a/ec065a7e4c204506aa310f99c17a98a4.js"
                strategy="afterInteractive"
            />
            {/* AdsTerra Social Bar */}
            <Script
                id="adsterra-social-bar"
                src="https://pl29429558.profitablecpmratenetwork.com/82/24/c4/8224c42340e4d16455652554fa3261c8.js"
                strategy="afterInteractive"
            />
            {/* Monetag MultiTag - Removed because of rejection */}

            {/* Histats Tracker - Optimized for Next.js SPA */}
            <Script id="histats-tracker" strategy="lazyOnload" key={pathname}>
                {`
                    var _Hasync = _Hasync || [];
                    _Hasync.push(['Histats.start', '1, 5026321, 4, 0, 0, 0, 00010000']);
                    _Hasync.push(['Histats.fasi', '1']);
                    _Hasync.push(['Histats.track_hits', '']);
                    (function() {
                        var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
                        hs.src = ('https://s10.histats.com/js15_as.js');
                        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
                    })();
                `}
            </Script>
            {/* Microsoft Clarity - User Behavior Analysis */}
            <Script id="microsoft-clarity" strategy="afterInteractive">
                {`
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "wqh6n1t83y");
                `}
            </Script>
            <noscript>
                <a href="/" target="_blank">
                    <img src="https://sstatic1.histats.com/0.gif?5026321&101" alt="histats" style={{ display: 'none' }} />
                </a>
            </noscript>
        </>
    );
}
