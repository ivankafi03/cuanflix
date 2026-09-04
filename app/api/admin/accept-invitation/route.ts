import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ valid: false, error: "Token tidak ditemukan." }, { status: 400 });
        }

        const invite = await prisma.adminInvitation.findUnique({
            where: { token }
        });

        if (!invite || invite.expiresAt < new Date()) {
            return NextResponse.json({ 
                valid: false, 
                error: "Undangan tidak valid atau sudah kedaluwarsa (berlaku 24 jam)." 
            }, { status: 400 });
        }

        return NextResponse.json({ valid: true, email: invite.email });
    } catch (error) {
        console.error("Error checking invitation token:", error);
        return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, name, password } = body;

        if (!token || !name || !password) {
            return NextResponse.json({ error: "Semua kolom wajib diisi." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password harus minimal 8 karakter." }, { status: 400 });
        }

        const invite = await prisma.adminInvitation.findUnique({
            where: { token }
        });

        if (!invite || invite.expiresAt < new Date()) {
            return NextResponse.json({ 
                error: "Undangan tidak valid atau sudah kedaluwarsa." 
            }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email }
        });

        if (existingUser) {
            await prisma.user.update({
                where: { email: invite.email },
                data: {
                    name,
                    password: hashedPassword,
                    role: "ADMIN"
                }
            });
        } else {
            await prisma.user.create({
                data: {
                    name,
                    email: invite.email,
                    password: hashedPassword,
                    role: "ADMIN"
                }
            });
        }

        // Hapus token setelah digunakan
        await prisma.adminInvitation.delete({
            where: { token }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Pendaftaran administrator berhasil! Silakan login ke dashboard." 
        });
    } catch (error) {
        console.error("Error accepting invitation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
