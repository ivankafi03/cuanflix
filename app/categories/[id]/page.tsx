import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import { getVideosByCategory } from "@/lib/jav";
import Pagination from "@/components/Pagination";

const GENRES: Record<string, { name: string; emoji: string }> = {
    "1": { name: "Censored", emoji: "🔒" },
    "2": { name: "Uncensored", emoji: "🔓" },
    "3": { name: "Uncensored Leaked", emoji: "💧" },
    "4": { name: "Amateur", emoji: "📹" },
    "5": { name: "Chinese AV", emoji: "🇨🇳" },
    "6": { name: "Hentai", emoji: "✨" },
    "7": { name: "English Subtitle", emoji: "🌐" },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const genre = GENRES[id];
    return {
        title: genre ? `${genre.name} — Cuanflix` : "Category — Cuanflix",
        description: genre ? `Browse all ${genre.name} JAV videos in our database.` : "Browse JAV videos.",
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { id } = await params;
    const { page } = await searchParams;
    const currentPage = Math.max(1, parseInt(page || "1", 10));
    const genre = GENRES[id];

    const { videos, totalPages, total } = await getVideosByCategory(id, currentPage);

    const javData = videos.map((item, index) => ({
        id: index + 1,
        title: item.title,
        image: item.image,
        rating: 0,
        episodes: 1,
        episodeRaw: item.episode,
        type: item.type || "JAV",
        href: `/watch/${item.href}`,
    }));

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <main className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col gap-8 pt-28 pb-20">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs">
                    <Link href="/categories" className="text-zinc-600 hover:text-zinc-400 transition-colors" prefetch={false}>
                        Categories
                    </Link>
                    <span className="text-zinc-800">/</span>
                    <span className="text-zinc-400">{genre?.name ?? `Genre ${id}`}</span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3">
                    {genre && <span className="text-3xl">{genre.emoji}</span>}
                    <div>
                        <h1 className="text-2xl font-bold text-white">{genre?.name ?? `Genre ${id}`}</h1>
                        <p className="text-zinc-600 text-sm mt-0.5">
                            {total > 0 ? `${total.toLocaleString()} videos` : ""} — Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Video Grid */}
                {javData.length > 0 ? (
                    <AnimeSection title="" data={javData} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-600">
                        <span className="text-4xl">📭</span>
                        <p className="text-sm">No videos found for this category.</p>
                    </div>
                )}

                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    baseUrl={`/categories/${id}`} 
                />
            </main>
        </div>
    );
}
