"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Gift, X, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "./ToastContext";

export default function RewardNotification() {
    const { data: session, status } = useSession();
    const [reward, setReward] = useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [guestPromoVisible, setGuestPromoVisible] = useState(false);
    const { showToast } = useToast();

    const fetchRewards = async () => {
        if (status !== "authenticated") return;
        
        try {
            const res = await fetch("/api/member/rewards");
            if (res.ok) {
                const data = await res.json();
                if (data.rewards && data.rewards.length > 0) {
                    // Tampilkan reward pertama yang tersedia
                    setReward(data.rewards[0]);
                    setVisible(true);
                }
            }
        } catch (e) {
            console.error("Failed to fetch rewards", e);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            const timer = setTimeout(fetchRewards, 3000);
            return () => clearTimeout(timer);
        } else if (status === "unauthenticated") {
            const timer = setTimeout(() => {
                setGuestPromoVisible(true);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleClaim = async () => {
        if (!reward || claiming) return;
        
        setClaiming(true);
        try {
            const res = await fetch("/api/member/rewards/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rewardId: reward.id })
            });

            if (res.ok) {
                showToast(`Sukses! Bonus $${reward.amount.toFixed(2)} ditambahkan.`, "success");
                setVisible(false);
                setTimeout(fetchRewards, 2000);
            } else {
                const data = await res.json();
                showToast(data.error || "Gagal klaim bonus", "error");
            }
        } catch (e) {
            showToast("Gagal klaim, cek koneksi kamu", "error");
        } finally {
            setClaiming(false);
        }
    };

    // 1. Render Promo Tamu (Guest)
    if (guestPromoVisible && status === "unauthenticated") {
        return (
            <div className="fixed bottom-24 md:bottom-4 right-4 left-4 md:left-auto md:w-[320px] z-[9999] animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="bg-[#0F0F11]/90 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative overflow-hidden group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-35 blur-lg" />
                    
                    <button 
                        onClick={() => setGuestPromoVisible(false)}
                        className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-white transition-colors z-20"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex gap-3 items-center relative z-10">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <Gift className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">🎉 WELCOME REWARD</span>
                            <h4 className="text-xs font-bold text-white tracking-tight leading-none">Klaim $1.00 Pertamamu!</h4>
                        </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-medium leading-normal relative z-10 -mt-1">
                        Daftar hari ini dan dapatkan saldo awal gratis sebesar $1.00 langsung masuk ke akun Anda.
                    </p>

                    <div className="flex items-center gap-2 relative z-10 mt-1">
                        <Link 
                            href="/auth/register"
                            className="flex-1 bg-primary hover:bg-primary/95 text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-md shadow-primary/10 text-center"
                        >
                            AMBIL BONUS SAYA <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button 
                            onClick={() => setGuestPromoVisible(false)}
                            className="px-2 py-2 text-zinc-500 hover:text-white text-[8px] font-black uppercase tracking-widest transition-all"
                        >
                            Lewati Promo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Render Reward Member (Authenticated)
    if (!visible || !reward) return null;

    // Remove emojis from title and message if any
    const cleanTitle = reward.title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    const cleanMessage = reward.message.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-500">
            <div className="bg-[#0F0F11]/95 border border-primary/30 p-8 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col gap-6 max-w-sm w-full relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px]" />
                
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-center mb-2">
                        <Gift className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Reward Available</span>
                        <h4 className="text-2xl font-black text-white tracking-tight">
                            {cleanTitle}
                        </h4>
                    </div>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed px-4">
                        {cleanMessage}
                    </p>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {claiming ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Klaim Bonus</>
                        )}
                    </button>
                    <button 
                        onClick={() => setVisible(false)}
                        className="w-full py-3 text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
