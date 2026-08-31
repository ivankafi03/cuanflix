import React, { Suspense } from "react";
import Link from "next/link";
import AnimeSection from "@/components/AnimeSection";
import NativeBannerAd from "@/components/ads/NativeBannerAd";
import SharePromoBanner from "@/components/SharePromoBanner";
import HeroSlider from "@/components/HeroSlider";
import HowItWorks from "@/components/HowItWorks";
import FAQSection from "@/components/FAQSection";
import { getHomepageCategories } from "@/lib/jav";
import { getAgcCategories } from "@/lib/agcbokep";
import { searchXNXX } from "@/lib/xnxx";
import { getVidlxCategories } from "@/lib/vidlx";
import prisma from "@/lib/prisma";
import { Flame, Globe, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cuanflix - Premium Database",
  description: "Explore the world's most comprehensive video database with Cuanflix. Fast, aesthetic, and perfectly curated.",
};

export default async function Home() {
  const settings = await prisma.systemSettings.findFirst();
  const javCategories = await getHomepageCategories();
  
  let vidlxCategories: any[] = [];
  try {
    vidlxCategories = await getVidlxCategories();
  } catch (e) {}

  let indoVideos: any[] = [];
  try {
    const agcRes = await getAgcCategories();
    if (agcRes && agcRes.length > 0 && agcRes[0].videos?.length > 0) {
      indoVideos = agcRes[0].videos;
    }
  } catch (e) {}

  if (indoVideos.length === 0) {
    try {
      const xnxxRes = await searchXNXX("indonesian", 1);
      indoVideos = xnxxRes.videos || [];
    } catch (e) {}
  }

  // 1. Group Indo: Each category row has a standard count (8 items) and explicit redirect
  const indoGroup = [
    ...(indoVideos.length > 0 ? [{ title: "Bokep Indo Utama", href: "/indo", videos: indoVideos.slice(0, 8) }] : []),
    ...(vidlxCategories.filter(c => c.title.includes("Indo"))?.map(c => {
      let href = "/indo";
      if (c.title.includes("Viral")) {
        href = "/search?q=viral";
      } else if (c.title.includes("SMA")) {
        href = "/search?q=sma";
      }
      return {
        title: c.title,
        href,
        videos: c.videos.slice(0, 8)
      };
    }) || [])
  ];

  // 2. Group International/Barat: Standard 8 items
  const baratGroup = vidlxCategories.filter(c => c.title.includes("Barat"))?.map(c => ({
    title: c.title,
    href: "/search?q=barat",
    videos: c.videos.slice(0, 8)
  })) || [];

  // 3. Group JAV & Asian: Standard 8 items
  const javGroup = javCategories.slice(0, 3).map(c => ({
    title: c.title,
    href: c.title === "Censored" ? "/categories/1" : c.title === "Uncensored" ? "/categories/2" : `/search?q=${encodeURIComponent(c.title)}`,
    videos: c.videos.slice(0, 8)
  }));

  const sliderVideos = javCategories?.[0]?.videos?.slice(0, 5) || [];

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <h1 className="sr-only">Cuanflix — Premium Database</h1>

      {sliderVideos.length > 0 && <HeroSlider videos={sliderVideos} />}

      <div className="bg-[#0a0a0f] relative z-20 w-full border-t border-white/[0.06]">
        <main id="kategori-video" className="max-w-[1600px] mx-auto px-4 md:px-8 w-full flex flex-col gap-8 md:gap-14 pb-12 pt-5 md:pt-8">
          
          <SharePromoBanner className="mb-2 md:mb-4" />

          {/* SUB-BAB 1: KOLEKSI INDONESIA */}
          {indoGroup.length > 0 && (
            <section className="flex flex-col gap-4 md:gap-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Koleksi Indonesia</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Video Indo Terbaru & Paling Banyak Ditonton</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-8">
                {indoGroup.map((cat, idx) => {
                  const mappedData = cat.videos.map((item: any, index: number) => ({
                    id: index + 1,
                    title: item.title,
                    image: item.image,
                    rating: 0,
                    episodes: 1,
                    episodeRaw: item.episode,
                    type: item.type || "Video",
                    href: item.href ? `/watch/${item.href}` : `/watch/${item.link}`,
                  }));

                  return (
                    <React.Fragment key={idx}>
                      <AnimeSection
                        title={cat.title}
                        data={mappedData}
                        href={cat.href}
                      />
                      <NativeBannerAd id={`home-indo-${idx}`} />
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          )}

          {/* SUB-BAB 2: KOLEKSI BARAT & INTERNATIONAL */}
          {baratGroup.length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Koleksi Barat & International</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Video International & Western Choice</p>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {baratGroup.map((cat, idx) => {
                  const mappedData = cat.videos.map((item: any, index: number) => ({
                    id: index + 1,
                    title: item.title,
                    image: item.image,
                    rating: 0,
                    episodes: 1,
                    episodeRaw: item.episode,
                    type: item.type || "Video",
                    href: item.href ? `/watch/${item.href}` : `/watch/${item.link}`,
                  }));

                  return (
                    <React.Fragment key={idx}>
                      <AnimeSection
                        title={cat.title}
                        data={mappedData}
                        href={cat.href}
                      />
                      <NativeBannerAd id={`home-barat-${idx}`} />
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          )}

          {/* SUB-BAB 3: KOLEKSI JAV & ASIAN */}
          {javGroup.length > 0 && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">JAV & Asian Database</h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Official Japanese & Asian Classifications</p>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {javGroup.map((cat, idx) => {
                  const mappedData = cat.videos.map((item: any, index: number) => ({
                    id: index + 1,
                    title: item.title,
                    image: item.image,
                    rating: 0,
                    episodes: 1,
                    episodeRaw: item.episode,
                    type: item.type || "JAV",
                    href: item.href ? `/watch/${item.href}` : `/watch/${item.link}`,
                  }));

                  return (
                    <React.Fragment key={idx}>
                      <AnimeSection
                        title={cat.title}
                        data={mappedData}
                        href={cat.href}
                      />
                      <NativeBannerAd id={`home-jav-${idx}`} />
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          )}

        </main>

        <HowItWorks />
        <FAQSection threshold={settings?.minWithdrawal ?? 5} />
      </div>
    </div>
  );
}
