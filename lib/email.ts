import nodemailer from "nodemailer";

export async function sendAdminPasswordEmail(email: string, newPassword: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER || "ivankafipradana@gmail.com",
            pass: process.env.SMTP_PASS || "lhux jgnq fozc syoq",
        },
        family: 4,
        tls: {
            rejectUnauthorized: false
        }
    } as any);

    const mailOptions = {
        from: `"Cuanflix Security" <${process.env.SMTP_USER || "ivankafipradana@gmail.com"}>`,
        to: email,
        subject: "⚠️ ADMIN ACCESS RECOVERED",
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                <h2 style="color: #f472b6;">Emergency Password Reset</h2>
                <p>Kami mendeteksi percobaan login yang gagal atau permintaan rotasi rutin pada akun Admin.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #f472b6; margin: 20px 0;">
                    <p style="margin: 0; font-size: 12px; color: #666;">PASSWORD BARU ANDA:</p>
                    <h1 style="margin: 5px 0; letter-spacing: 2px; color: #333;">${newPassword}</h1>
                </div>
                <p style="font-size: 12px; color: #999;">Password ini dibuat otomatis oleh sistem keamanan Cuanflix. Silakan login kembali dengan password ini.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 10px; color: #ccc;">&copy; 2026 Cuanflix Security System</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendAdminInvitationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER || "ivankafipradana@gmail.com",
            pass: process.env.SMTP_PASS || "lhux jgnq fozc syoq",
        },
        family: 4,
        tls: {
            rejectUnauthorized: false
        }
    } as any);

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://cuanflix.vercel.app";
    const inviteLink = `${appUrl}/admin/accept-invitation?token=${token}`;

    const mailOptions = {
        from: `"Cuanflix Admin" <${process.env.SMTP_USER || "ivankafipradana@gmail.com"}>`,
        to: email,
        subject: "🤝 Undangan Menjadi Administrator Cuanflix",
        html: `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #27272a; border-radius: 16px; background-color: #0c0c0e; color: #e4e4e7;">
                <div style="text-align: center; margin-bottom: 28px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">CUAN<span style="color: #f472b6;">FLIX</span></h1>
                    <p style="color: #71717a; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Undangan Akses Administrator</p>
                </div>
                <div style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="font-size: 15px; color: #d4d4d8; line-height: 1.6; margin-bottom: 16px;">
                        Halo,
                    </p>
                    <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px;">
                        Anda telah diundang untuk menjadi <strong style="color: #ffffff;">Administrator</strong> di <strong>Cuanflix</strong>.
                        Dengan akses ini, Anda dapat mengelola member, penarikan saldo, pengaturan sistem, dan memantau platform Cuanflix.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${inviteLink}" style="background-color: #f472b6; color: #000000; padding: 14px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                            Terima Undangan & Buat Akun
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #71717a; line-height: 1.6; margin-bottom: 20px; background-color: #18181b; padding: 14px; border-radius: 10px; border: 1px solid #27272a;">
                        Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut:<br/>
                        <a href="${inviteLink}" style="color: #38bdf8; word-break: break-all;">${inviteLink}</a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #27272a; margin: 24px 0;" />
                    <p style="font-size: 11px; color: #71717a; text-align: center; margin: 0;">
                        Tautan ini berlaku selama 24 jam.<br/>
                        &copy; 2026 Cuanflix Platform. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}
