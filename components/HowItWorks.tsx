"use client";

import { motion } from "framer-motion";
import { Link, Send, TrendingUp, DollarSign, Users, Award, ShieldCheck, Zap } from "lucide-react";

const shareSteps = [
    {
        id: 1,
        title: "Salin Link Video",
        desc: "Pilih video favorit Anda di Cuanflix, lalu klik tombol Copy Link untuk mengambil tautan rujukan Anda.",
        icon: <Link className="w-5 h-5 text-sky-400" />
    },
    {
        id: 2,
        title: "Sebarkan ke Sosmed",
        desc: "Bagikan link tersebut ke WhatsApp, Telegram, Facebook, TikTok, atau grup komunitas Anda.",
        icon: <Send className="w-5 h-5 text-sky-400" />
    },
    {
        id: 3,
        title: "Dapatkan Komisi CPM",
        desc: "Setiap penonton yang membuka link Anda akan menambahkan saldo dolar secara instan ke dasbor Anda.",
        icon: <TrendingUp className="w-5 h-5 text-sky-400" />
    },
    {
        id: 4,
        title: "Cairkan Pendapatan",
        desc: "Tarik saldo Anda kapan saja secara cepat ke E-Wallet (DANA, OVO, GOPAY) atau Transfer Bank.",
        icon: <DollarSign className="w-5 h-5 text-sky-400" />
    }
];

const referralSteps = [
    {
        id: 1,
        title: "Undang Teman Bergabung",
        desc: "Bagikan link referral unik akun Anda kepada teman atau pengikut media sosial Anda.",
        icon: <Users className="w-5 h-5 text-indigo-400" />
    },
    {
        id: 2,
        title: "Bonus Pendaftaran",
        desc: "Setiap teman yang mendaftar melalui link Anda akan langsung memberi Anda bonus saldo referral.",
        icon: <Zap className="w-5 h-5 text-indigo-400" />
    },
    {
        id: 3,
        title: "Komisi Berkelanjutan",
        desc: "Dapatkan persentase komisi pasif dari setiap pendapatan sharelink yang dihasilkan referral Anda.",
        icon: <Award className="w-5 h-5 text-indigo-400" />
    },
    {
        id: 4,
        title: "Penarikan Tanpa Potongan",
        desc: "Kumpulkan komisi referral dan cairkan bersamaan dengan saldo sharelink utama Anda.",
        icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />
    }
];

export default function HowItWorks() {
    return (
        <section id="cara-kerja" className="w-full pt-8 pb-4 px-4 md:px-8 border-t border-white/[0.06] bg-transparent relative overflow-hidden">
            {/* Soft background glows */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1600px] mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-full text-xs font-bold text-slate-400 tracking-widest uppercase mb-4"
                    >
                        Panduan Pengguna
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight"
                    >
                        Cara <span className="font-serif italic font-medium text-sky-500">Kerja</span>
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-zinc-500 mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
                    >
                        Dua langkah mudah untuk menghasilkan uang dari membagikan video & mengundang teman di Cuanflix.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-8">
                    {/* Path 1: Share Link */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-white/[0.06] shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:border-sky-500/30 hover:shadow-xl transition-all duration-300 relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-[100px] group-hover:bg-sky-500/10 transition-colors duration-300 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-[10px] font-bold text-sky-400 uppercase tracking-widest border border-sky-500/20">
                                Fitur Utama
                            </span>
                            
                            <h3 className="text-xl sm:text-3xl font-extrabold text-foreground mt-4 mb-8">
                                Cuan dari Share Link
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {shareSteps.map((step) => {
                                    const isSmall = step.id > 2;
                                    return (
                                        <div 
                                            key={step.id} 
                                            className={`flex flex-col gap-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/30 hover:bg-sky-500/[0.04] transition-all duration-300 group/item relative overflow-hidden ${isSmall ? 'p-4' : 'p-5 sm:p-6'}`}
                                        >
                                            <div className={`rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground flex items-center justify-center shrink-0 group-hover/item:border-sky-500/30 group-hover/item:bg-sky-500/10 transition-all duration-300 shadow-sm ${isSmall ? 'w-9 h-9' : 'w-11 h-11'}`}>
                                                {step.icon}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className={`font-black text-foreground group-hover/item:text-sky-400 transition-colors leading-tight ${isSmall ? 'text-xs' : 'text-sm sm:text-base'}`}>
                                                    {step.id}. {step.title}
                                                </h4>
                                                <p className={`text-zinc-500 leading-relaxed font-light ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Path 2: Referral Member */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-white/[0.06] shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:border-indigo-500/30 hover:shadow-xl transition-all duration-300 relative group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] group-hover:bg-indigo-500/10 transition-colors duration-300 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                                Komisi Tambahan
                            </span>
                            
                            <h3 className="text-xl sm:text-3xl font-extrabold text-foreground mt-4 mb-8">
                                Cuan dari Undang Teman
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {referralSteps.map((step) => {
                                    const isSmall = step.id > 2;
                                    return (
                                        <div 
                                            key={step.id} 
                                            className={`flex flex-col gap-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-300 group/item relative overflow-hidden ${isSmall ? 'p-4' : 'p-5 sm:p-6'}`}
                                        >
                                            <div className={`rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground flex items-center justify-center shrink-0 group-hover/item:border-indigo-500/30 group-hover/item:bg-indigo-500/10 transition-all duration-300 shadow-sm ${isSmall ? 'w-9 h-9' : 'w-11 h-11'}`}>
                                                {step.icon}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className={`font-black text-foreground group-hover/item:text-indigo-400 transition-colors leading-tight ${isSmall ? 'text-xs' : 'text-sm sm:text-base'}`}>
                                                    {step.id}. {step.title}
                                                </h4>
                                                <p className={`text-zinc-500 leading-relaxed font-light ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
