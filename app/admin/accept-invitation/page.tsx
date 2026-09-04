"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

function AcceptInvitationForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [tokenError, setTokenError] = useState("");

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setValidating(false);
            setTokenError("Token undangan tidak ditemukan.");
            return;
        }

        const checkToken = async () => {
            try {
                const res = await fetch(`/api/admin/accept-invitation?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                if (res.ok && data.valid) {
                    setTokenValid(true);
                    setInviteEmail(data.email);
                } else {
                    setTokenError(data.error || "Undangan tidak valid atau sudah kedaluwarsa.");
                }
            } catch {
                setTokenError("Gagal memverifikasi token. Periksa koneksi Anda.");
            } finally {
                setValidating(false);
            }
        };

        checkToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (password.length < 8) {
            setSubmitError("Password minimal 8 karakter.");
            return;
        }

        if (password !== confirmPassword) {
            setSubmitError("Konfirmasi password tidak cocok.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/accept-invitation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    name,
                    password
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitSuccess(true);
            } else {
                setSubmitError(data.error || "Gagal mengaktifkan akun.");
            }
        } catch {
            setSubmitError("Terjadi kesalahan jaringan.");
        } finally {
            setSubmitting(false);
        }
    };

    if (validating) {
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-zinc-400 text-sm">Memverifikasi tautan undangan...</p>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Undangan Tidak Valid</h2>
                    <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed max-w-xs">
                        {tokenError || "Tautan undangan tidak berlaku atau masa berlakunya (24 jam) telah habis."}
                    </p>
                </div>
                <Link
                    href="/auth/login"
                    className="mt-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all"
                >
                    Kembali ke Login
                </Link>
            </div>
        );
    }

    if (submitSuccess) {
        return (
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Selamat Datang di Tim Admin!</h2>
                    <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed max-w-xs">
                        Akun administrator untuk <strong>{inviteEmail}</strong> telah berhasil diaktifkan.
                    </p>
                </div>
                <Link
                    href="/auth/login"
                    className="mt-3 w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    Masuk ke Dashboard Admin <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider text-primary mx-auto">
                    <Shield className="w-3 h-3" /> Undangan Administrator
                </div>
                <h2 className="text-xl font-bold text-white">Aktifkan Akses Admin</h2>
                <p className="text-zinc-400 text-xs">
                    Email: <span className="text-white font-semibold">{inviteEmail}</span>
                </p>
            </div>

            {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-400">Nama Lengkap</label>
                    <div className="relative">
                        <User className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Admin Budi"
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-400">Password Baru</label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-400">Konfirmasi Password</label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password"
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aktifkan Akun Admin"}
                </button>
            </form>
        </div>
    );
}

export default function AcceptInvitationPage() {
    return (
        <div className="min-h-screen bg-[#0c0c0e] flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm flex flex-col items-center gap-6">
                <Logo size="lg" showText={false} />
                <div className="w-full bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <Suspense fallback={
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    }>
                        <AcceptInvitationForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
