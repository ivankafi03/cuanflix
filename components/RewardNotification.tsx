"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Gift, X, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "./ToastContext";

export default function RewardNotification() {
    const { data: session, status } = useSession();
    const pathname = usePathname() || "";
    const isAdmin = (session?.user as any)?.role === "ADMIN" || pathname.startsWith("/admin");
    const [reward, setReward] = useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [guestPromoVisible, setGuestPromoVisible] = useState(false);
    const { showToast } = useToast();

    const fetchRewards = async () => {
        if (status !== "authenticated" || isAdmin) return;
        
        try {
            const res = await fetch("/api/member/rewards");
            if (res.ok) {
                const data = await res.json();
                if (data.rewards && data.rewards.length > 0) {
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

    if (isAdmin) return null;

    // 1. Render Promo Tamu (Guest Promo Card - Simpel & Kecil)
    if (guestPromoVisible && status === "unauthenticated") {
        return (
            <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-[280px] z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="bg-[#0F0F11] border border-white/10 p-3.5 rounded-xl shadow-xl flex flex-col gap-2.5 relative">
                    <button 
                        onClick={() => setGuestPromoVisible(false)}
                        className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-white transition-colors p-1"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20 shrink-0">
                            <Gift className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-primary uppercase tracking-wider">Bonus Baru</span>
                            <h4 className="text-xs font-bold text-white leading-tight">Dapatkan Saldo $1.00</h4>
                        </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-medium leading-tight">
                        Daftar akun dan klaim saldo gratis $1.00.
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                        <Link 
                            href="/auth/register"
                            className="flex-1 bg-primary hover:bg-primary/90 text-white text-[9px] font-bold uppercase tracking-wider py-2 rounded-lg text-center transition-all"
                        >
                            Daftar & Klaim
                        </Link>
                        <button 
                            onClick={() => setGuestPromoVisible(false)}
                            className="px-2 py-2 text-zinc-500 hover:text-white text-[8px] font-bold uppercase tracking-wider"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Render Reward Member (Simpel & Ringkas)
    if (!visible || !reward) return null;

    const cleanTitle = reward.title?.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') || 'Bonus Hadiah';
    const cleanMessage = reward.message?.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') || 'Klaim bonus Anda sekarang.';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-300">
            <div className="bg-[#0F0F11] border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-xs w-full text-center">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto">
                    <Gift className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white">{cleanTitle}</h4>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">{cleanMessage}</p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                        {claiming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Klaim Bonus"}
                    </button>
                    <button 
                        onClick={() => setVisible(false)}
                        className="w-full py-1.5 text-zinc-500 hover:text-white text-[10px] font-bold uppercase tracking-wider"
                    >
                        Nanti
                    </button>
                </div>
            </div>
        </div>
    );
}
