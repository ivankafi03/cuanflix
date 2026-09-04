"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Providers from "@/components/Providers";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import NotificationToast from "@/components/NotificationToast";
import RewardNotification from "@/components/RewardNotification";
import NavigationProgressWrapper from "@/components/NavigationProgressWrapper";
import ReferralTracker from "@/components/ReferralTracker";
import Histats from "@/components/Histats";
import AgeGateModal from "@/components/AgeGateModal";
import AdScripts from "@/components/ads/AdScripts";
import { Loader2 } from "lucide-react";

export default function MainLayoutWrapper({
    children,
    session
}: {
    children: React.ReactNode;
    session: any;
}) {
    const pathname = usePathname() || "";
    const isEmbedPlayer = pathname.startsWith("/embed-player") || pathname.startsWith("/api/");

    if (isEmbedPlayer) {
        return (
            <div style={{ margin: 0, padding: 0, width: "100%", height: "100%", backgroundColor: "#000", overflow: "hidden" }}>
                {children}
            </div>
        );
    }

    return (
        <Providers>
            <AgeGateModal />
            <ReferralTracker />
            <NavigationProgressWrapper />
            <Navbar />
            <main className="flex-grow min-h-screen">
                {children}
            </main>
            <Footer />
            <BottomNav />
            <ChatWidget />
            <NotificationToast />
            {!pathname.startsWith("/admin") && <RewardNotification />}
            <Histats />
            <AdScripts />
            
            {session?.user && (session.user as any).throttleMode && (
                <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
                    <div className="p-4 bg-[#0F0F11] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Optimizing connection... (Slow Mode Active)</span>
                    </div>
                </div>
            )}
        </Providers>
    );
}
