import React from "react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                {/* Ikon Pulsing Mewah */}
                <div className="relative">
                    <div className="w-20 h-20 bg-primary/20 rounded-3xl animate-pulse blur-xl absolute inset-0" />
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center relative z-10 animate-bounce shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)]">
                        <span className="text-black text-3xl font-black italic">$</span>
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
