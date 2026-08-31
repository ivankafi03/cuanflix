import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cuanflix.site"),
  title: {
    default: "Cuanflix | Nonton JAV Premium Terlengkap & Tercepat",
    template: "%s | Cuanflix"
  },
  description: "Eksplorasi database video JAV premium terlengkap dengan Cuanflix. Streaming HD, Update Setiap Hari, & Estetik. Nikmati pengalaman nonton tanpa batas.",
  keywords: ["streaming video", "cuanflix", "database jav", "nonton jav", "jav hd", "jav terlengkap", "jav terbaru", "jav sub indo"],
  authors: [{ name: "Cuanflix Team" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Cuanflix - Premium Streaming Database JAV",
    description: "Database streaming JAV tercepat dan terlengkap dengan antarmuka yang bersih dan modern.",
    url: "https://cuanflix.site",
    siteName: "Cuanflix",
    images: [
      {
        url: "/og-image-final.png",
        width: 1200,
        height: 630,
        alt: "Cuanflix - Premium JAV Database",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuanflix - Premium JAV Streaming",
    description: "Database JAV terlengkap dengan antarmuka premium.",
    images: ["/og-image-final.png"],
  },
  verification: {
    google: "aiLtxrRH6Uyg3og-7jae-IrjRNDR0bnxN1M_Yo5Hbvg",
    yandex: "7a6a62e98a13383a",
    other: {
      "msvalidate.01": "6939B80F9CD03E0CC791034A0B59B03C",
    },
  },
  icons: {
    icon: "/cuanflix_logo_3d.png?v=2",
    shortcut: "/cuanflix_logo_3d.png?v=2",
    apple: "/cuanflix_logo_3d.png?v=2",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();

  // IP Ban check
  try {
    const userAgent = headerList.get("user-agent") || "";
    const isSocialBot = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot/i.test(userAgent);
    
    if (!isSocialBot) {
      const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim()
        || headerList.get("x-real-ip")
        || null;

      if (ip) {
        const banned = await prisma.blockedIp.findUnique({ where: { ip } });
        if (banned) {
          redirect("/blocked");
        }
      }
    }
  } catch {
    // Non-critical
  }

  const session = await getServerSession(authOptions) as any;
  const isAdmin = session?.user?.role === "ADMIN";

  const { checkAndRotateAdminPassword } = await import("@/lib/admin-rotation");
  await checkAndRotateAdminPassword();

  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  const isMaintenance = settings?.maintenanceMode && !isAdmin;
  
  if (isMaintenance) {
    const pathname = headerList.get("next-url") || ""; 
    if (!pathname.includes("/maintenance") && !pathname.includes("/auth") && !pathname.includes("/api/auth")) {
       redirect("/maintenance");
    }
  }

  return (
    <html lang="id" className="scroll-smooth" style={{ backgroundColor: "#0a0a0f", colorScheme: "dark" }}>
      <head>
        <link rel="icon" href="/cuanflix_logo_hd.png?v=10000" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/cuanflix_logo_hd.png?v=10000" type="image/png" />
        <link rel="apple-touch-icon" href="/cuanflix_logo_hd.png?v=10000" />
        <style dangerouslySetInnerHTML={{ __html: `html,body{background-color:#0a0a0f!important;margin:0;padding:0}` }} />
      </head>
      <body className={`${inter.variable} ${nunito.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary relative`} style={{ backgroundColor: "#0a0a0f" }} suppressHydrationWarning>
        <MainLayoutWrapper session={session}>
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}
