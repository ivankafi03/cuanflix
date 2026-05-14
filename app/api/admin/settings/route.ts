import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// Pastikan tidak di-cache oleh Next.js — penting untuk maintenance mode polling
export const dynamic = 'force-dynamic';

// GET current settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Only admins can see full settings, but maybe members need to see CPM?
        // For now, let's keep it restricted or semi-restricted.

        let settings = await prisma.systemSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            // Seed if missing
            settings = await prisma.systemSettings.create({
                data: {
                    id: "global",
                    cpmRate: 1.5,
                    watchRate: 0.005,
                    referralRate: 0.01,
                    skimRate: 0.2,
                    minWithdrawal: 5.0
                }
            });
        }

        return NextResponse.json(settings, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST update settings
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Validation (simplified)
        const {
            cpmRate,
            watchRate,
            skimRate,
            minWithdrawal,
            maintenanceMode,
            maintenanceMessage,
            registrationBonus,
            welcomeBonus,
            telegramLink,
            xLink,
            instagramLink,
            tiktokLink,
            supportEmail,
            vpsExpiryDate,
            scPromoLink,
            scPromoPrice
        } = data;

        const updated = await prisma.systemSettings.update({
            where: { id: "global" },
            data: {
                cpmRate: parseFloat(cpmRate) || 1.5,
                watchRate: parseFloat(watchRate) || 0.005,
                skimRate: parseFloat(skimRate) || 0.2,
                minWithdrawal: parseFloat(minWithdrawal) || 5.0,
                maintenanceMode: Boolean(maintenanceMode),
                maintenanceMessage: maintenanceMessage || "Situs sedang dalam pemeliharaan rutin untuk meningkatkan performa.",
                ...(registrationBonus !== undefined && { registrationBonus: parseFloat(registrationBonus) || 0.1 }),
                ...(welcomeBonus !== undefined && { welcomeBonus: parseFloat(welcomeBonus) || 1.0 }),
                telegramLink: telegramLink ?? "https://t.me/cuanflix_official",
                xLink: xLink !== undefined ? xLink : "https://x.com/cuanflix",
                instagramLink: instagramLink !== undefined ? instagramLink : "https://instagram.com/cuanflix",
                tiktokLink: tiktokLink !== undefined ? tiktokLink : "https://tiktok.com/@cuanflix",
                supportEmail: supportEmail !== undefined ? supportEmail : "support@cuanflix.com",
                vpsExpiryDate: vpsExpiryDate ? new Date(vpsExpiryDate) : null,
                scPromoLink: scPromoLink !== undefined ? scPromoLink : "https://t.me/pongo_official",
                scPromoPrice: scPromoPrice !== undefined ? scPromoPrice : "150",
            }
        });

        // Record to AuditLog
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE_SETTINGS",
                details: JSON.stringify(data),
                ip
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
