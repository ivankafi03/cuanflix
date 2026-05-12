import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Ambil broadcast yang aktif dan belum diklaim oleh user ini
        const broadcasts = await prisma.broadcastReward.findMany({
            where: {
                isActive: true,
                claims: {
                    none: {
                        userId: userId
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(broadcasts);
    } catch (error) {
        console.error("Error fetching member broadcasts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
