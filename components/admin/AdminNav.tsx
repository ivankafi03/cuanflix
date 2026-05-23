"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    BarChart3, 
    Banknote, 
    Users, 
    MessageSquare, 
    Settings,
    Ghost,
    Gift
} from "lucide-react";

export default function AdminNav() {
    const pathname = usePathname();

    const tabs = [
        { id: "overview",   label: "Overview",   icon: BarChart3,      href: "/admin" },
        { id: "payouts",    label: "Payouts",    icon: Banknote,       href: "/admin/payouts" },
        { id: "members",    label: "Members",    icon: Users,          href: "/admin/members" },
        { id: "ghosts",     label: "Ghosts",     icon: Ghost,          href: "/admin/ghosts" },
        { id: "chat",       label: "Chat",       icon: MessageSquare,  href: "/admin/chat" },
        { id: "broadcasts", label: "Broadcasts", icon: Gift,           href: "/admin/broadcasts" },
        { id: "settings",   label: "Settings",   icon: Settings,       href: "/admin/settings" }
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center justify-between sm:justify-start gap-1 sm:gap-2 p-1.5 sm:p-2 bg-[#081B33]/70 backdrop-blur-2xl border border-sky-400/30 rounded-2xl sm:rounded-full shadow-[0_20px_50px_rgba(14,165,233,0.25)] w-[94vw] sm:w-auto max-w-5xl">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`flex flex-col sm:flex-row items-center sm:gap-2 px-1 sm:px-4 py-1.5 sm:py-2 text-center rounded-xl sm:rounded-full transition-all duration-300 flex-1 sm:flex-initial min-w-0 select-none cursor-pointer active:scale-95 ${
                            isActive 
                                ? 'bg-sky-500/25 border border-sky-400/40 text-white shadow-[0_0_15px_rgba(14,165,233,0.35)] font-extrabold' 
                                : 'border border-transparent text-sky-200/50 hover:text-sky-100 hover:bg-sky-500/10'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-colors ${isActive ? 'text-sky-300' : 'text-sky-200/45'}`} />
                        <span className="text-[7.5px] sm:text-xs font-bold tracking-tight mt-0.5 sm:mt-0 leading-none truncate max-w-full">
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}

