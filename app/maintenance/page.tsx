import React from "react";
import { Hammer, Clock, MessageCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function MaintenancePage() {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
    const message = settings?.maintenanceMessage || "Situs sedang dalam pemeliharaan rutin untuk meningkatkan performa.";

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl">
                <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] border border-orange-500/20 flex items-center justify-center text-orange-500 animate-bounce">
                    <Hammer className="w-12 h-12" />
                </div>

                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Under <span className="text-orange-500">Maintenance</span>
                    </h1>
                    <p className="text-zinc-500 text-lg font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Est. Time</p>
                            <p className="text-sm font-bold text-white tracking-tight">Soon as Possible</p>
                        </div>
                    </div>

                    <a 
                        href={settings?.telegramLink || "#"} 
                        target="_blank"
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4 hover:bg-white/10 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9] group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Support</p>
                            <p className="text-sm font-bold text-white tracking-tight">Join Telegram</p>
                        </div>
                    </a>
                </div>

                <div className="pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4">
                    <p className="text-zinc-600 text-xs font-medium">Are you an administrator?</p>
                    <Link href="/auth/login" className="text-white font-black text-[10px] uppercase tracking-widest bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                        Admin Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
