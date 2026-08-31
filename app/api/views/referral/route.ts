import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// In-memory rate limit: IP -> { count, resetAt }
const referralRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max 20 referral pings per minute per IP
const RATE_WINDOW_MS = 60_000;

// Anomaly threshold — more realistic for $1.50 CPM (max ~$0.075/day legit)
const REFERRAL_ANOMALY_THRESHOLD = 50;

// Fingerprint blacklist (in-memory, resets on restart)
const fingerprintBanSet = new Set<string>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = referralRateLimit.get(ip);

    if (!entry || now > entry.resetAt) {
        referralRateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
}

/**
 * Build a composite fingerprint from IP + UA + Accept-Language.
 * More resistant to simple User-Agent spoofing alone.
 */
function buildFingerprint(ip: string, ua: string, lang: string): string {
    return `${ip}|${ua.substring(0, 120)}|${lang.substring(0, 20)}`;
}

/**
 * Heuristic to score how likely a request is from a real browser.
 * Returns a score 0–100 where >= 50 is likely real.
 */
function computeHumanScore(ua: string, lang: string, referer: string, origin: string): number {
    let score = 0;

    // Has a meaningful User-Agent
    if (ua && ua.length > 40) score += 20;

    // Looks like a real browser UA
    if (/Mozilla\/5\.0/.test(ua)) score += 15;
    if (/Chrome\/|Firefox\/|Safari\//.test(ua)) score += 15;

    // Has Accept-Language header (bots often don't send this)
    if (lang && lang.length > 0) score += 20;

    // Has a Referer or Origin (suggests came from an actual page)
    if (referer && referer.length > 0) score += 15;
    if (origin && origin.length > 0) score += 15;

    return score;
}

export async function POST(req: Request) {
    try {
        const { videoId, referrerId } = await req.json();
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
        const userAgent = headerList.get("user-agent") || "";
        const acceptLang = headerList.get("accept-language") || "";
        const referer = headerList.get("referer") || "";
        const origin = headerList.get("origin") || "";

        // ── Layer 1: Rate limit by IP ──────────────────────────────────────
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        // ── Layer 2: Known bot User-Agent strings ──────────────────────────
        const isBotUA = !userAgent ||
            /bot|crawl|spider|headless|phantom|selenium|puppeteer|playwright|wget|curl|python-requests|axios|java\//i.test(userAgent);

        if (isBotUA) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // ── Layer 3: Composite Fingerprint check ───────────────────────────
        const fingerprint = buildFingerprint(ip, userAgent, acceptLang);
        if (fingerprintBanSet.has(fingerprint)) {
            // Silent drop — don't tell the bot it's banned
            return NextResponse.json({ success: true, rewarded: false });
        }

        // ── Layer 4: Human-score heuristic ─────────────────────────────────
        const humanScore = computeHumanScore(userAgent, acceptLang, referer, origin);
        if (humanScore < 35) {
            // Looks very sus — add fingerprint to ban set and silently drop
            fingerprintBanSet.add(fingerprint);
            console.warn(`[SECURITY] Low human score (${humanScore}) from IP ${ip}, UA: ${userAgent.substring(0, 80)}`);
            return NextResponse.json({ success: true, rewarded: false });
        }

        // ── Layer 5: Input validation ──────────────────────────────────────
        if (!videoId || !referrerId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // ── Layer 6: Find referrer user ────────────────────────────────────
        const user = await prisma.user.findFirst({
            where: { id: { startsWith: referrerId } },
            select: { id: true, isFlagged: true, isSuspended: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
        }

        // ── Layer 7: Skip flagged/suspended (silent) ───────────────────────
        if (user.isSuspended || user.isFlagged) {
            console.warn(`[SECURITY] Referral reward skipped for flagged/suspended user ${user.id} from IP ${ip}`);
            return NextResponse.json({ success: true, rewarded: false });
        }

        const actualReferrerId = user.id;

        // ── Layer 8: Anti self-referral ────────────────────────────────────
        const session = await getServerSession(authOptions) as any;
        if (session?.user?.id && session.user.id === actualReferrerId) {
            return NextResponse.json({ message: "Self-referral not allowed" });
        }

        // ── Layer 9: IP dedup per referrer+video (1 hour window) ───────────
        const recentView = await prisma.referralView.findFirst({
            where: {
                referrerId: actualReferrerId,
                videoId: videoId,
                ipAddress: ip,
                createdAt: { gt: new Date(Date.now() - 3600000) }
            }
        });

        if (recentView) {
            return NextResponse.json({ message: "View already registered recently" });
        }

        // ── Record the view ────────────────────────────────────────────────
        const newView = await prisma.referralView.create({
            data: {
                referrerId: actualReferrerId,
                videoId: videoId,
                ipAddress: ip,
                userAgent: userAgent.substring(0, 500),
            }
        });

        // ── Async geo-lookup (non-blocking) ───────────────────────────────
        if (ip && ip !== "unknown") {
            (async () => {
                try {
                    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
                        signal: AbortSignal.timeout(3000)
                    });
                    if (geoRes.ok) {
                        const geo = await geoRes.json();
                        if (geo.status === "success") {
                            await prisma.referralView.update({
                                where: { id: newView.id },
                                data: { country: geo.country, city: geo.city }
                            });
                        }
                    }
                } catch (e) {
                    // Geo lookup failed — non-critical
                }
            })();
        }

        // ── Reward: CPM + Skim Rate ────────────────────────────────────────
        const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
        const cpm = settings?.cpmRate || 1.50;
        const reward = cpm / 1000;
        const skimRate = settings?.skimRate || 0.20;
        const shouldReward = Math.random() > skimRate;

        if (shouldReward) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: actualReferrerId },
                    data: { balanceReferral: { increment: reward } }
                }),
                prisma.earningLog.create({
                    data: { userId: actualReferrerId, amount: reward, type: "REFERRAL" }
                })
            ]);
        }

        // ── Anomaly detection (non-blocking, threshold: 50/day) ───────────
        (async () => {
            try {
                const recentReferralCount = await prisma.earningLog.count({
                    where: {
                        userId: actualReferrerId,
                        type: "REFERRAL",
                        createdAt: { gt: new Date(Date.now() - 86400000) }
                    }
                });

                if (recentReferralCount > REFERRAL_ANOMALY_THRESHOLD) {
                    await prisma.user.updateMany({
                        where: { id: actualReferrerId, isFlagged: false },
                        data: {
                            isFlagged: true,
                            flagReason: `Referral anomaly: ${recentReferralCount} CPM rewards in 24h (threshold: ${REFERRAL_ANOMALY_THRESHOLD})`
                        }
                    });
                    // Also ban this fingerprint immediately
                    fingerprintBanSet.add(fingerprint);
                    console.warn(`[ANOMALY] User ${actualReferrerId} auto-flagged: ${recentReferralCount} rewards/24h. Fingerprint banned.`);
                }
            } catch (e) {
                console.error("[ANOMALY] Detection error:", e);
            }
        })();

        return NextResponse.json({ success: true, rewarded: shouldReward });
    } catch (error) {
        console.error("Error registering referral view:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
