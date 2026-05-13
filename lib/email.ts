import nodemailer from "nodemailer";

export async function sendAdminPasswordEmail(email: string, newPassword: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"Cuanflix Security" <${process.env.SMTP_USER}>`,
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
