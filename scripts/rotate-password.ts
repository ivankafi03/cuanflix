import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "ivankafipradana@gmail.com";

async function rotatePassword() {
    console.log("Starting password rotation for:", ADMIN_EMAIL);

    try {
        // 1. Cari user admin
        const user = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL }
        });

        if (!user) {
            console.error("Admin user not found!");
            return;
        }

        // 2. Generate password acak baru
        const newPassword = crypto.randomBytes(6).toString('hex'); // Contoh: a1b2c3d4e5f6
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update di Database
        await prisma.user.update({
            where: { email: ADMIN_EMAIL },
            data: { password: hashedPassword }
        });

        // 4. Kirim ke Email via Resend
        const { data, error } = await resend.emails.send({
            from: 'Cuanflix Security <security@cuanflix.site>',
            to: [ADMIN_EMAIL],
            subject: '🔒 Password Admin Baru - Cuanflix',
            html: `
                <div style="font-family: sans-serif; padding: 20px; background: #000; color: #fff; border-radius: 10px;">
                    <h2 style="color: #f472b6;">Keamanan Cuanflix</h2>
                    <p>Halo Admin, sesuai jadwal 24 jam, password panel admin Anda telah diperbarui.</p>
                    <div style="background: #111; padding: 15px; border: 1px solid #333; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase;">Password Baru Anda:</p>
                        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #f472b6; letter-spacing: 2px;">${newPassword}</p>
                    </div>
                    <p style="font-size: 12px; color: #666;">Silakan gunakan password ini untuk login ke <a href="https://cuanflix.site/auth/login" style="color: #f472b6;">cuanflix.site</a>.</p>
                    <hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;">
                    <p style="font-size: 10px; color: #444;">Pesan ini dikirim secara otomatis oleh sistem keamanan Cuanflix.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Failed to send email:", error);
        } else {
            console.log("Password rotated successfully! Email sent ID:", data?.id);
        }

    } catch (error) {
        console.error("Error during rotation:", error);
    } finally {
        await prisma.$disconnect();
    }
}

rotatePassword();
