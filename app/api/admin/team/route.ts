import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendAdminInvitationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const SUPER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "ivankafipradana@gmail.com").toLowerCase();

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admins = await prisma.user.findMany({
            where: { role: "ADMIN" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
            orderBy: { createdAt: "asc" }
        });

        const invitations = await prisma.adminInvitation.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({
            admins,
            invitations,
            superAdminEmail: SUPER_ADMIN_EMAIL,
            currentAdminEmail: session.user?.email || ""
        });
    } catch (error) {
        console.error("Error fetching admin team:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type } = body;

        if (type === "invite") {
            const email = (body.email || "").trim().toLowerCase();
            if (!email || !email.includes("@")) {
                return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
            }

            // Check if already an admin
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser && existingUser.role === "ADMIN") {
                return NextResponse.json({ error: "Email ini sudah terdaftar sebagai Administrator." }, { status: 400 });
            }

            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            const invitation = await prisma.adminInvitation.upsert({
                where: { email },
                update: { token, expiresAt },
                create: { email, token, expiresAt }
            });

            try {
                await sendAdminInvitationEmail(email, token);
            } catch (mailErr) {
                console.error("Failed to send invitation email:", mailErr);
                return NextResponse.json({ 
                    error: "Undangan tersimpan, namun gagal mengirim email SMTP. Periksa konfigurasi SMTP email Anda." 
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: `Undangan berhasil dikirim ke ${email}.`,
                invitation
            });
        }

        if (type === "direct") {
            const name = (body.name || "").trim();
            const email = (body.email || "").trim().toLowerCase();
            const password = (body.password || "").trim();

            if (!name || !email || !password) {
                return NextResponse.json({ error: "Semua kolom wajib diisi." }, { status: 400 });
            }

            if (password.length < 8) {
                return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
            }

            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser && existingUser.role === "ADMIN") {
                return NextResponse.json({ error: "Email ini sudah terdaftar sebagai Administrator." }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            let adminUser;
            if (existingUser) {
                adminUser = await prisma.user.update({
                    where: { email },
                    data: {
                        name,
                        role: "ADMIN",
                        password: hashedPassword
                    }
                });
            } else {
                adminUser = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: "ADMIN"
                    }
                });
            }

            return NextResponse.json({
                success: true,
                message: `Administrator ${email} berhasil ditambahkan langsung.`,
                admin: {
                    id: adminUser.id,
                    name: adminUser.name,
                    email: adminUser.email,
                    createdAt: adminUser.createdAt
                }
            });
        }

        return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    } catch (error) {
        console.error("Error creating admin/invite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const id = searchParams.get("id");

        if (!type || !id) {
            return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
        }

        if (type === "invitation") {
            await prisma.adminInvitation.delete({
                where: { id }
            });
            return NextResponse.json({ success: true, message: "Undangan berhasil ditarik/dibatalkan." });
        }

        if (type === "admin") {
            const targetAdmin = await prisma.user.findUnique({
                where: { id },
                select: { id: true, email: true, role: true }
            });

            if (!targetAdmin || targetAdmin.role !== "ADMIN") {
                return NextResponse.json({ error: "Admin tidak ditemukan." }, { status: 404 });
            }

            // --- PROTEKSI KETAT SUPER ADMIN ---
            if (targetAdmin.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
                return NextResponse.json({ 
                    error: `Akses ditolak! Super Admin (${SUPER_ADMIN_EMAIL}) tidak dapat dihapus atau dikeluarkan oleh siapapun!` 
                }, { status: 403 });
            }

            // Jangan biarkan admin menghapus akunnya sendiri
            if (targetAdmin.id === session.user.id) {
                return NextResponse.json({ 
                    error: "Anda tidak dapat menghapus akun Anda sendiri." 
                }, { status: 400 });
            }

            // Hapus relasi yang mungkin mengikat
            await prisma.$transaction([
                prisma.chatMessage.deleteMany({ where: { userId: id } }),
                prisma.comment.deleteMany({ where: { userId: id } }),
                prisma.user.delete({ where: { id } })
            ]);

            return NextResponse.json({ success: true, message: "Administrator berhasil dihapus." });
        }

        return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
    } catch (error) {
        console.error("Error deleting admin/invite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
