"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, LayoutGrid, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function BottomNav() {
    const pathname = usePathname() || "";
    const { data: session } = useSession();
    
    // Hide BottomNav on Dashboard or Admin
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
        return null;
    }

    const is_admin = (session?.user as any)?.role === "ADMIN";
    const profileLink = session ? (is_admin ? "/admin" : "/dashboard") : "/auth/login";

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Explore", href: "/jav", icon: Compass },
        { name: "Categories", href: "/categories", icon: LayoutGrid },
        { name: "Rank", href: "/leaderboard", icon: Trophy },
        { name: "Profile", href: profileLink, icon: User },
    ];

    return (
        <>
            {/* Spacer so content doesn't hide behind the bottom nav */}
            <div className="h-[72px] md:hidden w-full" /> 
            
            <div className="fixed bottom-0 left-0 right-0 z-[99999] md:hidden bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/[0.08]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="flex items-center justify-around h-[72px] px-2 relative">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-white transition-colors"
                            >
                                {/* Active indicator top line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active-line"
                                        className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_12px_rgba(244,114,182,0.8)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                
                                {/* Icon & Text Container */}
                                <motion.div
                                    className="flex flex-col items-center justify-center mt-1"
                                    animate={isActive ? { y: -3, scale: 1.1 } : { y: 2, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Icon className={`w-6 h-6 ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]" : ""}`} />
                                </motion.div>
                                
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span 
                                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                            className="text-[10px] font-bold text-primary tracking-wide absolute bottom-2"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {/* Default label if not active, smaller */}
                                {!isActive && (
                                    <span className="text-[9px] font-semibold text-zinc-500 mt-1">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
