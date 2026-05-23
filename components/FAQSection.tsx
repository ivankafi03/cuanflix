"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        q: "Bagaimana cara mulai mendapatkan uang di Cuanflix?",
        a: "Sangat mudah! Anda cukup mendaftar akun gratis, masuk ke dasbor, pilih video yang ingin Anda bagikan, salin link-nya, dan sebarkan. Anda akan mendapatkan saldo otomatis setiap kali ada orang yang menonton video melalui link rujukan Anda."
    },
    {
        q: "Apakah menonton sendiri juga bisa mendapatkan komisi?",
        a: "Ya! Cuanflix mendukung sistem 'Self-Watch' di mana Anda bisa mengumpulkan saldo tambahan hanya dengan menonton video pilihan Anda sendiri selama minimal 60 detik per tayangan."
    },
    {
        q: "Berapa batas minimum penarikan saldo dan metode apa saja yang didukung?",
        a: "Batas minimum penarikan saldo sangat terjangkau, yaitu mulai dari $5.00 saja. Anda bisa mencairkan dana secara instan ke berbagai dompet digital populer (DANA, OVO, GOPAY) atau melalui Transfer Bank lokal."
    },
    {
        q: "Bagaimana sistem melacak dan menghitung komisi saya?",
        a: "Sistem kami menggunakan pelacakan alamat IP yang aman dan transparan. Setiap penonton unik yang menyaksikan video melalui tautan Anda selama minimal 60 detik akan dihitung sebagai kunjungan valid yang otomatis dikonversikan menjadi saldo USD di dasbor Anda."
    },
    {
        q: "Apakah aman membagikan link Cuanflix ke media sosial?",
        a: "Sangat aman. Seluruh tautan rujukan yang kami sediakan telah dioptimalkan agar ramah media sosial dan bebas dari skrip iklan eksternal berbahaya, sehingga aman disebarkan ke WhatsApp, Telegram, forum, atau sosmed lainnya."
    },
    {
        q: "Apakah ada batasan pembuatan akun di Cuanflix?",
        a: "Untuk menjaga keadilan sistem bagi semua member, kami membatasi satu akun per perangkat atau alamat IP. Penggunaan bot atau manipulasi ilegal untuk memanipulasi penayangan akan dideteksi oleh sistem anti-fraud kami dan dapat membekukan akun yang melanggar."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="w-full pt-8 pb-4 px-4 md:px-8 border-t border-white/[0.06] bg-transparent relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-full text-xs font-bold text-slate-400 tracking-widest uppercase mb-4"
                    >
                        Pusat Bantuan
                    </motion.div>
                    
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight"
                    >
                        Pertanyaan <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 font-serif italic font-medium">Umum</span>
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-zinc-500 mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
                    >
                        Segala hal yang perlu Anda ketahui tentang cara kerja, komisi, dan penarikan saldo di Cuanflix.
                    </motion.p>
                </div>

                <div className="border-t border-white/[0.06] mt-8">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        
                        return (
                            <div key={idx} className="border-b border-white/[0.06]">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    style={{ touchAction: "manipulation" }}
                                    className="w-full flex items-center justify-between py-5 sm:py-6 text-left group select-none active:opacity-75 transition-opacity"
                                    aria-expanded={isOpen}
                                >
                                    <span className={`text-base sm:text-lg md:text-xl font-semibold transition-colors duration-300 ${
                                        isOpen ? "text-sky-400" : "text-slate-200 group-hover:text-white"
                                    }`}>
                                        {faq.q}
                                    </span>
                                    <span
                                        className={`ml-4 flex-shrink-0 transition-transform duration-500 ${
                                            isOpen ? "rotate-[135deg] text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                                        }`}
                                    >
                                        <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            style={{ willChange: "height, opacity" }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-6 text-sm sm:text-base leading-relaxed text-slate-400 font-light pr-4 sm:pr-8">
                                                {faq.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
