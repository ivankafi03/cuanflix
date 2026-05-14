"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AntiAdBlock() {
    const pathname = usePathname() || "";
    const [isBlocked, setIsBlocked] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Jangan tampilkan di halaman dashboard, admin, atau auth
    const isRestricted = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/auth");

    useEffect(() => {
        // Simple AdBlock detection
        const checkAdBlock = async () => {
            try {
                const response = await fetch(
                    "https://www.profitablecpmratenetwork.com/82/24/c4/8224c42340e4d16455652554fa3261c8.js",
                    { method: "HEAD", mode: "no-cors", cache: "no-store" }
                );
                // If it fails to fetch an ad domain, likely blocked
                setIsBlocked(false);
            } catch (error) {
                setIsBlocked(true);
            }
        };

        // Delay check to ensure scripts have time to be blocked
        const timer = setTimeout(checkAdBlock, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!isBlocked || !isVisible || isRestricted) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[10000000]"
            >
                <div className="bg-zinc-950/95 backdrop-blur-2xl border border-primary/20 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    {/* Background glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-all duration-700" />
                    
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <ShieldAlert className="w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-white font-black text-lg italic uppercase tracking-tight">AdBlock Terdeteksi!</h3>
                            <p className="text-zinc-400 text-xs font-bold leading-relaxed">
                                Mohon matikan AdBlock Anda untuk terus mendukung kami menyediakan konten gratis, atau beli <span className="text-primary italic">Akun VIP</span> untuk nonton tanpa iklan selamanya.
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    Saya Sudah Matikan
                                </button>
                                <a 
                                    href="/premium" 
                                    className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
                                >
                                    Beli Akun VIP
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
