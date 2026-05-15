import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Ambil semua cache watch entries
        const allCache = await prisma.contentCache.findMany({
            where: {
                OR: [
                    { key: { startsWith: "watch_" } },
                    { key: { startsWith: "jav_watch_" } },
                ]
            },
            select: { key: true, data: true }
        });

        const toDelete: string[] = [];
        let valid = 0;
        let broken = 0;
        let corrupt = 0;

        for (const entry of allCache) {
            try {
                const data = JSON.parse(entry.data);
                const servers = data?.servers ?? [];

                if (!Array.isArray(servers) || servers.length === 0) {
                    toDelete.push(entry.key);
                    broken++;
                } else {
                    valid++;
                }
            } catch {
                // JSON corrupt
                toDelete.push(entry.key);
                corrupt++;
            }
        }

        let deleted = 0;
        if (toDelete.length > 0) {
            const result = await prisma.contentCache.deleteMany({
                where: { key: { in: toDelete } }
            });
            deleted = result.count;
        }

        return NextResponse.json({
            success: true,
            scanned: allCache.length,
            valid,
            broken,
            corrupt,
            deleted,
            message: deleted > 0
                ? `Berhasil menghapus ${deleted} cache video yang rusak. Cache akan di-fetch ulang saat user membuka halaman.`
                : "Tidak ada cache rusak yang perlu dihapus!"
        });
    } catch (error) {
        console.error("Cache cleanup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET untuk preview (tidak menghapus, hanya cek)
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const allCache = await prisma.contentCache.findMany({
            where: {
                OR: [
                    { key: { startsWith: "watch_" } },
                    { key: { startsWith: "jav_watch_" } },
                ]
            },
            select: { key: true, data: true, updatedAt: true }
        });

        let valid = 0;
        let broken = 0;
        const brokenKeys: string[] = [];

        for (const entry of allCache) {
            try {
                const data = JSON.parse(entry.data);
                const servers = data?.servers ?? [];
                if (!Array.isArray(servers) || servers.length === 0) {
                    broken++;
                    brokenKeys.push(entry.key);
                } else {
                    valid++;
                }
            } catch {
                broken++;
                brokenKeys.push(entry.key);
            }
        }

        return NextResponse.json({
            scanned: allCache.length,
            valid,
            broken,
            brokenSample: brokenKeys.slice(0, 10) // Tampilkan 10 pertama sebagai contoh
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
