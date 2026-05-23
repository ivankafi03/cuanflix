import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import WatchClient from "@/components/dashboard/WatchClient";
import { redirect } from "next/navigation";

export default async function WatchPage() {
    const session = await getServerSession(authOptions) as any;
    
    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            balanceWatch: true,
            name: true
        }
    });

    return <WatchClient user={user} />;
}
