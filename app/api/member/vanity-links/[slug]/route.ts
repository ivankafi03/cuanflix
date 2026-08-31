import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug);
        const key = `vanity_${decodedSlug}`;

        const existing = await prisma.contentCache.findUnique({ where: { key } });
        if (!existing) {
            return NextResponse.json({ error: "Link tidak ditemukan" }, { status: 404 });
        }

        const parsed = JSON.parse(existing.data);
        if (parsed.userId !== userId) {
            return NextResponse.json({ error: "Anda tidak memiliki akses menghapus link ini" }, { status: 403 });
        }

        await prisma.contentCache.delete({ where: { key } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE member vanity link error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
