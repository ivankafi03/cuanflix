import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const RESERVED_SLUGS = new Set([
    "admin", "api", "auth", "dashboard", "watch", "categories", 
    "indo", "jav", "leaderboard", "download", "go", "blocked", 
    "search", "terms", "privacy", "maintenance", "watchlist", 
    "sitemap.xml", "robots.txt", "embed-player"
]);

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rawLinks = await prisma.contentCache.findMany({
            where: { key: { startsWith: "vanity_" } },
            orderBy: { updatedAt: "desc" }
        });

        const links = rawLinks.map(item => {
            try {
                const parsed = JSON.parse(item.data);
                return {
                    id: item.key,
                    slug: parsed.slug || item.key.replace("vanity_", ""),
                    targetUrl: parsed.targetUrl || "/",
                    clicks: parsed.clicks || 0,
                    isActive: parsed.isActive ?? true,
                    createdAt: parsed.createdAt || item.updatedAt
                };
            } catch {
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json({ links });
    } catch (error) {
        console.error("GET vanity links error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function isInternalCuanflixUrl(url: string): boolean {
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith("/")) return true;
    try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.toLowerCase();
        return host.endsWith("cuanflix.site") || host === "localhost" || host === "127.0.0.1";
    } catch {
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug: rawSlug, targetUrl: rawTarget } = await req.json();

        if (!rawSlug || !rawTarget) {
            return NextResponse.json({ error: "Slug dan Target URL wajib diisi" }, { status: 400 });
        }

        const targetUrl = rawTarget.trim();

        if (!isInternalCuanflixUrl(targetUrl)) {
            return NextResponse.json({ 
                error: "Target URL harus berupa link internal cuanflix.site (contoh: /watch/... atau https://cuanflix.site/...)" 
            }, { status: 400 });
        }

        // Clean slug: lowercase, trim leading/trailing slashes
        const slug = rawSlug.trim().replace(/^\/+|\/+$/g, "");

        if (!slug) {
            return NextResponse.json({ error: "Slug tidak boleh kosong" }, { status: 400 });
        }

        const rootSlug = slug.split("/")[0].split("?")[0].toLowerCase();
        if (RESERVED_SLUGS.has(rootSlug)) {
            return NextResponse.json({ error: `Slug '${rootSlug}' adalah nama sistem terlarang` }, { status: 400 });
        }

        const key = `vanity_${slug}`;

        // Check if exists
        const existing = await prisma.contentCache.findUnique({ where: { key } });
        if (existing) {
            return NextResponse.json({ error: "Slug ini sudah digunakan" }, { status: 400 });
        }

        const payload = {
            slug,
            targetUrl,
            clicks: 0,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        await prisma.contentCache.create({
            data: {
                key,
                data: JSON.stringify(payload)
            }
        });

        return NextResponse.json({ success: true, link: payload });
    } catch (error) {
        console.error("POST vanity link error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
