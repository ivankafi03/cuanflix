"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function ViewAllLink({ href }: { href: string }) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleMouseEnter = useCallback(() => {
        router.prefetch(href);
    }, [router, href]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (isNavigating) return;
        setIsNavigating(true);

        if (typeof window !== "undefined" && (window as any).__startNavProgress) {
            (window as any).__startNavProgress();
        }

        router.push(href);
    }, [isNavigating, router, href]);

    return (
        <a
            href={href}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            className="text-xs font-bold text-slate-500 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer group"
        >
            {isNavigating ? (
                <>
                    Loading
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </>
            ) : (
                <>
                    View All
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </a>
    );
}
