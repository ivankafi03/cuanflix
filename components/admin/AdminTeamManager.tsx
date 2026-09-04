"use client";

import React, { useState, useEffect } from "react";
import { 
    UserPlus, 
    Mail, 
    Send, 
    Trash2, 
    Clock, 
    Shield, 
    Crown, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    User, 
    Lock,
    Users,
    Copy,
    Check
} from "lucide-react";
import { useToast } from "../ToastContext";

interface AdminUser {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
}

interface Invitation {
    id: string;
    email: string;
    token: string;
    createdAt: string;
    expiresAt: string;
}

export default function AdminTeamManager() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [superAdminEmail, setSuperAdminEmail] = useState("ivankafipradana@gmail.com");
    const [currentAdminEmail, setCurrentAdminEmail] = useState("");
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<"invite" | "direct">("invite");

    // Form invite state
    const [inviteEmail, setInviteEmail] = useState("");
    const [sendingInvite, setSendingInvite] = useState(false);

    // Form direct add state
    const [directName, setDirectName] = useState("");
    const [directEmail, setDirectEmail] = useState("");
    const [directPassword, setDirectPassword] = useState("");
    const [addingDirect, setAddingDirect] = useState(false);

    // Deleting state
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [latestInvite, setLatestInvite] = useState<{ email: string; link: string; emailSent: boolean } | null>(null);

    const { showToast } = useToast();

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedToken(id);
        showToast("Link undangan berhasil disalin!", "success");
        setTimeout(() => setCopiedToken(null), 3000);
    };

    const fetchTeam = async () => {
        try {
            const res = await fetch("/api/admin/team");
            if (res.ok) {
                const data = await res.json();
                setAdmins(data.admins || []);
                setInvitations(data.invitations || []);
                if (data.superAdminEmail) setSuperAdminEmail(data.superAdminEmail);
                if (data.currentAdminEmail) setCurrentAdminEmail(data.currentAdminEmail);
            }
        } catch {
            showToast("Gagal memuat daftar admin.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setSendingInvite(true);
        try {
            const res = await fetch("/api/admin/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "invite",
                    email: inviteEmail
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(data.message, "success");
                if (data.inviteLink) {
                    setLatestInvite({
                        email: inviteEmail,
                        link: data.inviteLink,
                        emailSent: data.emailSent
                    });
                }
                setInviteEmail("");
                fetchTeam();
            } else {
                showToast(data.error || "Gagal mengirim undangan.", "error");
            }
        } catch {
            showToast("Kesalahan jaringan saat mengirim undangan.", "error");
        } finally {
            setSendingInvite(false);
        }
    };

    const handleAddDirect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!directName || !directEmail || !directPassword) return;

        setAddingDirect(true);
        try {
            const res = await fetch("/api/admin/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "direct",
                    name: directName,
                    email: directEmail,
                    password: directPassword
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(data.message, "success");
                setDirectName("");
                setDirectEmail("");
                setDirectPassword("");
                fetchTeam();
            } else {
                showToast(data.error || "Gagal menambahkan admin.", "error");
            }
        } catch {
            showToast("Kesalahan jaringan.", "error");
        } finally {
            setAddingDirect(false);
        }
    };

    const handleRevokeInvite = async (id: string, email: string) => {
        if (!confirm(`Batalkan undangan untuk ${email}?`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/team?type=invitation&id=${id}`, {
                method: "DELETE"
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(data.message, "info");
                setInvitations(prev => prev.filter(inv => inv.id !== id));
            } else {
                showToast(data.error || "Gagal membatalkan undangan.", "error");
            }
        } catch {
            showToast("Kesalahan jaringan.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteAdmin = async (id: string, email: string) => {
        if (email.toLowerCase() === superAdminEmail.toLowerCase()) {
            showToast("Super Admin tidak dapat dihapus!", "error");
            return;
        }

        if (!confirm(`Hapus akses administrator untuk ${email}? User ini tidak akan bisa mengakses panel admin lagi.`)) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/team?type=admin&id=${id}`, {
                method: "DELETE"
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(data.message, "success");
                setAdmins(prev => prev.filter(a => a.id !== id));
            } else {
                showToast(data.error || "Gagal menghapus admin.", "error");
            }
        } catch {
            showToast("Kesalahan jaringan.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-primary" /> Tim Administrator
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                        Undang dan kelola anggota tim admin Cuanflix. Super Admin memiliki hak permanen dan tidak dapat dikeluarkan.
                    </p>
                </div>
            </div>

            {/* Tambah / Undang Admin Panel */}
            <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-5">
                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab("invite")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "invite"
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                        }`}
                    >
                        <Mail className="w-3.5 h-3.5" /> Undang via Email (Direkomendasikan)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("direct")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "direct"
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                        }`}
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Tambah Langsung (Instan)
                    </button>
                </div>

                {activeTab === "invite" ? (
                    <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Masukkan email Gmail admin baru..."
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sendingInvite}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer shrink-0"
                        >
                            {sendingInvite ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" /> Kirim Undangan
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAddDirect} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="relative">
                            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={directName}
                                onChange={(e) => setDirectName(e.target.value)}
                                placeholder="Nama Lengkap..."
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={directEmail}
                                onChange={(e) => setDirectEmail(e.target.value)}
                                placeholder="Email Admin..."
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    required
                                    value={directPassword}
                                    onChange={(e) => setDirectPassword(e.target.value)}
                                    placeholder="Password (min 8)..."
                                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-zinc-600 focus:outline-none transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={addingDirect}
                                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer shrink-0"
                            >
                                {addingDirect ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah"}
                            </button>
                        </div>
                    </form>
                )}

                {latestInvite && (
                    <div className="mt-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Undangan untuk {latestInvite.email} siap!</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">Berlaku 24 jam</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={latestInvite.link}
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-zinc-300 font-mono focus:outline-none select-all"
                            />
                            <button
                                type="button"
                                onClick={() => copyToClipboard(latestInvite.link, "latest")}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            >
                                {copiedToken === "latest" ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin Link</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                            {latestInvite.emailSent 
                                ? "Email notifikasi juga telah dikirim ke penerima." 
                                : "Bisa langsung salin dan kirim link di atas via WhatsApp / Chat ke calon admin."}
                        </p>
                    </div>
                )}

                <p className="text-[11px] text-zinc-500">
                    Undangan via email otomatis membuat link aman yang berlaku selama 24 jam untuk mendaftarkan akun administrator.
                </p>
            </div>

            {/* List Undangan Pending */}
            {invitations.length > 0 && (
                <div className="bg-[#0f0f12] border border-amber-500/20 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: "4s" }} />
                        <span>Undangan Pending ({invitations.length})</span>
                    </div>

                    <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden">
                        {invitations.map((inv) => {
                            const inviteUrl = typeof window !== "undefined"
                                ? `${window.location.origin}/admin/accept-invitation?token=${inv.token}`
                                : `/admin/accept-invitation?token=${inv.token}`;

                            return (
                                <div key={inv.id} className="p-3.5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-bold text-white">{inv.email}</span>
                                        <span className="text-[10px] text-zinc-500">
                                            Dikirim: {new Date(inv.createdAt).toLocaleString("id-ID")} • Berlaku s/d: {new Date(inv.expiresAt).toLocaleTimeString("id-ID")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(inviteUrl, inv.id)}
                                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                            title="Salin Link Undangan"
                                        >
                                            {copiedToken === inv.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400">Tersalin</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>Salin Link</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRevokeInvite(inv.id, inv.email)}
                                            disabled={deletingId === inv.id}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                            title="Tarik / Batalkan Undangan"
                                        >
                                            {deletingId === inv.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List Administrator Aktif */}
            <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Daftar Administrator Aktif ({admins.length})</span>
                </h4>

                {loading ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden">
                        {admins.map((adm) => {
                            const isSuperAdmin = (adm.email || "").toLowerCase() === superAdminEmail.toLowerCase();
                            const isSelf = (adm.email || "").toLowerCase() === currentAdminEmail.toLowerCase();

                            return (
                                <div key={adm.id} className="p-4 bg-black/20 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                                            isSuperAdmin 
                                                ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/10" 
                                                : "bg-primary/10 border border-primary/20 text-primary"
                                        }`}>
                                            {isSuperAdmin ? <Crown className="w-4 h-4" /> : (adm.name?.[0] || "A")}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-white">{adm.name || "Administrator"}</span>
                                                {isSuperAdmin && (
                                                    <span className="px-2 py-0.5 text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                                                        <Crown className="w-2.5 h-2.5" /> Super Admin
                                                    </span>
                                                )}
                                                {isSelf && !isSuperAdmin && (
                                                    <span className="px-2 py-0.5 text-[9px] bg-white/10 text-zinc-300 font-bold rounded-md">
                                                        Anda
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-zinc-400">{adm.email}</span>
                                        </div>
                                    </div>

                                    {/* Action: Super Admin & Self CANNOT be deleted */}
                                    <div>
                                        {isSuperAdmin ? (
                                            <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider px-2 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10">
                                                Akses Permanen
                                            </span>
                                        ) : isSelf ? (
                                            <span className="text-[10px] text-zinc-500 font-medium italic">
                                                Akun Anda
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteAdmin(adm.id, adm.email || "")}
                                                disabled={deletingId === adm.id}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                                title="Hapus Akses Administrator"
                                            >
                                                {deletingId === adm.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-3.5 h-3.5" /> Hapus Akses
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
