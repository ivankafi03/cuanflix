import React, { Suspense } from "react";
import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import HeroSlider from "@/components/HeroSlider";
import AdUnit from "@/components/ads/AdUnit";
import AdNative from "@/components/ads/AdNative";
import { getHomepageCategories } from "@/lib/jav";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cuanflix - Premium Database",
  description: "Explore the world's most comprehensive Japanese adult video database with Cuanflix. Fast, aesthetic, and perfectly curated for your journey.",
};

const CATEGORY_MAP: Record<string, string> = {
  "Censored": "/categories/1",
  "Uncensored": "/categories/2",
  "Uncensored Leaked": "/categories/3",
  "Amateur": "/categories/4",
  "Chinese AV": "/categories/5",
  "Hentai": "/categories/6",
  "English Subtitle": "/categories/7",
};

export default async function Home() {
  const settings = await prisma.systemSettings.findFirst();
  const categories = await getHomepageCategories();
  
  // Ambil 5 video dari kategori pertama untuk slider
  const sliderVideos = categories?.[0]?.videos?.slice(0, 5) || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <h1 className="sr-only">Cuanflix — Premium Database</h1>

      {sliderVideos.length > 0 && <HeroSlider videos={sliderVideos} />}
      {/* Video Categories */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 w-full flex flex-col gap-16 pb-24 -mt-10 relative z-20">
        {categories && categories.length > 0 ? (
          <div className="flex flex-col gap-6">
            {categories.map((category, idx) => {
              // Hide the featured video from the first category to avoid duplication
              const videosToShow = idx === 0 ? category.videos.slice(1) : category.videos;
              if (videosToShow.length === 0) return null;

              const javData = videosToShow.map((item: any, index: number) => ({
                id: index + 1,
                title: item.title,
                image: item.image,
                rating: 0,
                episodes: 1,
                episodeRaw: item.episode,
                type: "JAV",
                href: `/watch/${item.href}`,
              }));

              const sectionHref = CATEGORY_MAP[category.title] || `/search?q=${encodeURIComponent(category.title)}`;

              return (
                <React.Fragment key={idx}>
                  <AnimeSection
                    title={category.title}
                    data={javData}
                    href={sectionHref}
                  />
                  {/* Single Native Ad - Best position after 3rd category */}
                  {idx === 2 && (
                    <div className="w-full flex justify-center -mx-4 md:mx-0 my-4 overflow-visible">
                      <AdNative />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="h-72 bg-white/5 animate-pulse rounded-xl" />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12 px-6 text-center">
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed font-medium">
          The ultimate database for Japanese content. Fast, modern, and aesthetic exploration experience.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-muted-foreground text-xs font-semibold">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
