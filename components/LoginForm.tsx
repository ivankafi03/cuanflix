"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, Play, AlertCircle } from "lucide-react";
import Link from "next/link";
import Turnstile from "./Turnstile";
import Logo from "./Logo";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuspended, setIsSuspended] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const err = searchParams.get("error");
        if (err === "SUSPENDED") {
            setIsSuspended(true);
        } else if (err === "SessionExpired") {
            setIsSessionExpired(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!turnstileToken) {
            setError("Please complete the CAPTCHA verification.");
            setLoading(false);
            return;
        }

        try {
            const res = await signIn("credentials", {
                email,
                password,
                turnstileToken,
                redirect: false,
            });

            if (res?.error) {
                if (res.error === "SUSPENDED" || res.error?.includes("SUSPENDED")) {
                    setIsSuspended(true);
                    setError("");
                } else {
                    setError("Invalid email or password. Try again.");
                }
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <Logo size="lg" showText={false} />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Login to Account</h1>
                        <p className="text-zinc-500 text-sm mt-1">Manage your videos and balance</p>
                    </div>
                </div>

                {/* Alerts */}
                {isSuspended && (
                    <div className="mb-5 p-4 bg-orange-500/8 border border-orange-500/20 rounded-xl">
                        <p className="text-orange-400 text-sm font-medium">Account Suspended</p>
                        <p className="text-orange-400/70 text-xs mt-1 leading-relaxed">
                            Your account has been suspended by admin. Contact support if you believe this is a mistake.
                        </p>
                    </div>
                )}

                {isSessionExpired && (
                    <div className="mb-5 p-4 bg-primary/8 border border-primary/20 rounded-xl">
                        <p className="text-primary text-sm font-medium">Session Expired</p>
                        <p className="text-primary/70 text-xs mt-1 leading-relaxed">
                            Please login again with the new password sent to your email.
                        </p>
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
                    <span>Masuk dengan Google</span>
                </button>

                <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-zinc-800 w-full"></div>
                    <span className="bg-[#0c0c0e] px-3 text-xs text-zinc-500 font-medium absolute">atau via Email</span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADOBI3uPCTN-hz2I"}
                        onVerify={(token) => setTurnstileToken(token)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-zinc-500 text-sm">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="text-zinc-300 hover:text-white font-medium transition-colors">
                        Register for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
