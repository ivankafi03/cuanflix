"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface VideoData {
    title: string;
    image: string;
    href: string;
}

export default function HeroSlider({ videos }: { videos: VideoData[] }) {
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

    return (
        <section className="relative flex flex-col justify-end px-6 pt-40 pb-20 md:pb-32 min-h-[70vh] md:min-h-[85vh] overflow-hidden">
            {/* Background Slides - Optimized to only render current slide */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
                style={{ backgroundImage: `url(${currentVideo.image})` }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

            <div className="relative z-10 flex flex-col items-start gap-4 w-full max-w-[1600px] mx-auto px-4 md:px-8 animate-in fade-in duration-1000">
                <span className="px-3 py-1 rounded-full glass-premium text-[10px] font-bold text-primary uppercase tracking-widest border-primary/30">
                    Popular Premiere
                </span>
                
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tighter drop-shadow-2xl line-clamp-2">
                    {currentVideo.title}
                </h2>
                
                <p className="text-sm md:text-lg text-foreground/80 leading-relaxed max-w-2xl font-medium drop-shadow-md">
                    Explore the world's most comprehensive Japanese database. Fast, aesthetic, and perfectly curated for your cinematic journey.
                </p>
                
                <div className="flex items-center gap-4 mt-4 w-full">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/watch/${currentVideo.href}`}
                            prefetch={false}
                            className="w-12 h-12 rounded-full bg-primary text-black shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group/play"
                            title="Watch Now"
                        >
                            <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </Link>
                    </div>

                    {/* Integrated Controls - Pushed to the Right */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)}
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white bg-white/5"
                            title="Previous"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % videos.length)}
                            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white bg-white/5"
                            title="Next"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Slider Indicators */}
                <div className="flex items-center gap-1.5 mt-8">
                    {videos.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 transition-all duration-500 rounded-full ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/20"}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
