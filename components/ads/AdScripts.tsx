"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";

export default function AdScripts() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";

    // Daftar halaman yang TIDAK boleh ada iklan
    const hideAdsOn = [
        "/auth/login",
        "/auth/register",
        "/admin",
        "/dashboard"
    ];

    // Cek apakah halaman sekarang masuk dalam daftar hitam iklan
    const isAuthPage = hideAdsOn.some(path => pathname.startsWith(path));

    // Jika Admin atau sedang di halaman auth/admin, jangan tampilkan apa-apa
    if (isAdmin || isAuthPage) return null;

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
                _Hasync.push(['Histats.start', '1,5025180,4,0,0,0,00010000']);
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
