import React from "react";
import Link from "next/link";
import { Info, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getJavWatchData, searchJav, getSlugFromUrl } from "@/lib/jav";
import { getAgcWatchData } from "@/lib/agcbokep";
import WatchActions from "@/components/WatchActions";
import HistoryLogger from "@/components/HistoryLogger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WatchPageClient from "@/components/WatchPageClient";

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
    const { slug } = await params;
    const path = slug.join('/');

    let watchData: any = null;
    
    if (path.startsWith('jav/')) {
        const id = path.split('/').pop() || '';
        watchData = await getJavWatchData(id);
    } else if (path.startsWith('agc/')) {
        const slug = path.replace('agc/', '');
        watchData = await getAgcWatchData(slug);
    } else if (path.startsWith('dood/')) {
        return {
            title: `Watch Video Online - Cuanflix`,
            description: `Stream video in HD quality for free on Cuanflix.`,
        };
    } else {
        return { title: "Not Found", description: "" };
    }

    const title = watchData?.title || path.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Watch";

    return {
        title: `Watch ${title} Online - Cuanflix`,
        description: `Stream ${title} in HD quality for free on Cuanflix. High speed servers and premium experience.`,
    };
}

export default async function WatchPrettyPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string[] }>,
    searchParams: Promise<{ url?: string }>
}) {
    const session = await getServerSession(authOptions);
    const { slug } = await params;
    const { url: legacyUrl } = await searchParams;
    const path = slug.join('/');

    // Handle legacy URLs: /watch/id?url=...
    if (path === 'id' && legacyUrl) {
        const slugFromUrl = getSlugFromUrl(legacyUrl);
        if (slugFromUrl) {
            redirect(`/watch/${slugFromUrl}`);
        }
    }

    if (!path.startsWith('jav/') && !path.startsWith('agc/') && !path.startsWith('dood/')) {
        redirect('/');
    }

    let watchData: any = null;
    const id = path.split('/').pop() || '';
    
    if (path.startsWith('jav/')) {
        watchData = await getJavWatchData(id);
    } else if (path.startsWith('agc/')) {
        const slug = path.replace('agc/', '');
        watchData = await getAgcWatchData(slug);
    } else if (path.startsWith('dood/')) {
        // Doodstream embed
        watchData = {
            title: `Video ${id}`,
            poster: '',
            rating: '0.0',
            episode: id,
            type: 'Doodstream',
            servers: [
                { name: 'Doodstream', iframe: `https://dood.la/e/${id}` },
                { name: 'Doodstream Mirror', iframe: `https://dood.re/e/${id}` },
            ],
            downloads: []
        };
    }

    // Fetch related anime based on a generic category
    let relatedAnime: any[] = [];
    try {
        const query = path.startsWith('jav/') ? 'School' : 'Asian';
        const { videos: results } = await searchJav(query); // Default category for related
        relatedAnime = results.slice(0, 6).map((item, idx) => ({
            id: idx + 1,
            title: item.title,
            image: item.image,
            rating: 0,
            episodes: 1,
            episodeRaw: item.episode,
            type: item.type || 'JAV',
            href: `/watch/${item.href}`
        }));

        // Remove current anime from related
        relatedAnime = relatedAnime.filter(a => !(a.link || a.href || '').includes(path)).slice(0, 6);
    } catch (e) {
        console.error("Failed to fetch related", e);
    }

    if (!watchData || !watchData.servers || watchData.servers.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 p-12 rounded-3xl max-w-lg text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Info className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white">Video Not Available</h2>
                        <p className="text-zinc-400">Sorry, we couldn't find any video servers for this episode. It might be under maintenance or removed.</p>
                    </div>
                    <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Log watch history */}
            <HistoryLogger
                videoId={path}
                videoTitle={watchData.title}
                videoImage={watchData.poster}
                videoUrl={`/watch/${path}`}
            />

            <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-[80px] md:pt-[100px] flex flex-col gap-4">
                {/* Guest Call to Action Banner - Smaller & More Elegant */}
                {!session && (
                    <div className="mb-4 bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative group backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-1/2 translate-x-1/4 rounded-full blur-2xl" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-sm md:text-base font-black text-white leading-none">Cuanflix Premium</h2>
                                <p className="text-zinc-500 font-medium text-[10px] md:text-xs">Login untuk simpan video & hilangkan sebagian iklan.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10 w-full md:w-auto">
                            <Link href="/auth/login" className="flex-1 md:flex-none px-4 py-2 bg-primary text-black rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                                Login
                            </Link>
                            <Link href="/auth/register" className="flex-1 md:flex-none px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                                Daftar
                            </Link>
                        </div>
                    </div>
                )}

                <WatchPageClient
                    servers={watchData.servers}
                    downloads={watchData.downloads}
                    videoId={path}
                    relatedAnime={relatedAnime}
                >
                    <div className="bg-secondary border border-border rounded-xl p-5 md:p-6 shadow-md overflow-hidden relative mt-6">
                        <div className="flex flex-col gap-5 relative z-10">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
                                <div className="flex flex-col gap-1.5">
                                    <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight">{watchData.title}</h1>
                                    <div className="flex items-center gap-3">
                                        <p className="text-primary font-semibold text-xs tracking-wide">Streaming Ultra HD • Global Node</p>
                                        {!session && (
                                            <Link href="/auth/login" className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md group hover:bg-primary/20 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Ad-Lite Available</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <WatchActions
                                    anime={{
                                        id: path,
                                        title: watchData.title,
                                        image: watchData.poster,
                                        rating: parseFloat(watchData.rating) > 0 ? parseFloat(watchData.rating) : 0,
                                        episodes: parseInt(watchData.episode) || 0,
                                        type: watchData.type,
                                        href: `/watch/${path}`
                                    }}
                                />
                            </div>

                            {/* Additional Info Section */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Rewards Status</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-foreground text-xs font-bold uppercase">Active Tracking</span>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Member Support</span>
                                        <p className="text-white/60 text-[10px] font-medium italic max-w-xs leading-tight">
                                            Switch servers if loading is slow. Rewards are counted automatically.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        Server: {watchData.servers[0]?.name || "Auto"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </WatchPageClient>
            </div>
        </div>
    );
}
