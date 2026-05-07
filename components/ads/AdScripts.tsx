"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AdScripts() {
    const pathname = usePathname() || "";
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Daftar halaman yang WAJIB bersih dari iklan (Dashboard & Admin)
    const hideAdsOn = [
        "/admin",
        "/dashboard"
    ];

    const isRestrictedPage = hideAdsOn.some(path => pathname.startsWith(path));

    // Jika di halaman terlarang, beri class khusus untuk CSS (jika masih ada CSS yang butuh)
    useEffect(() => {
        if (!mounted) return;
        if (isRestrictedPage) {
            document.body.classList.add('admin-page');
        } else {
            document.body.classList.remove('admin-page');
        }
    }, [isRestrictedPage, mounted]);

    if (!mounted || status === "loading" || isRestrictedPage) return null;

    return (
        <>
            {/* AdsTerra Popunder */}
            <Script
                id="adsterra-popunder"
                src="https://pl29360872.profitablecpmratenetwork.com/a6/20/66/a620661409a43f241ad7455bce5763f5.js"
                strategy="lazyOnload"
            />
            {/* Monetag MultiTag */}
            <Script
                id="monetag-multitag"
                src="https://quge5.com/88/tag.min.js"
                data-zone="237063"
                strategy="lazyOnload"
                data-cfasync="false"
            />
            {/* Histats Tracker */}
            <Script id="histats-tracker" strategy="lazyOnload">{`
                var _Hasync = _Hasync || [];
                _Hasync.push(['Histats.start', '1, 5025180, 4, 0, 0, 0, 00010000']);
                _Hasync.push(['Histats.fasi', '1']);
                _Hasync.push(['Histats.track_hits', '']);
                (function() {
                    var hs = document.createElement('script');
                    hs.type = 'text/javascript'; hs.async = true;
                    hs.src = '//s10.histats.com/js15_as.js';
                    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
                })();
            `}</Script>
        </>
    );
}

