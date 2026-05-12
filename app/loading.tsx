import React from "react";
import Logo from "@/components/Logo";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                {/* Ikon Pulsing Mewah */}
                <div className="relative">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl animate-pulse blur-xl absolute inset-0" />
                    <div className="relative z-10 animate-bounce">
                        <Logo size="lg" showText={false} />
                    </div>
                </div>
                
                {/* Teks Pulsing */}
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter animate-pulse">
                        CUAN<span className="text-primary">FLIX</span>
                    </h2>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
    );
}
