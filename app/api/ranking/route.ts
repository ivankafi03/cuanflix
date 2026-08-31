import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

function censorName(name: string | null) {
    if (!name) return "Ano*****m";
    if (name.length <= 3) return name + "*****";
    const start = name.substring(0, 3);
    const end = name.substring(name.length - 1);
    return `${start}*****${end}`;
}

// Native Helpers for Date Filtering
const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getEndOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
};

// Seeded pseudo-random generator for consistent daily/weekly bot earnings
function pseudoRandom(seedStr: string): number {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get("period") || "alltime"; // daily, weekly, alltime
        const type = searchParams.get("type") || "total"; // total, watch, referral

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        // Calculate week number of year
        const startOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        
        const dateKey = period === "daily" 
            ? `${year}-${month}-${day}` 
            : period === "weekly" 
            ? `${year}-W${weekNum}` 
            : "alltime";

        const cacheKey = `ranking:${period}:${type}:${dateKey}`;

        const ranking = await withCache(
            cacheKey,
            async () => {
                let dateFilter: any = {};

                if (period === "daily") {
                    dateFilter.createdAt = {
                        gte: getStartOfDay(now),
                        lte: getEndOfDay(now)
                    };
                } else if (period === "weekly") {
                    dateFilter.createdAt = {
                        gte: getStartOfWeek(now)
                    };
                }

                if (type !== "total") {
                    dateFilter.type = type.toUpperCase();
                }

                // 1. Fetch all Ghost Bots
                const bots = await prisma.user.findMany({
                    where: { isBot: true },
                    select: { id: true, name: true, balanceWatch: true, balanceReferral: true, isBot: true }
                });

                // 2. Fetch real member aggregated earnings for period
                let memberEarnings: { userId: string; amount: number }[] = [];
                
                if (period === "alltime") {
                    const realMembers = await prisma.user.findMany({
                        where: { role: "MEMBER", isBot: false },
                        select: { id: true, name: true, balanceWatch: true, balanceReferral: true, isBot: true }
                    });
                    
                    memberEarnings = realMembers.map(m => ({
                        userId: m.id,
                        amount: m.balanceReferral + m.balanceWatch
                    }));
                } else {
                    const aggregated = await prisma.earningLog.groupBy({
                        by: ['userId'],
                        where: dateFilter,
                        _sum: { amount: true }
                    });
                    
                    memberEarnings = aggregated.map(a => ({
                        userId: a.userId,
                        amount: a._sum.amount || 0
                    }));
                }

                // Fetch real members details
                const realMemberIds = memberEarnings.map(m => m.userId);
                const realUsers = realMemberIds.length > 0 ? await prisma.user.findMany({
                    where: { id: { in: realMemberIds }, isBot: false },
                    select: { id: true, name: true, isBot: true }
                }) : [];

                const combinedList: { name: string; earning: number; isVerified: boolean; isBot: boolean }[] = [];

                // Add real members
                for (const me of memberEarnings) {
                    const user = realUsers.find(u => u.id === me.userId);
                    if (user && me.amount > 0) {
                        combinedList.push({
                            name: censorName(user.name),
                            earning: me.amount,
                            isVerified: true,
                            isBot: false
                        });
                    }
                }

                // Generate dynamic realistic earnings for Ghost Bots
                bots.forEach((bot, idx) => {
                    const randSeed = pseudoRandom(`${bot.id}:${dateKey}`);
                    let botEarning = 0;

                    if (period === "daily") {
                        // Daily bot earning: range $0.45 to $8.80 (Realistic daily sharelink earnings)
                        const baseEarning = 0.45 + (randSeed * 3.85);
                        const tierBoost = (idx % 5 === 0) ? 4.20 : (idx % 3 === 0) ? 2.10 : 0.50;
                        botEarning = baseEarning + (randSeed * tierBoost);
                    } else if (period === "weekly") {
                        // Weekly bot earning: range $2.50 to $38.50
                        const baseEarning = 2.50 + (randSeed * 18.50);
                        const tierBoost = (idx % 5 === 0) ? 16.50 : (idx % 3 === 0) ? 8.20 : 1.50;
                        botEarning = baseEarning + (randSeed * tierBoost);
                    } else {
                        // All-Time bot earning: range $8.50 to $125.00
                        const baseEarning = (bot.balanceReferral + bot.balanceWatch);
                        const calculated = baseEarning > 5 ? baseEarning : 8.50 + (randSeed * 115.00);
                        botEarning = calculated;
                    }

                    combinedList.push({
                        name: censorName(bot.name),
                        earning: parseFloat(botEarning.toFixed(2)),
                        isVerified: false,
                        isBot: true
                    });
                });

                // Sort by earnings descending
                combinedList.sort((a, b) => b.earning - a.earning);

                // Take top 20 and assign rank
                return combinedList.slice(0, 20).map((item, index) => ({
                    rank: index + 1,
                    name: item.name,
                    earning: item.earning,
                    isVerified: item.isVerified,
                    isBot: item.isBot
                }));
            },
            60 // Refresh cache every 60 seconds
        );

        return NextResponse.json(ranking);
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
