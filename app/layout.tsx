import type { Metadata, Viewport } from "next";
import { Inter, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ChatWidget from "@/components/ChatWidget";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdScripts from "@/components/ads/AdScripts";
import AntiAdBlock from "@/components/ads/AntiAdBlock";
import AdblockDetector from "@/components/ads/AdblockDetector";
import AdUnit from "@/components/ads/AdUnit";

import Footer from "@/components/Footer";
import NotificationToast from "@/components/NotificationToast";
import RewardNotification from "@/components/RewardNotification";
import NavigationProgressWrapper from "@/components/NavigationProgressWrapper";
import { Loader2 } from "lucide-react";

// Inter — font utama untuk UI, body, label, form
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Nunito — font display untuk heading/judul, lebih soft & modern
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

  // IP Ban check — runs on every page load (server-side)
  try {
    const userAgent = headerList.get("user-agent") || "";
    
    // Bypass IP check for social media bots to ensure OG images work
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
    // Non-critical: if check fails, don't block legitimate users
  }

  // Cek apakah user adalah admin — jika iya, sembunyikan semua iklan
  // Cek apakah user adalah admin — jika iya, sembunyikan semua iklan
  const session = await getServerSession(authOptions) as any;
  const isAdmin = session?.user?.role === "ADMIN";

  // Jalankan rotasi password admin otomatis (Daily)
  const { checkAndRotateAdminPassword } = await import("@/lib/admin-rotation");
  await checkAndRotateAdminPassword();

  // Implementasi Maintenance Mode
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  const isMaintenance = settings?.maintenanceMode && !isAdmin;
  
  if (isMaintenance) {
    // Jangan redirect jika sudah di /maintenance atau halaman auth tertentu
    const pathname = headerList.get("next-url") || ""; 
    if (!pathname.includes("/maintenance") && !pathname.includes("/auth") && !pathname.includes("/api/auth")) {
       redirect("/maintenance");
    }
  }

  return (
    <html lang="id" className="dark scroll-smooth">
      <body className={`${inter.variable} ${nunito.variable} font-sans bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary relative`} suppressHydrationWarning>
        <div className="fixed inset-0 bg-dot-grid opacity-20 pointer-events-none z-[-1]" />
        <Providers>
          <NavigationProgressWrapper />
          <Navbar />
          <main className="flex-grow min-h-screen">
            {children}
          </main>
          <Footer />
          <ChatWidget />
          {!isAdmin && <AdScripts />}
          <AntiAdBlock />
          <NotificationToast />
          <RewardNotification />
          
          {/* Throttle Mode (Slowdown) Visual Indicator */}
          {session?.user && (session.user as any).throttleMode && (
            <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
              <div className="p-4 bg-[#0F0F11] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Optimizing connection... (Slow Mode Active)</span>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
