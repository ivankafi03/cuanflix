import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug);
        const key = `vanity_${decodedSlug}`;

        const existing = await prisma.contentCache.findUnique({ where: { key } });
        if (!existing) {
            return NextResponse.json({ error: "Vanity link tidak ditemukan" }, { status: 404 });
        }

        const body = await req.json();
        const currentData = JSON.parse(existing.data);

        const updatedPayload = {
            ...currentData,
            targetUrl: body.targetUrl !== undefined ? body.targetUrl.trim() : currentData.targetUrl,
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : currentData.isActive,
            clicks: body.resetClicks ? 0 : currentData.clicks
        };

        await prisma.contentCache.update({
            where: { key },
            data: { data: JSON.stringify(updatedPayload) }
        });

        return NextResponse.json({ success: true, link: updatedPayload });
    } catch (error) {
        console.error("PATCH vanity link error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug);
        const key = `vanity_${decodedSlug}`;

        await prisma.contentCache.delete({ where: { key } }).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE vanity link error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
