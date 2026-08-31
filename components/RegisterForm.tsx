"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Loader2, AlertCircle, Play } from "lucide-react";
import Link from "next/link";
import { useToast } from "./ToastContext";
import Turnstile from "./Turnstile";
import { getBrowserFingerprint } from "@/lib/security";
import Logo from "./Logo";

export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const [referrerId, setReferrerId] = useState<string | null>(null);
    const { showToast } = useToast();

    // Check URL first, then fallback to localStorage
    React.useEffect(() => {
        const urlRef = searchParams.get("ref");
        if (urlRef) {
            setReferrerId(urlRef);
        } else {
            const savedRef = localStorage.getItem("cuan_referrer");
            if (savedRef) setReferrerId(savedRef);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const fingerprint = getBrowserFingerprint();
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    referrerId,
                    turnstileToken,
                    fingerprint
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            showToast("Account created successfully! Please login.", "success");
            router.push("/auth/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <Logo size="lg" showText={false} />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-zinc-500 text-sm mt-1">Start earning from your video views</p>
                    </div>
                </div>

                {referrerId && (
                    <div className="mb-5 p-3.5 bg-primary/8 border border-primary/20 rounded-xl text-sm text-primary/80">
                        You're invited via a referral link — both you and your inviter will receive a registration bonus.
                    </div>
                )}

                {error && (
                    <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] mb-5"
                >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                    </svg>
                    <span>Daftar / Masuk dengan Google</span>
                </button>

                <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-zinc-800 w-full"></div>
                    <span className="bg-[#0c0c0e] px-3 text-xs text-zinc-500 font-medium absolute">atau via Email</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADOBI3uPCTN-hz2I"}
                        onVerify={(token) => setTurnstileToken(token)}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-zinc-300 hover:text-white font-medium transition-colors">
                        Login here
                    </Link>
                </p>

                <p className="mt-4 text-center text-zinc-600 text-xs leading-relaxed">
                    By registering, you agree to Cuanflix's terms of service and privacy policy.
                </p>
            </div>
        </div>
    );
}
