import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import AdUnit from "./ads/AdUnit";
import { useSession } from "next-auth/react";

interface AnimeData {
    id: number;
    title: string;
    image: string;
    rating: number;
    episodes: number;
    episodeRaw?: string;
    type: string;
}

interface AnimeSectionProps {
    title: string;
    data: AnimeData[];
    href?: string;
}

export default function AnimeSection({ title, data, href }: AnimeSectionProps) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                {title && (
                    <h2 className="text-xl font-bold text-foreground">
                        {title}
                    </h2>
                )}
                {href && href !== "#" && (
                    <Link
                        href={href}
                        prefetch={false}
                        className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        View All
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
                {data.map((anime, index) => (
                    <React.Fragment key={anime.id}>
                        <AnimeCard {...anime} />
                        {/* Native Ad: Insert every 10 items */}
                        {(index + 1) % 10 === 0 && (
                            <div className="aspect-[2/3] bg-zinc-900/40 rounded-2xl border border-white/5 p-1 flex items-center justify-center overflow-hidden">
                                <div className="w-full scale-[0.8] md:scale-100 flex flex-col items-center">
                                    <div id="container-863f6aef8282a41ad5ebdefcf161468b"></div>
                                    <script async={true} data-cfasync="false" src="https://downconvenientmagnetic.com/863f6aef8282a41ad5ebdefcf161468b/invoke.js"></script>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </section>
    );
}
