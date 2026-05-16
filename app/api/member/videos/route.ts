import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { searchJav, getLatestVideos } from "@/lib/jav";
import { searchXNXX } from "@/lib/xnxx";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);

        let javResult;
        let xnxxResult;

        if (query.trim()) {
            [javResult, xnxxResult] = await Promise.all([
                searchJav(query, page),
                searchXNXX(query, page)
            ]);
        } else {
            [javResult, xnxxResult] = await Promise.all([
                getLatestVideos(page),
                searchXNXX("trending", page) // fallback for XNXX
            ]);
        }

        const combinedVideos = [
            ...(javResult?.videos || []),
            ...(xnxxResult?.videos || [])
        ];

        // Return only what we need: title, videoId (slug with prefix), and the watch URL
        const videos = combinedVideos.map((v: any) => {
            const href = v.href || "";
            const watchUrl = `${process.env.NEXTAUTH_URL || "https://cuanflix.site"}/watch/${href}`;
            return {
                title: v.title,
                videoId: href,
                videoUrl: watchUrl,
                episode: v.episode || "",
            };
        });

        const totalPages = Math.max(javResult?.totalPages || 1, xnxxResult?.totalPages || 1);

        return NextResponse.json({ videos, totalPages });
    } catch (error) {
        console.error("Video browse error:", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}
