import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const FAKE_NAMES = [
    "Budi Santoso", "Rina Chan", "Kirito_Indo", "KangNonton", "Dimas_99",
    "Siska_Wibu", "Ani_Anime", "Surya_Kencana", "Eko_Pratama", "Maya_Sari",
    "Goku_Lover", "Naruto_Fans", "WibuSejati", "NontonTerus", "AnimeLovers",
    "Dedi_Kurniawan", "Santi_Lestari", "Andi_Wijaya", "Putri_Ayu", "Joko_Susilo",
    "Rizky_Ramadhan", "Indah_Permata", "Taufik_Hidayat", "Lina_Marlina", "Agus_Setiawan",
    "Fitri_Handayani", "Bambang_Sutejo", "Dewi_Anggraini", "Hadi_Saputra", "Yanti_Rahayu"
];

export async function GET() {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ghosts = await prisma.user.findMany({
        where: { isBot: true },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(ghosts);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { count = 10 } = await req.json();
        const createdUsers = [];

        for (let i = 0; i < count; i++) {
            const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
            const randomSuffix = crypto.randomBytes(2).toString('hex');
            const username = `${name.replace(/\s+/g, '').toLowerCase()}_${randomSuffix}`;
            const email = `bot_${username}@system.local`;

            // Random balance between $1 and $48
            const balanceWatch = Math.random() * 45 + 1;
            const balanceReferral = Math.random() * 5;

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    balanceWatch,
                    balanceReferral,
                    isBot: true,
                    // No password needed for bots
                }
            });
            createdUsers.push(user);
        }

        return NextResponse.json({ success: true, count: createdUsers.length });
    } catch (error) {
        console.error("Ghost creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
