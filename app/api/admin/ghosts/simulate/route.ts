import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST() {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Pick 10 random bots to update
        const bots = await prisma.user.findMany({
            where: { isBot: true },
        });

        if (bots.length === 0) {
            return NextResponse.json({ message: "No bots found to simulate" });
        }

        // Pick a subset of bots (e.g., 30% of bots)
        const botsToUpdate = bots
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.ceil(bots.length * 0.3));

        const results = [];

        for (const bot of botsToUpdate) {
            // Random increment between $0.05 and $0.25
            const increment = Math.random() * 0.20 + 0.05;
            
            let newBalance = bot.balanceWatch + increment;
            let reset = false;

            // If hits $50, "withdraw" and reset
            if (newBalance >= 50) {
                newBalance = Math.random() * 5; // Reset to a small random amount
                reset = true;
            }

            const updated = await prisma.$transaction([
                prisma.user.update({
                    where: { id: bot.id },
                    data: {
                        balanceWatch: newBalance
                    }
                }),
                prisma.earningLog.create({
                    data: {
                        userId: bot.id,
                        amount: increment,
                        type: "WATCH"
                    }
                })
            ]);

            results.push({
                name: bot.name,
                increment: increment.toFixed(4),
                newBalance: newBalance.toFixed(4),
                reset
            });
        }

        return NextResponse.json({ success: true, updatedCount: results.length, details: results });
    } catch (error) {
        console.error("Simulation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
