"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

// Native Banner Ad (container-based)
export default function AdNative({ className = "" }: { className?: string }) {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const containerRef = useRef<HTMLDivElement>(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (isAdmin || loaded.current || !containerRef.current) return;
        loaded.current = true;

        const script = document.createElement("script");
        script.src = "https://pl29360873.profitablecpmratenetwork.com/cc6b63069d4fbfd8dc3934796f64530a/invoke.js";
        script.async = true;
        script.setAttribute("data-cfasync", "false");

        containerRef.current.appendChild(script);
    }, []);

    return isAdmin ? null : (
        <div className={`w-full overflow-hidden ${className}`}>
            <div id="container-cc6b63069d4fbfd8dc3934796f64530a" ref={containerRef} />
        </div>
    );
}
