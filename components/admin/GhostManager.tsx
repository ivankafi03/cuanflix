"use client";

import React, { useState, useEffect } from "react";
import { Users, Play, Loader2, RefreshCw, Trash2, ShieldCheck, Ghost } from "lucide-react";
import { useToast } from "../ToastContext";

export default function GhostManager() {
    const [ghosts, setGhosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const { showToast } = useToast();

    const fetchGhosts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/ghosts");
            if (res.ok) {
                const data = await res.json();
                setGhosts(data);
            }
        } catch (e) {
            showToast("Failed to fetch ghosts", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGhosts();
    }, []);

    const createGhosts = async (count: number) => {
        setCreating(true);
        try {
            const res = await fetch("/api/admin/ghosts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count })
            });
            if (res.ok) {
                showToast(`Created ${count} ghost members`, "success");
                fetchGhosts();
            }
        } catch (e) {
            showToast("Failed to create ghosts", "error");
        } finally {
            setCreating(false);
        }
    };

    const simulateActivity = async () => {
        setSimulating(true);
        try {
            const res = await fetch("/api/admin/ghosts/simulate", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                showToast(`Simulated activity for ${data.updatedCount} ghosts`, "success");
                fetchGhosts();
            }
        } catch (e) {
            showToast("Simulation failed", "error");
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Ghost className="w-8 h-8 text-purple-400" />
                        Ghost <span className="text-primary">Network</span>
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium">Manage seeded members and simulate organic activity.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={simulateActivity}
                        disabled={simulating || ghosts.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/20 transition-all font-bold text-sm"
                    >
                        {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Simulate Activity
                    </button>
                    <button
                        onClick={() => createGhosts(10)}
                        disabled={creating}
                        className="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl border border-primary/20 transition-all font-bold text-sm"
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Deploy 10 Ghosts
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0F0F11] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Ghost Population</span>
                    <span className="text-4xl font-bold text-white tracking-tighter">{ghosts.length}</span>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Ghost Balance</span>
                    <span className="text-4xl font-bold text-purple-400 tracking-tighter">
                        ${ghosts.reduce((acc, curr) => acc + (curr.balanceWatch || 0), 0).toFixed(2)}
                    </span>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Network Integrity</span>
                    <span className="text-4xl font-bold text-green-400 tracking-tighter">SECURE</span>
                </div>
            </div>

            <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-batik-modern opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-all" />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Ghost Member</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Email Endpoint</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-right">Watch Balance</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" />
                                    </td>
                                </tr>
                            ) : ghosts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-600 font-bold">
                                        No ghost members deployed. Start by deploying a squad.
                                    </td>
                                </tr>
                            ) : (
                                ghosts.map((ghost) => (
                                    <tr key={ghost.id} className="group/row hover:bg-white/[0.02] transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                                    {ghost.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-white">{ghost.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-mono text-zinc-500">{ghost.email}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-sm font-bold text-purple-400">${ghost.balanceWatch.toFixed(4)}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/10">
                                                <ShieldCheck className="w-3 h-3" />
                                                Active
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
