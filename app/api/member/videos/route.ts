import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { searchJav, getLatestVideos } from "@/lib/jav";

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

        let result;
        if (query.trim()) {
            result = await searchJav(query, page);
        } else {
            result = await getLatestVideos(page);
        }

        const videos = (result?.videos || []).map((v: any) => {
            const href = v.href || "";
            const watchUrl = `${process.env.NEXTAUTH_URL || "https://cuanflix.site"}/watch/${href}`;
            return {
                title: v.title,
                videoId: href,
                videoUrl: watchUrl,
                episode: v.episode || "",
            };
        });

        return NextResponse.json({ videos, totalPages: result?.totalPages || 1 });
    } catch (error) {
        console.error("Video browse error:", error);
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}
