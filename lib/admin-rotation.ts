import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { sendAdminPasswordEmail } from "./email";
import { backupDatabaseToTelegram } from "./backup";

export async function checkAndRotateAdminPassword() {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let rotation = await prisma.adminRotation.findUnique({
            where: { id: "global" }
        });

        // If no rotation record exists or it's time for next rotation
        if (!rotation || now >= rotation.nextRotation) {
            console.log("[ADMIN-ROTATION] Starting daily password rotation...");

            // 1. Generate new random password
            const newPassword = generateRandomPassword(16);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 2. Find admin user
            const admin = await prisma.user.findFirst({
                where: { role: "ADMIN" }
            });

            if (!admin) {
                console.error("[ADMIN-ROTATION] No admin found!");
                return;
            }

            // 3. Update admin password
            await prisma.user.update({
                where: { id: admin.id },
                data: { password: hashedPassword }
            });

            // 4. Update rotation record
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            await prisma.adminRotation.upsert({
                where: { id: "global" },
                update: {
                    lastRotation: now,
                    nextRotation: tomorrow
                },
                create: {
                    id: "global",
                    lastRotation: now,
                    nextRotation: tomorrow
                }
            });

            // 5. Backup database to Telegram
            await backupDatabaseToTelegram();

            // 6. Send email
            await sendAdminPasswordEmail(process.env.ADMIN_EMAIL || 'ivankafipradana@gmail.com', newPassword);
            console.log(`[ADMIN-ROTATION] Email sent to ${process.env.ADMIN_EMAIL || 'ivankafipradana@gmail.com'}`);

            // 7. Send Telegram Notification (More Reliable)
            if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
                const message = `🔐 *PASSWORD ADMIN BARU*\n\nHalo Admin, password Anda telah dirotasi otomatis.\n\n🔑 Password: \`${newPassword}\`\n\n_Segera login dan amankan sistem!_`;
                
                await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: process.env.TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });
                console.log("[ADMIN-ROTATION] Telegram notification sent.");
            }

            return true; // Password was rotated
        }

        return false; // No rotation needed
    } catch (error) {
        console.error("[ADMIN-ROTATION] Error during rotation:", error);
        return false;
    }
}

export async function forceRotateAdminPassword() {
    try {
        console.log("[ADMIN-ROTATION] FORCED rotation triggered!");
        
        const newPassword = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const admin = await prisma.user.findFirst({
            where: { role: "ADMIN" }
        });

        if (!admin || !admin.email) return;

        // Update password
        await prisma.user.update({
            where: { id: admin.id },
            data: { password: hashedPassword }
        });

        // Update rotation record to today
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await prisma.adminRotation.upsert({
            where: { id: "global" },
            update: { lastRotation: now, nextRotation: tomorrow },
            create: { id: "global", lastRotation: now, nextRotation: tomorrow }
        });

        // Send Email
        await sendAdminPasswordEmail(admin.email, newPassword);

        // Send Telegram if configured
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            const message = `🚨 *EMERGENCY ROTATION*\n\nSeseorang mencoba login Admin dengan password salah.\n\n🔑 Password Baru: \`${newPassword}\``;
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
            });
        }

        return true;
    } catch (error) {
        console.error("[ADMIN-ROTATION] Forced rotation failed:", error);
    }
}

function generateRandomPassword(length: number) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
