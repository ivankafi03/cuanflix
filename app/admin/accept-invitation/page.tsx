"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Lock, Loader2, CheckCircle2, AlertCircle, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { signIn } from "next-auth/react";

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

    const [showCustomForm, setShowCustomForm] = useState(false);
    const [rejected, setRejected] = useState(false);

    const handleAcceptQuick = async () => {
        setSubmitting(true);
        setSubmitError("");
        try {
            const res = await signIn("credentials", {
                adminToken: token,
                redirect: false,
                callbackUrl: "/admin"
            });

            if (res?.ok) {
                setSubmitSuccess(true);
                window.location.href = "/admin";
            } else {
                setSubmitError("Gagal mengaktifkan akun admin. Tautan mungkin sudah kedaluwarsa.");
            }
        } catch {
            setSubmitError("Terjadi kesalahan jaringan.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Apakah Anda yakin ingin menolak undangan administrator ini?")) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/accept-invitation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    action: "reject"
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setRejected(true);
            } else {
                setSubmitError(data.error || "Gagal menolak undangan.");
            }
        } catch {
            setSubmitError("Terjadi kesalahan jaringan.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitCustom = async (e: React.FormEvent) => {
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
                    action: "accept",
                    name,
                    password
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitSuccess(true);
                await signIn("credentials", {
                    email: inviteEmail,
                    password: password,
                    redirect: false,
                    callbackUrl: "/admin"
                });
                window.location.href = "/admin";
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

    if (rejected) {
        return (
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 text-zinc-400 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Undangan Ditolak</h2>
                    <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed max-w-xs">
                        Anda telah menolak undangan administrator ini. Tautan telah dinonaktifkan.
                    </p>
                </div>
                <Link
                    href="/"
                    className="mt-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all"
                >
                    Kembali ke Beranda
                </Link>
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
                        Akun administrator untuk <strong>{inviteEmail}</strong> telah aktif. Silakan masuk untuk mengakses panel admin.
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="mt-3 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                    Buka Panel Admin <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col gap-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400 mx-auto">
                    <Shield className="w-3 h-3" /> Undangan Administrator
                </div>
                <h2 className="text-xl font-bold text-white">Tawaran Akses Admin</h2>
                <p className="text-zinc-400 text-xs">
                    Akun: <span className="text-white font-semibold">{inviteEmail}</span>
                </p>
            </div>

            <p className="text-xs text-zinc-300 text-center leading-relaxed bg-white/[0.03] border border-white/5 p-3.5 rounded-xl">
                Anda diundang oleh Super Admin untuk bergabung mengelola platform Cuanflix. Apakah Anda setuju menjadi Administrator?
            </p>

            {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Quick 1-Click Action Buttons */}
            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    onClick={handleAcceptQuick}
                    disabled={submitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
                >
                    {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" /> OK, Setuju Jadi Admin
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleReject}
                    disabled={submitting}
                    className="w-full py-2.5 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                    Tolak Undangan
                </button>
            </div>

            {/* Optional Custom Password Accordion */}
            <div className="pt-2 border-t border-white/5 text-center">
                <button
                    type="button"
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer underline underline-offset-4"
                >
                    {showCustomForm ? "Tutup formulir nama & sandi manual" : "Atur nama atau buat password manual (opsional)"}
                </button>

                {showCustomForm && (
                    <form onSubmit={handleSubmitCustom} className="flex flex-col gap-3 text-left mt-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-400">Nama Lengkap</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Admin Baru"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-400">Password Baru</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-400">Ulangi Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Konfirmasi password"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2 px-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                            Simpan & Jadi Admin
                        </button>
                    </form>
                )}
            </div>
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
