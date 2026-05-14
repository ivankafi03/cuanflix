import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CariLinkClient from "@/components/dashboard/CariLinkClient";

export const metadata = {
    title: "Cari Link | Cuanflix Dashboard",
    description: "Cari video dan tambahkan ke koleksi linkmu.",
};

export default async function CariLinkPage() {
    const session = await getServerSession(authOptions) as any;
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) redirect("/login");

    return <CariLinkClient user={user} />;
}
