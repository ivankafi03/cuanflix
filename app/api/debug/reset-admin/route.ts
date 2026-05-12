import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const adminEmail = "ivankafipradana@gmail.com";
        const adminPassword = "AdminPassword123!";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                password: hashedPassword,
                role: "ADMIN",
                isSuspended: false
            },
            create: {
                email: adminEmail,
                name: "Main Admin",
                password: hashedPassword,
                role: "ADMIN",
                balanceWatch: 0,
                balanceReferral: 0,
                balanceBonus: 0
            }
        });

        return NextResponse.json({
            success: true,
            message: "Admin account has been forcefully reset/created.",
            email: user.email,
            password: adminPassword
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
