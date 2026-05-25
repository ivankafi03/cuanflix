"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface VideoData {
    title: string;
    image: string;
    href: string;
}

export default function HeroSlider({ videos }: { videos: VideoData[] }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!videos || videos.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 5000); // Slide setiap 5 detik

        return () => clearInterval(interval);
    }, [videos]);

    if (!videos || videos.length === 0) return null;

    const currentVideo = videos[currentIndex];

    const handleScrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleMulaiNonton = () => {
        if (!session) {
            router.push("/auth/register");
        } else {
            handleScrollToSection("kategori-video");
        }
    };

    return (
        <section className="relative pt-24 pb-12 md:pt-36 md:pb-24 overflow-hidden bg-transparent min-h-[85vh] flex flex-col items-center">
            {/* Elegant Top Glow - Vercel/Linear Style */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none z-0" />
            
            {/* Ambient Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
 
            {/* Elegant Batik Pattern */}
            <div className="absolute inset-0 bg-batik-pink opacity-[0.05] pointer-events-none z-0 mix-blend-screen" />
 
            <div className="relative max-w-6xl mx-auto px-4 md:px-8 flex flex-col items-center text-center z-10 w-full">
                
                {/* Ultra-minimalist Badge (No Stroke) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-full mb-8 shadow-sm"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-300 tracking-wide">Platform Video Penghasil Saldo Tercepat</span>
                </motion.div>
 
                {/* Monumental Typography (FikaDigi/Vercel Style) */}
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.8rem] font-extrabold text-slate-100 tracking-tighter mb-4 sm:mb-8 leading-[1.1] sm:leading-[1.05]"
                >
                    Dengan Hanya Menonton <br className="hidden md:block" />
                    Atau Membagikan Link <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 font-serif italic font-medium">Saldo Anda Bertambah.</span>
                </motion.h1>
 
                {/* Monumental Subtitle (Slate-400) */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 font-medium"
                >
                    Ubah aktivitas menonton dan berbagi video Anda menjadi penghasilan riil. Nikmati ribuan koleksi video eksklusif tanpa batas, sebarkan tautan, dan cairkan komisi Anda secara instan.
                </motion.p>
 
                {/* Sleek Minimalist Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16 sm:mb-24"
                >
                    <button
                        onClick={handleMulaiNonton}
                        className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary text-white text-sm sm:text-base font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/20 cursor-pointer active:scale-95"
                    >
                        Mulai Nonton & Hasilkan
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleScrollToSection("cara-kerja")}
                        className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm sm:text-base font-semibold rounded-full transition-all duration-300 cursor-pointer active:scale-95 shadow-lg shadow-white/5"
                    >
                        Pelajari Cara Cuan
                    </button>
                </motion.div>
 
                {/* Grand Showcase Slider Image (FikaDigi Showcase Frame) */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="w-full relative max-w-5xl mx-auto"
                >
                    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-black rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] group border-0">
                        
                        {/* Background Slide Image */}
                        <div
                            key={currentIndex}
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-100 hover:scale-105"
                            style={{ backgroundImage: `url(${currentVideo.image})` }}
                        />
 
                        {/* Slider Overlays - Tertutup hitam di bawah (Seamless integration) */}
                        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 via-black/70 to-transparent pointer-events-none z-10" />
 
                        {/* Slide Info & Controls (overlayed) */}
                        <div className="absolute bottom-4 sm:bottom-8 inset-x-4 sm:inset-x-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
                            <div className="max-w-xl">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold uppercase tracking-widest mb-2 shadow-sm">
                                    Popular Premiere
                                </span>
                                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
                                    {currentVideo.title}
                                </h3>
                            </div>
 
                            <div className="flex items-center gap-3">
                                {/* Play Button */}
                                <Link
                                    href={`/watch/${currentVideo.href}`}
                                    prefetch={false}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group/play"
                                    title="Watch Now"
                                >
                                    <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                                </Link>
 
                                {/* Slider Navigation */}
                                <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md p-1.5 rounded-full">
                                    <button
                                        onClick={() => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/80 hover:text-white"
                                        title="Previous"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentIndex((prev) => (prev + 1) % videos.length)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/80 hover:text-white"
                                        title="Next"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
 
                        {/* Slider Progress Indicators */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1">
                            {videos.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 transition-all duration-500 rounded-full ${idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-white/20"}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
