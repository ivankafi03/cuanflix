"use client";

import { useSession } from "next-auth/react";
import Script from "next/script";

export default function AdScripts() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (isAdmin) return null;

    return (
        <>
            {/* AdsTerra Social Bar Ad Script */}
            <Script
                id="adsterra-social-bar"
                src="https://pl29429558.effectivecpmnetwork.com/82/24/c4/8224c42340e4d16455652554fa3261c8.js"
                strategy="afterInteractive"
            />
        </>
    );
}
