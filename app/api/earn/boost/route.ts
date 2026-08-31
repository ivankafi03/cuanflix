import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * HONEYPOT ENDPOINT
 * 
 * This endpoint looks tempting to bots (earn/boost, earn/bonus, etc.)
 * but is NEVER called by legitimate frontend code.
 * 
 * Any request to this endpoint is 100% automated / malicious.
 * We silently auto-flag the associated member if referrerId is provided,
 * and log the IP for monitoring.
 */
export async function POST(req: Request) {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
        const userAgent = headerList.get("user-agent") || "unknown";

        let referrerId: string | undefined;
        let body: any = {};
        try {
            body = await req.json();
            referrerId = body.referrerId || body.userId || body.ref || body.id;
        } catch {}

        console.warn(`[HONEYPOT] Hit from IP: ${ip}, UA: ${userAgent.substring(0, 100)}, Body: ${JSON.stringify(body).substring(0, 200)}`);

        // If they provided a referrerId, auto-flag that member account immediately
        if (referrerId && typeof referrerId === "string" && referrerId.length >= 4) {
            try {
                const result = await prisma.user.updateMany({
                    where: {
                        id: { startsWith: referrerId },
                        isFlagged: false
                    },
                    data: {
                        isFlagged: true,
                        flagReason: `[HONEYPOT] Automated request detected from IP ${ip}. Account auto-flagged.`
                    }
                });

                if (result.count > 0) {
                    console.warn(`[HONEYPOT] Auto-flagged ${result.count} user(s) matching ref: ${referrerId} from IP ${ip}`);
                }
            } catch (e) {
                console.error("[HONEYPOT] DB flag error:", e);
            }
        }

        // Return a convincing fake success response so bots don't realize they're caught
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
        return NextResponse.json({ success: true, rewarded: true, amount: 0.0015 });

    } catch (e) {
        return NextResponse.json({ success: true });
    }
}

// Also handle GET so bots probing the endpoint get caught too
export async function GET(req: Request) {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    console.warn(`[HONEYPOT GET] Probe from IP: ${ip}`);
    return NextResponse.json({ status: "ok" });
}
