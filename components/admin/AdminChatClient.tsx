"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Trash2, Loader2, UserX } from "lucide-react";
import { useToast } from "../ToastContext";
import ConfirmModal from "../ConfirmModal";

export default function AdminChatClient() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
    const { showToast } = useToast();

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/chat");
            if (res.ok) setMessages(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/chat?id=${deleteTarget}`, { method: "DELETE" });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== deleteTarget));
                showToast("Message deleted successfully", "success");
            }
        } catch {
            showToast("Failed to delete message", "error");
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleConfirmBan = async () => {
        if (!banTarget) return;
        try {
            const res = await fetch("/api/admin/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: banTarget.id, action: "suspend" }),
            });
            if (res.ok) {
                showToast(`${banTarget.name} has been suspended`, "success");
            } else {
                showToast("Failed to suspend user", "error");
            }
        } catch {
            showToast("An error occurred", "error");
        } finally {
            setBanTarget(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-white">Chat Moderation</h2>
                <p className="text-sm text-zinc-500">Manage user messages across the platform.</p>
            </div>

            <div className="bg-[#111113] border border-zinc-800 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium text-white">All Messages</span>
                    </div>
                    <span className="text-xs text-zinc-500">{messages.length} messages</span>
                </div>

                {/* Message list */}
                <div className="flex flex-col divide-y divide-zinc-800/60 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-30">
                            <Loader2 className="w-7 h-7 animate-spin" />
                            <p className="text-sm text-zinc-500">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3 opacity-30">
                            <MessageSquare className="w-10 h-10 text-zinc-600" />
                            <p className="text-sm text-zinc-500">No messages yet.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between px-5 py-4 group hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 font-semibold text-xs shrink-0 mt-0.5">
                                        {msg.user?.name?.substring(0, 1)?.toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0 gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{msg.user?.name}</span>
                                            <span className="text-xs text-zinc-600">
                                                {new Date(msg.createdAt).toLocaleString("en-US", {
                                                    day: "numeric",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 leading-relaxed break-words">{msg.text}</p>
                                    </div>
                                </div>

                                {/* Actions — visible on hover */}
                                <div className="flex items-center gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                        onClick={() => setDeleteTarget(msg.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                                        title="Delete message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setBanTarget({ id: msg.user?.id, name: msg.user?.name })}
                                        className="p-2 rounded-lg hover:bg-orange-500/10 text-zinc-600 hover:text-orange-400 transition-colors"
                                        title="Suspend this user"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Confirm delete message */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Message?"
                message="This message will be permanently deleted and cannot be recovered."
            />

            {/* Confirm ban user */}
            <ConfirmModal
                isOpen={!!banTarget}
                onClose={() => setBanTarget(null)}
                onConfirm={handleConfirmBan}
                title={`Suspend ${banTarget?.name}?`}
                message="This user will be suspended and won't be able to login to the platform. You can revert this in the Members page."
                confirmText="Suspend"
            />
        </div>
    );
}
