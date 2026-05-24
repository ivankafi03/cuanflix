import React from "react";
import AnimeCard from "./AnimeCard";
import ViewAllCard from "./ViewAllCard";
import ViewAllLink from "./ViewAllLink";

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
                    <ViewAllLink href={href} />
                )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6 md:gap-8">
                {data.map((anime, index) => (
                    <React.Fragment key={anime.id}>
                        <AnimeCard {...anime} />
                    </React.Fragment>
                ))}
                {href && href !== "#" && (
                    <ViewAllCard href={href} />
                )}
            </div>
        </section>
    );
}
