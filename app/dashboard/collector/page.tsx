import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import LinkCollectorClient from "@/components/dashboard/LinkCollectorClient";

export const metadata = {
    title: "Koleksi Link | Cuanflix Dashboard",
    description: "Cari, kumpulkan, dan bagikan link video Cuanflix.",
};

export default async function CollectorPage() {
    const session = await getServerSession(authOptions) as any;
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) redirect("/login");

    return <LinkCollectorClient user={user} />;
}
