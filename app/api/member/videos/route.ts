import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { searchXNXX } from "@/lib/xnxx";
import { getLatestVideos, searchJav } from "@/lib/jav";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

        let videos: any[] = [];
        let totalPages = 50;

        if (q.trim()) {
            // Search mode: query across XNXX and JAV
            const [xnxxRes, javRes] = await Promise.allSettled([
                searchXNXX(q, page),
                searchJav(q, page)
            ]);

            const xnxxList = xnxxRes.status === "fulfilled" ? xnxxRes.value?.videos || [] : [];
            const javList = javRes.status === "fulfilled" ? javRes.value?.videos || [] : [];

            videos = [...xnxxList, ...javList];
            const maxP = Math.max(
                xnxxRes.status === "fulfilled" ? (xnxxRes.value?.totalPages || 1) : 1,
                javRes.status === "fulfilled" ? (javRes.value?.totalPages || 1) : 1
            );
            totalPages = Math.min(50, Math.max(1, maxP));
        } else {
            // Browse mode: fetch full paginated list across JAV & XNXX
            const [javRes, xnxxRes] = await Promise.allSettled([
                getLatestVideos(page),
                searchXNXX("indonesian", page)
            ]);

            const javList = javRes.status === "fulfilled" ? javRes.value?.videos || [] : [];
            const xnxxList = xnxxRes.status === "fulfilled" ? xnxxRes.value?.videos || [] : [];

            videos = [...javList, ...xnxxList];
            totalPages = 50;
        }

        // Remove duplicates by videoId
        const seen = new Set<string>();
        const uniqueVideos: any[] = [];

        for (const v of videos) {
            const rawId = (v.href || v.link || "").replace(/^\/?watch\//, "").replace(/^\//, "");
            if (rawId && !seen.has(rawId)) {
                seen.add(rawId);
                uniqueVideos.push({
                    title: v.title,
                    image: v.image || "/placeholder-poster.png",
                    videoId: rawId,
                    videoUrl: `/watch/${rawId}`,
                    episode: v.episode || "HD"
                });
            }
        }

        return NextResponse.json({ videos: uniqueVideos, totalPages });
    } catch (error) {
        console.error("Video browse error:", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}
