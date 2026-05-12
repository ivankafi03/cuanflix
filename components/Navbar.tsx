"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
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
    }, [session, isLoggingOut]);

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
                ? "bg-zinc-950/95 backdrop-blur-2xl border-b border-white/5" 
                : isScrolled 
                    ? "glass-premium border-b border-white/10" 
                    : "bg-gradient-to-b from-black/90 to-transparent"
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
                                    <span className="text-white font-black text-xl tracking-tight hidden sm:block">
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
                                        <span className="text-white font-black text-xs md:text-sm italic uppercase tracking-wide">
                                            {scrollingTexts[textIndex].includes(" Dapat ") ? (
                                                scrollingTexts[textIndex].split(" Dapat ").map((part, i) => (
                                                    <React.Fragment key={i}>
                                                        {i === 1 ? <span className="text-primary"> Dapat {part}</span> : part}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                scrollingTexts[textIndex].includes("Login!") ? (
                                                    <>Yuk <span className="text-primary">Login!</span></>
                                                ) : scrollingTexts[textIndex]
                                            )}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>

                {/* Animated Center Text for Mobile */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-1/2 -translate-x-1/2 md:hidden"
                        >
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
                                cuanflix.site
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Search (centered) */}
                <div className="hidden lg:flex flex-1 max-w-sm items-center bg-white/5 border border-white/8 rounded-lg px-4 py-2 gap-2 focus-within:border-primary/40 transition-colors">
                    <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {session ? (
                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                href={is_admin ? "/admin" : "/dashboard"}
                                className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                                {is_admin ? "Admin Panel" : "Dashboard"}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="hidden md:block px-4 py-2 rounded-full border border-white/15 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
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
                        className="md:hidden bg-zinc-950/95 backdrop-blur-2xl border-b border-white/5 px-5 py-10 flex flex-col gap-4 relative overflow-visible"
                    >
                        {/* Culik Mascot - Hanging from the Hamburger Button area */}
                        <motion.div
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 12 }}
                            className="absolute top-0 right-5 z-[70] flex flex-col items-center"
                        >
                            {/* The Rope */}
                            <div className="w-0.5 h-16 bg-white/20" />
                            
                            {/* Culik Body (SVG) - Swinging Animation */}
                            <motion.div
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="flex flex-col items-center -mt-1"
                            >
                                <svg width="30" height="45" viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Head (Dollar Symbol) */}
                                    <circle cx="15" cy="8" r="8" fill="#f472b6" />
                                    <text x="15" y="12" textAnchor="middle" fill="white" fontSize="12" fontWeight="black" fontFamily="sans-serif">$</text>
                                    
                                    {/* Body Hanging Pose */}
                                    <path d="M15 16V30M15 16L5 10M15 16L25 10M15 30L8 42M15 30L22 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                    
                                    {/* Hands Grabbing the Rope */}
                                    <circle cx="5" cy="10" r="2.5" fill="#f472b6" />
                                    <circle cx="25" cy="10" r="2.5" fill="#f472b6" />
                                </svg>
                            </motion.div>
                        </motion.div>

                        {/* 1. Search Box at the very top */}
                        <div className="flex items-center bg-white/5 border border-white/8 rounded-lg px-4 py-2 gap-2 mt-2">
                            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch(true)}
                                className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-600 w-full"
                            />
                        </div>

                        {/* 2. User Account Card - Below Search */}
                        <div className="mb-2">
                            {session ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-2 p-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group"
                                >
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                                    <div className="flex items-center gap-3 mb-1 relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-primary text-lg">
                                            {session.user?.name?.[0] || "U"}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Welcome back</span>
                                            <span className="text-sm font-black text-white italic truncate max-w-[150px]">{session.user?.name || "Member"}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                                        <Link
                                            href={is_admin ? "/admin" : "/dashboard"}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="py-2.5 text-center rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                        >
                                            {is_admin ? "Admin" : "Dashboard"}
                                        </Link>
                                        <button
                                            onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                                            className="py-2.5 text-center rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-400 transition-all"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col gap-3 relative overflow-hidden"
                                >
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Premium Access</span>
                                        <h4 className="text-white font-black italic uppercase text-base leading-none">Login ke Akun Anda</h4>
                                    </div>
                                    <Link
                                        href="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="py-3 flex items-center justify-center rounded-xl bg-primary text-black text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all relative z-10"
                                    >
                                        Login Sekarang
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        {/* 3. Navigation Links - Bottom */}
                        <div className="flex flex-col gap-4 mt-2">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 + 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-sm font-black text-zinc-500 hover:text-primary transition-all flex items-center gap-3 group/link"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover/link:bg-primary transition-all" />
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
