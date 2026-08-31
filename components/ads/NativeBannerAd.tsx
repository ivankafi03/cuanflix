"use client";

import { useSession } from "next-auth/react";

export default function NativeBannerAd({ id }: { id?: string }) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (isAdmin) return null;

    const srcDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { background: transparent; width: 100%; min-height: 100%; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
                #container-863f6aef8282a41ad5ebdefcf161468b { width: 100%; display: flex; justify-content: center; align-items: center; }
                #container-863f6aef8282a41ad5ebdefcf161468b img { max-width: 100% !important; height: auto !important; }
                #container-863f6aef8282a41ad5ebdefcf161468b > * { max-width: 100% !important; }
            </style>
        </head>
        <body>
            <div id="container-863f6aef8282a41ad5ebdefcf161468b"></div>
            <script async="async" data-cfasync="false" src="https://pl29429652.effectivecpmnetwork.com/863f6aef8282a41ad5ebdefcf161468b/invoke.js"></script>
        </body>
        </html>
    `;

    return (
        <div className="w-full my-3 flex justify-center items-center md:hidden">
            <iframe
                srcDoc={srcDoc}
                title={`ad-banner-${id || 'unit'}`}
                className="w-full min-h-[290px] border-0 overflow-hidden"
                scrolling="no"
            />
        </div>
    );
}
