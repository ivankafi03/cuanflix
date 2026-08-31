import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OverviewClient from "@/components/dashboard/OverviewClient";
import { redirect } from "next/navigation";

import { searchXNXX } from "@/lib/xnxx";

export default async function OverviewPage() {
    const session = await getServerSession(authOptions) as any;
    
    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            balanceWatch: true,
            balanceReferral: true,
            balanceBonus: true,
            registrationBonusClaimed: true,
        }
    });

    let videos: any[] = [];
    try {
        const xnxxResult = await searchXNXX("indonesian", 1);
        videos = xnxxResult.videos.slice(0, 9).map((v: any, idx: number) => ({
            id: idx + 1,
            title: v.title,
            image: v.image,
            href: `/watch/${v.href || v.link}`,
            duration: v.episode || 'HD'
        }));
    } catch (e) {
        console.error("Dashboard video fetch error:", e);
    }

    return <OverviewClient user={user} videos={videos} />;
}
