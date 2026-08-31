"use client";

import React, { useState, useEffect } from "react";

export default function AgeGateModal() {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const isVerified = localStorage.getItem("cuanflix_age_verified");
        if (isVerified !== "true") {
            setShowModal(true);
        }
    }, []);

    const handleConfirm = () => {
        localStorage.setItem("cuanflix_age_verified", "true");
        setShowModal(false);
    };

    const handleReject = () => {
        window.location.href = "https://www.google.com";
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
            <div className="bg-[#0f0f12] border border-white/10 rounded-2xl max-w-sm w-full p-6 md:p-8 text-center shadow-2xl flex flex-col items-center gap-5">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                        Konfirmasi Usia
                    </h2>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                        Website ini berisi konten khusus dewasa. Apakah Anda berusia 18 tahun atau lebih?
                    </p>
                </div>

                <div className="flex flex-col gap-2.5 w-full pt-2">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
                    >
                        Ya, Saya 18+
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleReject}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all active:scale-95 cursor-pointer"
                    >
                        Tidak (Keluar)
                    </button>
                </div>
            </div>
        </div>
    );
}
