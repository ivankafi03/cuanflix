const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
    try {
        const password = "admin_cuan_123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            console.log("No admin user found. Creating one...");
            await prisma.user.create({
                data: {
                    name: 'Admin',
                    email: 'ivankafipradana@gmail.com',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });
        } else {
            await prisma.user.update({
                where: { id: admin.id },
                data: { password: hashedPassword }
            });
        }

        console.log("==========================================");
        console.log("ADMIN PASSWORD RESET SUCCESSFUL!");
        console.log("Email: " + (admin ? admin.email : 'ivankafipradana@gmail.com'));
        console.log("Password: " + password);
        console.log("==========================================");
        console.log("Silakan login, lalu update VPS untuk mengaktifkan rotasi otomatis.");
    } catch (error) {
        console.error("Error resetting admin:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
