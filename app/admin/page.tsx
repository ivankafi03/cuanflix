import React from "react";
import prisma from "@/lib/prisma";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

export default async function AdminOverviewPage() {
    const [memberCount, settings] = await Promise.all([
        prisma.user.count({ where: { role: 'MEMBER' } }),
        prisma.systemSettings.findUnique({ where: { id: "global" } })
    ]);
    
    return <AdminOverviewClient initialData={{ 
        memberCount, 
        vpsExpiryDate: settings?.vpsExpiryDate 
    }} />;
}
