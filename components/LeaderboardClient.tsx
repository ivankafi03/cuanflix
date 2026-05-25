"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Medal, Star, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function LeaderboardClient() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await fetch("/api/leaderboard");
                if (res.ok) {
                    const data = await res.json();
                    setLeaders(data);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <div className="absolute -right-10 -top-10 opacity-10">
                    <Trophy className="w-48 h-48" />
                </div>
                
                <div className="flex flex-col gap-2 relative z-10 w-full sm:w-auto">
                    <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        Top <span className="text-primary">Earners</span>
                    </h1>
                    <p className="text-xs md:text-sm text-zinc-400">
                        Member dengan penghasilan tertinggi dari Nonton & Undang Teman.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-[#0F0F11] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase">Global Ranking</h2>
                </div>

                <div className="flex flex-col p-2 gap-2">
                    {loading ? (
                        <div className="py-20 flex justify-center items-center">
                            <span className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse text-[10px]">Loading Leaderboard...</span>
                        </div>
                    ) : leaders.length === 0 ? (
                        <div className="py-12 flex flex-col justify-center items-center opacity-30 gap-3">
                            <ShieldAlert className="w-10 h-10" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Belum ada data</span>
                        </div>
                    ) : (
                        leaders.map((user, idx) => (
                            <div 
                                key={user.id} 
                                className={`flex items-center justify-between p-2 md:p-3 rounded-xl border ${idx === 0 ? 'bg-primary/10 border-primary/20' : idx === 1 ? 'bg-zinc-100/5 border-zinc-100/10' : idx === 2 ? 'bg-amber-700/10 border-amber-700/20' : 'bg-transparent border-transparent hover:bg-white/5'} transition-all`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank Badge */}
                                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center font-black text-lg md:text-xl">
                                        {idx === 0 ? (
                                            <Trophy className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                                        ) : idx === 1 ? (
                                            <Medal className="w-5 h-5 md:w-7 md:h-7 text-zinc-300" />
                                        ) : idx === 2 ? (
                                            <Medal className="w-5 h-5 md:w-7 md:h-7 text-amber-600" />
                                        ) : (
                                            <span className="text-zinc-600 text-base md:text-lg">#{idx + 1}</span>
                                        )}
                                    </div>

                                    {/* Avatar & Name */}
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                            {user.image ? (
                                                <Image src={user.image} alt={user.name} fill className="object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-xs md:text-sm">{user.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-xs md:text-sm ${idx < 3 ? 'text-white' : 'text-zinc-300'}`}>{user.name}</span>
                                            {idx === 0 && <span className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1"><Star className="w-3 h-3" /> The King</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div className="text-right flex flex-col items-end pr-1 md:pr-2">
                                    <span className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Total Cuan</span>
                                    <span className={`font-black ${idx === 0 ? 'text-lg md:text-2xl text-primary drop-shadow-[0_0_10px_rgba(244,114,182,0.5)]' : idx < 3 ? 'text-base md:text-xl text-white' : 'text-sm md:text-base text-zinc-400'}`}>
                                        ${user.totalBalance.toFixed(3)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
