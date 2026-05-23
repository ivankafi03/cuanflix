"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard } from "lucide-react";
import MaintenanceBanner from "./MaintenanceBanner";
import Logo from "./Logo";

export default function Navbar() {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [textIndex, setTextIndex] = useState(0);

    const scrollingTexts = [
        "Share Video Dapat Cuan",
        "Nonton Dapat Cuan",
        ...(!session ? ["Yuk Login!"] : [])
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const textInterval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % scrollingTexts.length);
        }, 3000);

        if (session && !isLoggingOut) {
            const forceLogout = (session as any).forceLogout;
            if (forceLogout) {
                setIsLoggingOut(true);
                signOut({ callbackUrl: "/auth/login?error=SessionExpired" });
            }
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(textInterval);
        };
    }, [session, isLoggingOut, scrollingTexts.length]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Explore", href: "/jav" },
        { name: "Categories", href: "/categories" },
    ];

    const is_admin = (session?.user as any)?.role === "ADMIN";

    const handleSearch = (close = false) => {
        if (searchQuery.trim()) {
            if (close) setIsMobileMenuOpen(false);
            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[9999999] transition-all duration-500 ${
            isMobileMenuOpen 
                ? "bg-[#0a0a0f]/98 backdrop-blur-2xl border-b border-white/[0.08]" 
                : isScrolled 
                    ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
                    : "bg-transparent"
        }`}>
            <MaintenanceBanner />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-6 relative">
                
                {/* Logo & Scrolling Text */}
                <Link href="/" className="flex items-center gap-2 shrink-0 group relative z-[60] min-w-[140px]">
                    <AnimatePresence mode="wait">
                        {!isScrolled && !isMobileMenuOpen ? (
                            <motion.div
                                key="logo-full"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2"
                            >
                                <motion.div
                                    animate={isMobileMenuOpen ? { scale: 1.1, rotate: 360 } : { scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                >
                                    <Logo className="w-8 h-8 md:w-9 md:h-9 shadow-lg shadow-primary/20 rounded-xl" showText={false} />
                                </motion.div>
                                {!isScrolled && (
                                    <span className="text-slate-100 font-black text-xl tracking-tight block">
                                        Cuan<span className="text-primary">flix</span>
                                    </span>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="scrolling-text"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={textIndex}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.5, ease: "anticipate" }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.6)]" />
                                        <span className="text-slate-100 font-black text-xs md:text-sm italic uppercase tracking-wide">
                                            {(() => {
                                                const activeText = scrollingTexts[textIndex] || scrollingTexts[0] || "";
                                                if (activeText.includes(" Dapat ")) {
                                                    return activeText.split(" Dapat ").map((part, i) => (
                                                        <React.Fragment key={i}>
                                                            {i === 1 ? <span className="text-primary"> Dapat {part}</span> : part}
                                                        </React.Fragment>
                                                    ));
                                                } else if (activeText.includes("Login!")) {
                                                    return <>Yuk <span className="text-primary">Login!</span></>;
                                                } else {
                                                    return activeText;
                                                }
                                            })()}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm text-slate-300 hover:text-primary transition-colors font-semibold"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Search (centered) */}
                <div className="hidden lg:flex flex-1 max-w-sm items-center bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-2 gap-2 focus-within:border-primary/40 focus-within:bg-white/[0.1] transition-all duration-300">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 w-full"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                href={is_admin ? "/admin" : "/dashboard"}
                                className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.08]"
                            >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                {is_admin ? "Admin Panel" : "Dashboard"}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="hidden md:block px-5 py-2 rounded-full border border-white/[0.12] text-sm font-semibold text-slate-200 hover:bg-white/[0.08] hover:text-white transition-all shadow-sm"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile User Icon */}
                    <Link
                        href={session ? (is_admin ? "/admin" : "/dashboard") : "/auth/login"}
                        className="md:hidden p-2 text-slate-300 hover:text-primary transition-colors cursor-pointer"
                        title={session ? "Dashboard" : "Login"}
                    >
                        <User className="w-5 h-5" />
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden bg-[#0a0a0f] border-b border-white/[0.08] px-6 py-8 flex flex-col gap-5 relative overflow-hidden shadow-2xl"
                    >
                        {/* 1. Navigation Links - Now at the VERY TOP */}
                        <div className="flex flex-col gap-4 mb-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-sm font-bold text-slate-300 hover:text-primary transition-all flex items-center gap-3 group/link"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover/link:bg-primary transition-all" />
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
 
                        {/* 2. Search Box - Middle */}
                        <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 gap-2">
                            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch(true)}
                                className="bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500 w-full"
                            />
                        </div>
 
                        {/* 3. User Account Card - Bottom */}
                        <div className="mt-1">
                            {session ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] relative overflow-hidden group shadow-sm"
                                >
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                                    <div className="flex items-center gap-3 mb-1 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-black text-primary text-lg">
                                            {session.user?.name?.[0] || "U"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Welcome back</span>
                                            <span className="text-sm font-black text-slate-100 italic truncate max-w-[150px]">{session.user?.name || "Member"}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                                        <Link
                                            href={is_admin ? "/admin" : "/dashboard"}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="py-2.5 text-center rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                        >
                                            {is_admin ? "Admin" : "Dashboard"}
                                        </Link>
                                        <button
                                            onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                                            className="py-2.5 text-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-400 transition-all cursor-pointer"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col gap-3 relative overflow-hidden shadow-sm"
                                >
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Premium Access</span>
                                        <h4 className="text-slate-100 font-black italic uppercase text-base leading-none">Login ke Akun Anda</h4>
                                    </div>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="py-3 flex items-center justify-center rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all relative z-10"
                                    >
                                        Login Sekarang
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
