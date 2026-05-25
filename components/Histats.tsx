"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

export default function Histats() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This will run on every route change in App Router
    // Wait for the script to load and initialize _Hasync
    if (typeof window !== "undefined") {
      window._Hasync = window._Hasync || [];
      // To prevent duplicate start calls, only call track_hits on route change if it's already started
      // But actually Histats recommends pushing track_hits on route changes for AJAX/SPA
      if (window._Hasync.length > 0) {
        window._Hasync.push(['Histats.track_hits', '']);
      }
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="histats-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var _Hasync= _Hasync|| [];
            _Hasync.push(['Histats.start', '1,5026321,4,0,0,0,00010000']);
            _Hasync.push(['Histats.fasi', '1']);
            _Hasync.push(['Histats.track_hits', '']);
          `,
        }}
      />
      <Script
        id="histats-script"
        strategy="afterInteractive"
        src="//s10.histats.com/js15_as.js"
      />
      <noscript>
        <a href="/" target="_blank">
          <img
            src="//sstatic1.histats.com/0.gif?5026321&101"
            alt=""
            style={{ border: 0 }}
          />
        </a>
      </noscript>
    </>
  );
}

// Ensure TypeScript knows about _Hasync
declare global {
  interface Window {
    _Hasync: any[];
  }
}
