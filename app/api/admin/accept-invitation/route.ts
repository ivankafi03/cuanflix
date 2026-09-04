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
        const { token, action, name, password } = body;

        if (!token) {
            return NextResponse.json({ error: "Token tidak ditemukan." }, { status: 400 });
        }

        const invite = await prisma.adminInvitation.findUnique({
            where: { token }
        });

        if (!invite || invite.expiresAt < new Date()) {
            return NextResponse.json({ 
                error: "Undangan tidak valid atau sudah kedaluwarsa." 
            }, { status: 400 });
        }

        // Jika user memilih untuk menolak undangan
        if (action === "reject") {
            await prisma.adminInvitation.delete({
                where: { token }
            });
            return NextResponse.json({ 
                success: true, 
                rejected: true,
                message: "Undangan telah ditolak." 
            });
        }

        // Jika user menerima undangan (action === "accept" atau submit form)
        const defaultName = invite.email.split("@")[0].replace(/[._]/g, " ");
        const finalName = (name || "").trim() || defaultName;

        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email }
        });

        let passwordToSet = existingUser?.password;
        if (password && password.trim().length >= 8) {
            passwordToSet = await bcrypt.hash(password.trim(), 10);
        } else if (!passwordToSet) {
            // Jika akun baru dan tidak isi password (misal login via Google), set default hash aman
            const randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            passwordToSet = await bcrypt.hash(randomSecret, 10);
        }

        if (existingUser) {
            await prisma.user.update({
                where: { email: invite.email },
                data: {
                    name: finalName,
                    password: passwordToSet,
                    role: "ADMIN"
                }
            });
        } else {
            await prisma.user.create({
                data: {
                    name: finalName,
                    email: invite.email,
                    password: passwordToSet,
                    role: "ADMIN"
                }
            });
        }

        // Hapus token setelah berhasil diterima
        await prisma.adminInvitation.delete({
            where: { token }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Selamat! Anda resmi menjadi Administrator Cuanflix." 
        });
    } catch (error) {
        console.error("Error accepting invitation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
