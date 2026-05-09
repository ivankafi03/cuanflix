import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const isGuest = !session;

        // 1. Ambil setting threshold terbaru
        const settings = await prisma.systemSettings.findFirst() || { minWithdrawal: 10.00 };
        const threshold = settings.minWithdrawal;

        // 2. Ambil 1 bot acak
        const bots = await prisma.user.findMany({
            where: { isBot: true },
            select: { name: true, balanceWatch: true }
        });

        if (bots.length === 0) {
            return NextResponse.json({ active: false });
        }

        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        const botBalance = randomBot.balanceWatch || 0;

        // 3. Logika untuk Tamu (Guest) -> Withdraw Notifications (High/Low Random)
        if (isGuest) {
            const methods = ["DANA", "OVO", "GoPay", "ShopeePay", "PayPal", "Bank Transfer"];
            const randomMethod = methods[Math.floor(Math.random() * methods.length)];
            
            // Random amount: sesekali kecil ($10-$15), sesekali besar ($20-$50)
            const isHigh = Math.random() > 0.5;
            const amount = isHigh 
                ? (Math.random() * 30 + 20).toFixed(2) // $20 - $50
                : (Math.random() * 5 + threshold).toFixed(2); // $threshold - ($threshold + 5)

            return NextResponse.json({
                active: true,
                type: "WITHDRAWAL",
                name: randomBot.name,
                amount: amount,
                method: randomMethod
            });
        }

        // 4. Logika untuk Member/Admin -> Real Balance Notifications
        const isReady = botBalance >= threshold;
        const diff = (threshold - botBalance).toFixed(2);

        // Kumpulan kata-kata bagus (Templates)
        const templatesReady = [
            `Target tercapai! Saldo sudah $${botBalance.toFixed(2)}, siap ditarik!`,
            `Gokil! Sudah terkumpul $${botBalance.toFixed(2)}, saatnya gajian nih!`,
            `Inspirasi hari ini: Berhasil kumpulkan $${botBalance.toFixed(2)}. Kamu kapan?`,
            `Siap meluncur ke dompet! Saldo saat ini sudah $${botBalance.toFixed(2)}.`
        ];

        const templatesNotReady = [
            `Semangat! Saldo sudah $${botBalance.toFixed(2)}, kurang $${diff} lagi buat WD.`,
            `Dikit lagi gajian! Butuh $${diff} lagi untuk mencapai batas $${threshold.toFixed(0)}.`,
            `Lagi asik nonton: Saldo terkumpul $${botBalance.toFixed(2)}. Otw penarikan!`,
            `Pejuang receh! Sudah kumpul $${botBalance.toFixed(2)}, sisa $${diff} lagi menuju target.`
        ];

        const message = isReady 
            ? templatesReady[Math.floor(Math.random() * templatesReady.length)]
            : templatesNotReady[Math.floor(Math.random() * templatesNotReady.length)];

        return NextResponse.json({
            active: true,
            type: "MILESTONE",
            name: randomBot.name,
            message: message,
            balance: botBalance.toFixed(2)
        });

    } catch (error) {
        console.error("Notif API error:", error);
        return NextResponse.json({ active: false }, { status: 500 });
    }
}
