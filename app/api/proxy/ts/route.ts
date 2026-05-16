import { NextRequest, NextResponse } from "next/server";

/**
 * /api/proxy/ts?url={encodedTsUrl}
 * 
 * Mengambil segment video (.ts / .aac / .mp4) dari sumber eksternal
 * melalui VPS dan meneruskannya ke browser pengunjung.
 * Pengunjung hanya berkomunikasi dengan cuanflix.site (tidak diblokir).
 */
export async function GET(req: NextRequest) {
    const tsUrl = req.nextUrl.searchParams.get("url") || "";

    if (!tsUrl || !tsUrl.startsWith("http")) {
        return new NextResponse("Invalid URL", { status: 400 });
    }

    try {
        const response = await fetch(tsUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
                "Referer": new URL(tsUrl).origin + "/",
                "Accept": "*/*",
                "Range": req.headers.get("range") || "",
            },
            signal: AbortSignal.timeout(30000),
        });

        if (!response.ok && response.status !== 206) {
            return new NextResponse(`Upstream error: ${response.status}`, { status: 502 });
        }

        const contentType = response.headers.get("content-type") || "video/MP2T";

        // Stream response langsung ke browser
        return new NextResponse(response.body, {
            status: response.status,
            headers: {
                "Content-Type": contentType,
                "Content-Length": response.headers.get("content-length") || "",
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (e: any) {
        console.error("[TS Proxy] Error:", e.message);
        return new NextResponse("Proxy error: " + e.message, { status: 500 });
    }
}
