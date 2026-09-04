import React from "react";
import AdminTeamManager from "@/components/admin/AdminTeamManager";

export const metadata = {
    title: "Tim Administrator - Cuanflix Admin",
    description: "Kelola tim dan akses administrator Cuanflix"
};

export default function AdminTeamPage() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminTeamManager />
        </div>
    );
}
