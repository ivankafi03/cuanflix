import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getLast7Days(): { date: string; label: string }[] {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            date: d.toISOString().split("T")[0],
            label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" })
        });
    }
    return days;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const days = getLast7Days();
        const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // ─── Parallel fetch all raw data ──────────────────────────────
        const [
            earningLogs,
            selfViews,
            referralViews,
            allReferralViews,
            topReferralVideos,
        ] = await Promise.all([
            // Earning logs last 7 days
            prisma.earningLog.findMany({
                where: { userId, createdAt: { gte: since7Days } },
                select: { amount: true, type: true, createdAt: true }
            }),
            // Self views last 7 days
            prisma.selfView.findMany({
                where: { userId, createdAt: { gte: since7Days } },
                select: { createdAt: true, duration: true }
            }),
            // Referral views last 7 days
            prisma.referralView.findMany({
                where: { referrerId: userId, createdAt: { gte: since7Days } },
                select: { createdAt: true, country: true, videoId: true }
            }),
            // All time referral views for country breakdown
            prisma.referralView.findMany({
                where: { referrerId: userId },
                select: { country: true }
            }),
            // Top videos by referral view count
            prisma.referralView.groupBy({
                by: ["videoId"],
                where: { referrerId: userId },
                _count: { videoId: true },
                orderBy: { _count: { videoId: "desc" } },
                take: 5
            })
        ]);

        // ─── Build 7-day earning chart ────────────────────────────────
        const earningChart = days.map(({ date, label }) => {
            const dayLogs = earningLogs.filter(l =>
                l.createdAt.toISOString().startsWith(date)
            );
            return {
                date,
                label,
                watch: Number(dayLogs.filter(l => l.type === "WATCH").reduce((s, l) => s + l.amount, 0).toFixed(4)),
                referral: Number(dayLogs.filter(l => l.type === "REFERRAL").reduce((s, l) => s + l.amount, 0).toFixed(4)),
                total: Number(dayLogs.reduce((s, l) => s + l.amount, 0).toFixed(4)),
            };
        });

        // ─── Build 7-day views chart ──────────────────────────────────
        const viewChart = days.map(({ date, label }) => {
            const selfCount = selfViews.filter(v =>
                v.createdAt.toISOString().startsWith(date)
            ).length;
            const refCount = referralViews.filter(v =>
                v.createdAt.toISOString().startsWith(date)
            ).length;
            return { date, label, self: selfCount, referral: refCount, total: selfCount + refCount };
        });

        // ─── Country breakdown (all-time) ─────────────────────────────
        const countryCount: Record<string, number> = {};
        for (const v of allReferralViews) {
            const c = v.country || "Unknown";
            countryCount[c] = (countryCount[c] || 0) + 1;
        }
        const totalCountryViews = Object.values(countryCount).reduce((s, n) => s + n, 0);
        const countryBreakdown = Object.entries(countryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([country, count]) => ({
                country,
                count,
                percent: totalCountryViews > 0 ? Math.round((count / totalCountryViews) * 100) : 0
            }));

        // ─── Top videos ───────────────────────────────────────────────
        const topVideos = topReferralVideos.map(v => ({
            videoId: v.videoId,
            views: v._count.videoId
        }));

        // ─── Summary stats ────────────────────────────────────────────
        const totalWatchEarnings = earningLogs
            .filter(l => l.type === "WATCH")
            .reduce((s, l) => s + l.amount, 0);
        const totalReferralEarnings = earningLogs
            .filter(l => l.type === "REFERRAL")
            .reduce((s, l) => s + l.amount, 0);

        return NextResponse.json({
            earningChart,
            viewChart,
            countryBreakdown,
            topVideos,
            summary: {
                totalSelfViews7d: selfViews.length,
                totalReferralViews7d: referralViews.length,
                totalWatchEarnings7d: Number(totalWatchEarnings.toFixed(4)),
                totalReferralEarnings7d: Number(totalReferralEarnings.toFixed(4)),
                avgWatchDuration: selfViews.length > 0
                    ? Math.round(selfViews.reduce((s, v) => s + v.duration, 0) / selfViews.length)
                    : 0
            }
        });

    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
