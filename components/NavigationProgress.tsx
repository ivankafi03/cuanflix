"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const isAdmin = (session?.user as any)?.role === "ADMIN";

    // Reset progress when route changes (navigation complete)
    useEffect(() => {
        setProgress(100);
        const finish = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 300);
        return () => clearTimeout(finish);
    }, [pathname, searchParams]);

    // Expose start function globally so link/card clicks can trigger it
    useEffect(() => {
        (window as any).__startNavProgress = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);

            setProgress(0);
            setVisible(true);

            // Banner overlay disabled (no ads)

            // Simulate progress up to 85% while loading
            let current = 0;
            intervalRef.current = setInterval(() => {
                current += Math.random() * 15;
                if (current >= 85) {
                    current = 85;
                    clearInterval(intervalRef.current!);
                }
                setProgress(current);
            }, 150);
        };

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAdmin]);

    if (!visible) return null;

    return (
        <>
            {/* Top progress bar */}
            <div
                className="fixed top-0 left-0 z-[99999] h-[3px] transition-all ease-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #f472b6, #fb7185, #f97316)",
                    boxShadow: "0 0 10px rgba(244,114,182,0.7), 0 0 20px rgba(244,114,182,0.4)",
                    transition: progress === 100 ? "width 0.3s ease-out" : "width 0.2s ease-out"
                }}
            />
            {/* Glow dot at the tip */}
            <div
                className="fixed top-0 z-[99999] w-3 h-3 rounded-full -translate-y-[4px]"
                style={{
                    left: `calc(${progress}% - 6px)`,
                    background: "#f472b6",
                    boxShadow: "0 0 10px 4px rgba(244,114,182,0.8)",
                    transition: progress === 100 ? "left 0.3s ease-out" : "left 0.2s ease-out"
                }}
            />
        </>
    );
}
