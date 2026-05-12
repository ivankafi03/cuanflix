import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimeCard from "./AnimeCard";

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
                {data.map((anime) => (
                    <AnimeCard key={anime.id} {...anime} />
                ))}
            </div>
        </section>
    );
}
