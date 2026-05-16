import { NextRequest, NextResponse } from "next/server";

/**
 * /api/proxy/m3u8?url={encodedM3u8Url}
 * 
 * Mengambil file M3U8 dari sumber eksternal melalui VPS,
 * lalu mengganti semua URL segment .ts dengan URL proxy kita,
 * sehingga pengunjung bisa menonton tanpa VPN.
 */
export async function GET(req: NextRequest) {
    const m3u8Url = req.nextUrl.searchParams.get("url") || "";

    if (!m3u8Url || !m3u8Url.startsWith("http")) {
        return new NextResponse("Invalid URL", { status: 400 });
    }

    try {
        const response = await fetch(m3u8Url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
                "Referer": new URL(m3u8Url).origin + "/",
                "Accept": "*/*",
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            return new NextResponse(`Upstream error: ${response.status}`, { status: 502 });
        }

        const m3u8Text = await response.text();
        const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);
        const origin = req.nextUrl.origin;

        // Ganti setiap URI di M3U8 dengan URL proxy kita
        const proxied = m3u8Text.split("\n").map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) {
                // Ganti URI= di tag EXT-X-KEY (enkripsi)
                return line.replace(/URI="([^"]+)"/g, (_, uri) => {
                    const absUrl = uri.startsWith("http") ? uri : baseUrl + uri;
                    return `URI="${origin}/api/proxy/ts?url=${encodeURIComponent(absUrl)}"`;
                });
            }

            // Segment M3U8 child (playlist variant)
            if (trimmed.endsWith(".m3u8")) {
                const absUrl = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
                return `${origin}/api/proxy/m3u8?url=${encodeURIComponent(absUrl)}`;
            }

            // Segment video .ts / .aac / .mp4 / etc
            if (!trimmed.startsWith("#")) {
                const absUrl = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
                return `${origin}/api/proxy/ts?url=${encodeURIComponent(absUrl)}`;
            }

            return line;
        }).join("\n");

        return new NextResponse(proxied, {
            headers: {
                "Content-Type": "application/vnd.apple.mpegurl",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache",
            },
        });

    } catch (e: any) {
        console.error("[M3U8 Proxy] Error:", e.message);
        return new NextResponse("Proxy error: " + e.message, { status: 500 });
    }
}
