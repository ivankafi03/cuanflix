"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Zap, Sparkles, Loader2, DollarSign, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function WavingCulik({ size = 1 }: { size?: number }) {
    return (
        <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative"
        >
            <svg width={50 * size} height={70 * size} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path 
                    d="M20 25V45M20 28L12 22M20 28L28 35M20 45L14 58M20 45L26 58" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    animate={{
                        d: [
                            "M20 25V45M20 28L12 22M20 28L28 35M20 45L14 58M20 45L26 58",
                            "M20 25V45M20 28L8 15M20 28L28 35M20 45L14 58M20 45L26 58",
                            "M20 25V45M20 28L12 22M20 28L28 35M20 45L14 58M20 45L26 58"
                        ]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
                <circle cx="20" cy="14" r="11" fill="#f472b6" />
                <text x="20" y="19" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Inter, sans-serif">$</text>
                <circle cx="16" cy="12" r="1.2" fill="white" />
                <circle cx="24" cy="12" r="1.2" fill="white" />
                <path d="M16 16C16 16 18 18.5 20 18.5C22 18.5 24 16 24 16" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
        </motion.div>
    );
}

function DownloadContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url");
    const title = (searchParams.get("title") || "Premium Content").replace(/-/g, ' ');
    const [isPreparing, setIsPreparing] = useState(true);
    const [viewType, setViewType] = useState<'mobile' | 'pc'>('pc');

    useEffect(() => {
        const checkView = () => setViewType(window.innerWidth < 1100 ? 'mobile' : 'pc');
        checkView();
        window.addEventListener('resize', checkView);
        const timer = setTimeout(() => setIsPreparing(false), 2000);
        return () => {
            window.removeEventListener('resize', checkView);
            clearTimeout(timer);
        };
    }, []);

    const handleDownload = () => {
        // Infinite Ad Loop: Hanya buka iklan, tidak pernah download file asli
        window.open("https://downconvenientmagnetic.com/ua2u1rp3?key=56592622f6fffcc72f2baf8f80cc95c2", "_blank");
    };

    if (!url) return null;

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 relative overflow-hidden flex flex-col items-center justify-center">
            <main className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 py-10 relative z-10">
                
                {/* Mascot Section */}
                <div className="flex flex-col items-center lg:items-end gap-4 lg:w-[30%]">
                    <WavingCulik size={2.2} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-zinc-900/90 border border-white/10 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl max-w-[220px]"
                    >
                        <p className="text-[11px] font-black text-white italic leading-snug text-center lg:text-right">
                            "Halo! Filenya sudah <br className="hidden md:block" /> siap diunduh, klik <br className="hidden md:block" /> tombol di layar ya!"
                        </p>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 lg:left-auto lg:right-8 lg:translate-x-0 w-4 h-4 bg-zinc-900 border-l border-t border-white/10 rotate-45" />
                    </motion.div>
                </div>

                {/* Device Display */}
                <div className="w-full lg:w-[70%] flex flex-col items-center">
                    <div className="relative group w-full max-w-[850px]">
                        <div className="relative bg-zinc-900 border-[10px] border-zinc-800 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="flex flex-col md:flex-row min-h-[400px] bg-[#050505]">
                                
                                {/* Info Panel */}
                                <div className="flex-1 p-8 md:p-14 flex flex-col gap-6 md:gap-8 border-b md:border-b-0 md:border-r border-white/5 relative">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Crown className="w-4 h-4 text-primary" />
                                            <span className="text-primary font-black text-[9px] uppercase tracking-[0.4em]">Cuanflix Cloud</span>
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-[0.95] line-clamp-3">
                                            {title}
                                        </h1>
                                    </div>
                                    <div className="mt-auto grid grid-cols-2 gap-4">
                                        {[
                                            { icon: Zap, label: "Speed", val: "High", color: "text-blue-500" },
                                            { icon: Shield, label: "Secure", val: "Safe", color: "text-green-500" }
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black text-zinc-500 uppercase leading-none mb-1">{item.label}</span>
                                                    <span className={`text-[9px] font-black uppercase ${item.color}`}>{item.val}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Panel (Only Logo Button) */}
                                <div className="w-full md:w-[280px] bg-black/20 flex flex-col items-center justify-center p-12 gap-10">
                                    <AnimatePresence mode="wait">
                                        {isPreparing ? (
                                            <motion.div key="p" className="flex flex-col items-center gap-6">
                                                <Loader2 className="w-16 h-16 text-primary animate-spin" strokeWidth={1.5} />
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Preparing...</p>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="r" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-8">
                                                <button 
                                                    onClick={handleDownload}
                                                    className="w-32 h-32 md:w-40 md:h-40 bg-primary text-black rounded-[2.5rem] shadow-[0_20px_50px_rgba(244,114,182,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
                                                    <Download className="w-12 h-12 md:w-16 md:h-16 relative z-10 group-hover:animate-bounce" />
                                                </button>
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Click Icon to Download</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DownloadPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
            <DownloadContent />
        </Suspense>
    );
}
