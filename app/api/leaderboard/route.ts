import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Cache API for 10 minutes (Next.js app router revalidate)

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch top 15 earners (excluding admins and suspended users)
        // Note: isBot=true users can be included to populate the leaderboard,
        // but if the admin specifically wants to hide them, we can filter them.
        // Usually, ghost accounts are precisely FOR the leaderboard to look busy.
        // We will include them, as the user wants to see "real" revenue in admin, 
        // but the leaderboard needs to look active.
        const topUsers = await prisma.user.findMany({
            where: {
                role: "MEMBER",
                isSuspended: false,
                // If you want to hide bots: isBot: false 
                // We'll leave them here because "Fake/seeded member for leaderboard display only"
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                balanceWatch: true,
                balanceReferral: true,
                balanceBonus: true,
            }
        });

        // Calculate total balance and sort
        const sorted = topUsers.map(user => {
            const totalBalance = (user.balanceWatch || 0) + (user.balanceReferral || 0) + (user.balanceBonus || 0);
            return {
                id: user.id,
                name: censorName(user.name || user.email?.split('@')[0] || "Unknown"),
                image: user.image,
                totalBalance
            };
        })
        .sort((a, b) => b.totalBalance - a.totalBalance)
        .slice(0, 15); // Top 15

        return NextResponse.json(sorted);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function censorName(name: string) {
    if (!name) return "Ano*****m";
    if (name.length <= 3) return name + "*****";
    const start = name.substring(0, 3);
    const end = name.substring(name.length - 1);
    return `${start}*****${end}`;
}
