"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Rocket, CheckCircle2, X } from "lucide-react";

export default function NotificationToast() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notification, setNotification] = useState<any>(null);
    const [visible, setVisible] = useState(false);

    const fetchNotification = async () => {
        try {
            const res = await fetch("/api/ghosts/notifications");
            if (res.ok) {
                const data = await res.json();
                if (data.active) {
                    setNotification(data);
                    setVisible(true);
                    
                    // Hilang setelah 6 detik
                    setTimeout(() => {
                        setVisible(false);
                    }, 6000);
                }
            }
        } catch (e) {
            console.error("Notif fetch error", e);
        }
    };

    useEffect(() => {
        // Muncul pertama kali setelah 10 detik
        const initialDelay = setTimeout(() => {
            fetchNotification();
        }, 10000);

        // Muncul rutin setiap 3-7 menit (acak)
        const interval = setInterval(() => {
            const randomDelay = Math.floor(Math.random() * (420000 - 180000) + 180000);
            setTimeout(fetchNotification, randomDelay);
        }, 300000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, []);

    if (!notification || !visible) return null;

    const isGuest = !session;

    const handleToastClick = (e: React.MouseEvent) => {
        // Jangan redirect jika yang diklik adalah tombol close (X)
        if ((e.target as HTMLElement).closest('button')) return;
        
        if (isGuest) {
            router.push("/auth/register");
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-[9999] animate-in slide-in-from-left-full duration-700 ease-out">
            <div 
                onClick={handleToastClick}
                className={`bg-[#0F0F11]/90 backdrop-blur-xl border border-white/10 p-2.5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 max-w-[250px] relative overflow-hidden group select-none transition-all ${isGuest ? 'cursor-pointer hover:border-emerald-500/40 hover:scale-[1.02] active:scale-95' : ''}`}
            >
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-30 group-hover:opacity-50 transition-all blur-xl" />
                
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isGuest ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                    {isGuest ? <CheckCircle2 className="w-5 h-5 animate-pulse" /> : <Rocket className="w-5 h-5" />}
                </div>

                <div className="flex flex-col gap-0.5 z-10 pr-4">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                        {notification.type === "WITHDRAWAL" ? "Recent Withdrawal" : "Member Activity"}
                    </p>
                    <h4 className="text-xs font-bold text-white leading-tight">
                        {notification.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium leading-tight">
                        {notification.type === "WITHDRAWAL" ? (
                            <>Telah mencairkan <span className="text-green-400 font-black">${notification.amount}</span> ke {notification.method}</>
                        ) : (
                            <>{notification.message}</>
                        )}
                    </p>
                </div>

                <button 
                    onClick={() => setVisible(false)}
                    className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-white transition-all z-20"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
