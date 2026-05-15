import * as cheerio from 'cheerio';
import prisma from "./prisma";

const SOURCE_URL = "https://nontonasik.my.id/jav-domain/";
const BAD_VIDEO_TTL = 12 * 60 * 60 * 1000; // 12 jam sebelum retry

/**
 * Hapus video rusak dari SEMUA listing cache secara langsung.
 * Dipanggil saat member membuka video yang tidak punya server.
 * Efek: video langsung hilang dari listing tanpa harus tunggu cache expire.
 */
async function removeVideoFromAllCaches(id: string): Promise<void> {
    try {
        // 1. Tandai sebagai bad (untuk filterBadIds di listing builder)
        await prisma.contentCache.upsert({
            where: { key: `jav_bad_${id}` },
            update: { data: '{"bad":true}', updatedAt: new Date() },
            create: { key: `jav_bad_${id}`, data: '{"bad":true}' }
        });

        // 2. Ambil SEMUA listing cache yang mungkin mengandung video ini
        const listingCaches = await prisma.contentCache.findMany({
            where: {
                OR: [
                    { key: { startsWith: 'jav_latest_page_' } },
                    { key: { startsWith: 'jav_category_' } },
                    { key: 'homepage_categories' },
                ]
            },
            select: { key: true, data: true }
        });

        // 3. Untuk setiap cache, hapus video dengan id ini dari array videos
        const updates: Promise<any>[] = [];
        let shouldRefreshHomepage = false;
        const pagesToRefresh = new Set<number>();

        for (const cache of listingCaches) {
            try {
                const parsed = JSON.parse(cache.data);
                let changed = false;

                // Format: { videos: [...], totalPages, total }
                if (Array.isArray(parsed?.videos)) {
                    const before = parsed.videos.length;
                    parsed.videos = parsed.videos.filter((v: any) => {
                        const vId = v.href?.replace('jav/', '') || v.link?.split('/').pop();
                        return vId !== String(id);
                    });
                    if (parsed.videos.length < before) {
                        parsed.total = Math.max(0, (parsed.total || 0) - 1);
                        changed = true;
                    }
                }

                // Format: [{ title, videos: [...] }, ...] (homepage_categories)
                if (Array.isArray(parsed) && parsed[0]?.videos) {
                    for (const cat of parsed) {
                        if (Array.isArray(cat.videos)) {
                            const before = cat.videos.length;
                            cat.videos = cat.videos.filter((v: any) => {
                                const vId = v.href?.replace('jav/', '') || v.link?.split('/').pop();
                                return vId !== String(id);
                            });
                            if (cat.videos.length < before) changed = true;
                        }
                    }
                }

                if (changed) {
                    updates.push(
                        prisma.contentCache.update({
                            where: { key: cache.key },
                            data: { data: JSON.stringify(parsed) }
                        })
                    );
                    
                    // Tandai cache mana yang harus di-refresh di background untuk replenish slot yang kosong
                    if (cache.key === 'homepage_categories') {
                        shouldRefreshHomepage = true;
                    } else if (cache.key.startsWith('jav_latest_page_')) {
                        const pageNum = parseInt(cache.key.replace('jav_latest_page_', ''), 10);
                        if (!isNaN(pageNum)) pagesToRefresh.add(pageNum);
                    }
                }
            } catch (_) { /* skip cache yang corrupt */ }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
            console.log(`[JAV] Video ${id} dihapus dari ${updates.length} cache listing.`);
            
            // Trigger background refresh agar slot yang kosong terisi lagi
            if (shouldRefreshHomepage && typeof refreshHomepageCache === 'function') {
                refreshHomepageCache().catch(e => console.error("Error replenishing homepage:", e));
            }
            if (typeof refreshLatestVideosCache === 'function') {
                for (const page of pagesToRefresh) {
                    refreshLatestVideosCache(page).catch(e => console.error(`Error replenishing page ${page}:`, e));
                }
            }
        }
    } catch (e) {
        console.error('[JAV] removeVideoFromAllCaches error:', e);
    }
}

/** Ambil set ID video yang sudah ditandai bad dari daftar ID yang diberikan */
async function filterBadIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    try {
        const entries = await prisma.contentCache.findMany({
            where: { key: { in: ids.map(id => `jav_bad_${id}`) } },
            select: { key: true, updatedAt: true }
        });
        const badIds = new Set<string>();
        const now = Date.now();
        for (const e of entries) {
            if (now - new Date(e.updatedAt).getTime() < BAD_VIDEO_TTL) {
                badIds.add(e.key.replace('jav_bad_', ''));
            }
        }
        return badIds;
    } catch (_) { return new Set(); }
}

/** Solution B: Cari server dari sumber alternatif berdasarkan movie code */
async function getFallbackServers(movieCode: string): Promise<VideoServer[]> {
    if (!movieCode) return [];
    const servers: VideoServer[] = [];
    const code = movieCode.trim().toUpperCase();
    const codeLower = code.toLowerCase();

    // Fallback 1: jable.tv
    try {
        const jableUrl = `https://jable.tv/videos/${codeLower}/`;
        const html = await fetchWithTimeout(jableUrl, { timeout: 12000, retries: 1 });
        if (html) {
            // jable memakai HLS — wrap dalam proxy player kita
            const hlsMatch = html.match(/hlsUrl\s*=\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i) ||
                             html.match(/source\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
            if (hlsMatch) {
                servers.push({ name: 'Jable HD', iframe: `/api/hls-player?url=${encodeURIComponent(hlsMatch[1])}` });
            }
            // Juga cek iframe langsung
            const $j = cheerio.load(html);
            const iframeSrc = $j('iframe[src]').first().attr('src') || '';
            if (iframeSrc.startsWith('http') && !servers.some(s => s.iframe === iframeSrc)) {
                servers.push({ name: 'Jable Player', iframe: iframeSrc });
            }
        }
    } catch (_) { /* ignore */ }

    if (servers.length > 0) return servers;

    // Fallback 2: missav.ws
    try {
        const missavUrl = `https://missav.ws/en/${codeLower}`;
        const html = await fetchWithTimeout(missavUrl, { timeout: 12000, retries: 1 });
        if (html && !html.includes('404') && html.length > 5000) {
            // Cari m3u8 stream
            const m3u8Match = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
            if (m3u8Match) {
                servers.push({ name: 'Missav HD', iframe: `/api/hls-player?url=${encodeURIComponent(m3u8Match[1])}` });
            }
            const $m = cheerio.load(html);
            const iframeSrc = $m('iframe[src]').first().attr('src') || '';
            if (iframeSrc.startsWith('http') && !servers.some(s => s.iframe === iframeSrc)) {
                servers.push({ name: 'Missav Player', iframe: iframeSrc });
            }
        }
    } catch (_) { /* ignore */ }

    return servers;
}

// Interfaces to match lib/anime.ts
export interface AnimeLatest {
    title: string;
    image: string;
    link: string;
    episode: string;
    rating?: string;
    type: string;
    href: string;
}

export interface VideoServer {
    name: string;
    iframe: string;
}

export interface WatchPageData {
    title: string;
    poster: string;
    rating: string;
    episode: string;
    type: string;
    servers: VideoServer[];
    downloads: any[];
}

export interface AnimeDetail {
    title: string;
    originalTitle: string;
    synopsis: string;
    image: string;
    rating: string;
    status: string;
    studio: string;
    released: string;
    genres: string[];
    episodes: { title: string; link: string; eps: string; date: string }[];
}

export interface SearchResult {
    videos: AnimeLatest[];
    totalPages: number;
    total: number;
}

export interface HomepageCategory {
    id: number;
    title: string;
    videos: AnimeLatest[];
}

function cleanTitle(title: string): string {
    if (!title) return "";
    
    // 1. Extract JAV Codes (e.g., ABC-123, FC2-PPV-123456)
    const codeMatch = title.match(/[A-Z0-9]+-[A-Z0-9-]+/gi);
    const codes = codeMatch ? Array.from(new Set(codeMatch.map(c => c.toUpperCase()))) : [];
    
    // 2. Extract Quality Tags
    const qualityTags = [];
    if (/\bHD\b|HD(?=[A-Z0-9])/i.test(title)) qualityTags.push("HD");
    if (/\b4K\b/i.test(title)) qualityTags.push("4K");
    if (/\bVR\b/i.test(title)) qualityTags.push("VR");
    if (/\bFHD\b/i.test(title)) qualityTags.push("FHD");

    // If we found a code, prioritize it
    if (codes.length > 0) {
        // Take the first code and append quality tags
        const primaryCode = codes[0];
        return `${primaryCode} ${qualityTags.join(" ")}`.trim();
    }

    // Fallback: If no code found, just return original title but shorter
    return title.length > 50 ? title.substring(0, 50) + "..." : title;
}

async function fetchWithTimeout(url: string, options: any = {}) {
    const { timeout = 30000, retries = 3 } = options;
    
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    ...options.headers
                }
            });
            clearTimeout(id);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error: any) {
            clearTimeout(id);
            const isLastRetry = i === retries - 1;
            if (isLastRetry) throw error;
            
            // Wait before retry
            const delay = Math.pow(2, i) * 1000;
            console.warn(`Fetch failed for ${url}, retrying in ${delay}ms... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Resolves Nuxt 3 "devalue" format.
 */
function resolveNuxtData(data: any[]): any {
    if (!data || !data.length) return null;
    const cache = new Map();

    function walk(idx: any): any {
        if (idx === null || typeof idx !== 'number') return idx;
        if (cache.has(idx)) return cache.get(idx);

        const val = data[idx];
        if (Array.isArray(val)) {
            const res: any[] = [];
            cache.set(idx, res);
            for (const item of val) res.push(walk(item));
            return res;
        }
        if (val && typeof val === 'object') {
            const res: any = {};
            cache.set(idx, res);
            for (const key in val) res[key] = walk(val[key]);
            return res;
        }
        return val;
    }

    return walk(0);
}

function extractNuxtObject(html: string | undefined): any {
    if (!html) return null;
    const $ = cheerio.load(html);
    const scriptText = $('#__NUXT_DATA__').html();
    if (!scriptText) return null;
    try {
        const raw = JSON.parse(scriptText);
        const resolved = resolveNuxtData(raw);
        
        const rootObject = Array.isArray(resolved) && resolved[0] === 'ShallowReactive' ? resolved[1] : resolved;
        const dataObj = Array.isArray(rootObject?.data) && rootObject.data[0] === 'ShallowReactive' ? rootObject.data[1] : rootObject?.data;
        
        return dataObj;
    } catch (e) {
        console.error("Nuxt extract error:", e);
        return null;
    }
}

export async function getLatestVideos(page: number = 1): Promise<SearchResult> {
    const CACHE_KEY = `jav_latest_page_${page}`;
    const REVALIDATE_MS = 30 * 60 * 1000; // 30 minutes

    try {
        // 1. Try to get from cache
        const cached = await prisma.contentCache.findUnique({
            where: { key: CACHE_KEY }
        });

        if (cached) {
            const data = JSON.parse(cached.data) as SearchResult;
            const age = Date.now() - new Date(cached.updatedAt).getTime();

            // If fresh, return
            if (age < REVALIDATE_MS) {
                return data;
            }

            // If stale, refresh in background and return stale
            refreshLatestVideosCache(page).catch(err => console.error("BG refresh jav failed:", err));
            return data;
        }

        // 2. Fetch fresh
        return await refreshLatestVideosCache(page);
    } catch (error) {
        console.error('Error in getLatestVideos with cache:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

async function refreshLatestVideosCache(page: number): Promise<SearchResult> {
    try {
        const pageUrl = page === 1 ? `${SOURCE_URL}videos` : `${SOURCE_URL}videos?pg=${page}`;
        const html = await fetchWithTimeout(pageUrl);
        const dataObj = extractNuxtObject(html);
        
        const data = dataObj?.['explore-1'] || 
                     dataObj?.['explore-0'] || 
                     dataObj?.['latest'] ||
                     Object.values(dataObj || {}).find((v: any) => v?.list);

        const list = data?.list || [];
        const totalPages = data?.pagecount || 1;
        const total = data?.total || 0;

        const mapped = list.map((item: any) => ({
            title: cleanTitle(item.name || ''),
            image: item.poster_url || item.thumb_url || '',
            link: `https://nontonasik.my.id/jav-domain/videos/${item.id}`,
            episode: item.movie_code || '',
            rating: '0.0',
            type: 'JAV',
            href: `jav/${item.id}`
        }));

        // Solution A: filter video yang sudah ditandai bad
        const ids = list.map((item: any) => String(item.id));
        const badIds = await filterBadIds(ids);
        const videos = mapped.filter((_: any, i: number) => !badIds.has(String(list[i]?.id)));

        const result = { videos, totalPages, total: total - badIds.size };

        await prisma.contentCache.upsert({
            where: { key: `jav_latest_page_${page}` },
            update: { data: JSON.stringify(result), updatedAt: new Date() },
            create: { key: `jav_latest_page_${page}`, data: JSON.stringify(result) }
        });

        return result;
    } catch (error) {
        console.error('Error refreshing JAV latest cache:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}


export interface CategoryResult {
    videos: AnimeLatest[];
    totalPages: number;
    total: number;
}

export async function getVideosByCategory(categoryId: string, page: number = 1): Promise<CategoryResult> {
    try {
        const url = page === 1
            ? `${SOURCE_URL}categories/${categoryId}`
            : `${SOURCE_URL}categories/${categoryId}?pg=${page}`;
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);

        // Key pattern: "category-{id}-{page}"
        const key = `category-${categoryId}-${page}`;
        const data = dataObj?.[key] || Object.values(dataObj || {}).find((v: any) => v?.list);

        const list = data?.list || [];
        const totalPages = data?.pagecount || 1;
        const total = data?.total || 0;

        return {
            videos: list.map((item: any) => ({
                title: cleanTitle(item.name || ''),
                image: item.poster_url || item.thumb_url || '',
                link: `https://nontonasik.my.id/jav-domain/videos/${item.id}`,
                episode: item.movie_code || item.type_name || '',
                rating: '0.0',
                type: item.type_name || 'JAV',
                href: `jav/${item.id}`
            })),
            totalPages,
            total,
        };
    } catch (error) {
        console.error('Error scraping JAV category:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}




export async function getHomepageCategories(): Promise<HomepageCategory[]> {
    const CACHE_KEY = "homepage_categories";
    const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour

    try {
        // 1. Check DB Cache
        const cached = await prisma.contentCache.findUnique({
            where: { key: CACHE_KEY }
        });

        if (cached) {
            const data = JSON.parse(cached.data) as HomepageCategory[];
            const age = Date.now() - new Date(cached.updatedAt).getTime();

            // If cache is fresh, return it
            if (age < REVALIDATE_MS) {
                return data;
            }

            // If cache is stale, trigger background refresh and return stale data (SWR)
            console.log(`Cache stale for ${CACHE_KEY} (${Math.round(age/1000/60)}m old), refreshing in background...`);
            refreshHomepageCache().catch(err => console.error("Background refresh failed:", err));
            return data;
        }

        // 2. No cache found, must fetch now
        return await refreshHomepageCache();
    } catch (error) {
        console.error('Error in getHomepageCategories with cache:', error);
        return [];
    }
}

async function refreshHomepageCache(): Promise<HomepageCategory[]> {
    const TARGET_CATEGORIES = [
        "Beautiful Breasts",
        "Creampie",
        "Blowjob",
        "Censored",
        "Uncensored",
        "Slender",
        "Beautiful Girl",
        "Amateur",
        "Chinese AV",
        "Big Boobs"
    ];

    try {
        const results = await Promise.all(TARGET_CATEGORIES.map(async (tag) => {
            try {
                const searchResults = await searchJav(tag, 1);
                if (searchResults.videos.length > 0) {
                    return {
                        title: tag,
                        videos: searchResults.videos.slice(0, 10)
                    };
                }
            } catch (e) {
                console.error(`Error fetching category ${tag}:`, e);
            }
            return null;
        }));

        const fetchedCategories = results.filter((c): c is HomepageCategory => c !== null);
        
        if (fetchedCategories.length > 0) {
            await prisma.contentCache.upsert({
                where: { key: "homepage_categories" },
                update: {
                    data: JSON.stringify(fetchedCategories),
                    updatedAt: new Date()
                },
                create: {
                    key: "homepage_categories",
                    data: JSON.stringify(fetchedCategories)
                }
            });
        }

        return fetchedCategories;
    } catch (error) {
        console.error('Error refreshing homepage cache:', error);
        return [];
    }
}


export async function getJavDetail(id: string): Promise<AnimeDetail | null> {
    try {
        const url = `${SOURCE_URL}videos/${id}`;
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);
        
        const video = dataObj?.[`video-detail-${id}`] || 
                      Object.values(dataObj || {}).find((v: any) => v?.id == id && v?.movie_code);
        
        if (!video) return null;

        return {
            title: cleanTitle(video.name),
            originalTitle: video.movie_code,
            synopsis: video.description || `Watch ${video.name} (${video.movie_code}) in HD quality.`,
            image: video.poster_url || video.thumb_url || '',
            rating: '0.0',
            status: 'Completed',
            studio: video.studio || 'N/A',
            released: video.year || '',
            genres: video.category || [],
            episodes: [
                {
                    title: `Full Movie - ${video.movie_code}`,
                    link: url,
                    eps: '1',
                    date: video.vod_time || ''
                }
            ]
        };
    } catch (error) {
        console.error('Error scraping JAV detail:', error);
        return null;
    }
}

/**
 * Ekstrak semua iframe/embed URL dari string HTML secara agresif.
 * Ini adalah safety net jika semua metode lain gagal.
 */
function extractIframesFromHtml(html: string): string[] {
    const results: string[] = [];
    // Match <iframe src="..."> dan variasi lazy loading
    const iframeRegex = /<iframe[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi;
    let match;
    while ((match = iframeRegex.exec(html)) !== null) {
        const src = match[1];
        if (src && src.startsWith('http') && !src.includes('google') && !src.includes('facebook')) {
            results.push(src);
        }
    }
    // Match link_embed atau embed_url di dalam script tags
    const embedRegex = /(?:link_embed|embed_url|iframe_src|play_url|stream_url)["']?:\s*["']([^"']+)["']/gi;
    while ((match = embedRegex.exec(html)) !== null) {
        const src = match[1];
        if (src && src.startsWith('http') && !results.includes(src)) {
            results.push(src);
        }
    }
    return results;
}

/**
 * Deep search semua nilai dalam object Nuxt yang terlihat seperti iframe/embed URL.
 */
function deepFindEmbedUrls(obj: any, visited = new Set<any>()): string[] {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) return [];
    visited.add(obj);

    const results: string[] = [];
    const embedKeys = ['link_embed', 'embed_url', 'play_url', 'url', 'iframe', 'stream_url', 'video_url', 'file'];

    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'string' && val.startsWith('http') && (
            val.includes('embed') || val.includes('player') || val.includes('iframe') ||
            val.includes('.mp4') || val.includes('stream') || val.includes('video')
        )) {
            if (embedKeys.includes(key.toLowerCase()) || val.length > 20) {
                results.push(val);
            }
        } else if (typeof val === 'object') {
            results.push(...deepFindEmbedUrls(val, visited));
        }
    }
    return [...new Set(results)];
}

export async function getJavWatchData(id: string): Promise<WatchPageData | null> {
    try {
        const url = `${SOURCE_URL}videos/${id}`;
        const html = await fetchWithTimeout(url);
        if (!html) return null;

        const dataObj = extractNuxtObject(html);
        const servers: VideoServer[] = [];
        let video: any = null;

        // ── Strategi 1: Key canonical `video-detail-{id}` ──
        if (dataObj) {
            video = dataObj[`video-detail-${id}`];

            // ── Strategi 2: Scan semua values, cari yang punya id atau movie_code ──
            if (!video) {
                video = Object.values(dataObj).find((v: any) =>
                    v && typeof v === 'object' && (
                        String(v?.id) === String(id) ||
                        v?.movie_code
                    ) && (v?.name || v?.title)
                );
            }

            // ── Strategi 3: Cari object apa saja yang punya embed/play URL ──
            if (!video) {
                const allEmbeds = deepFindEmbedUrls(dataObj);
                for (const embed of allEmbeds) {
                    if (!servers.some(s => s.iframe === embed)) {
                        servers.push({ name: `Server ${servers.length + 1}`, iframe: embed });
                    }
                }
            }
        }

        // Ekstrak server dari object video yang ditemukan
        if (video) {
            // play_url / url langsung
            for (const field of ['play_url', 'url', 'embed_url', 'stream_url', 'video_url']) {
                if (video[field] && typeof video[field] === 'string' && video[field].startsWith('http')) {
                    if (!servers.some(s => s.iframe === video[field])) {
                        servers.push({ name: 'Server 1', iframe: video[field] });
                    }
                }
            }

            // episodes.server_data (struktur lama)
            if (video.episodes?.server_data && typeof video.episodes.server_data === 'object') {
                const serverData = video.episodes.server_data;
                let serverIdx = servers.length + 1;
                for (const key of Object.keys(serverData)) {
                    const ep = serverData[key];
                    const embedUrl = ep?.link_embed || ep?.url || ep?.iframe;
                    if (embedUrl && !servers.some(s => s.iframe === embedUrl)) {
                        servers.push({
                            name: `${video.episodes.server_name || 'Server'} ${serverIdx}`,
                            iframe: embedUrl
                        });
                        serverIdx++;
                    }
                }
            }

            // episodes sebagai array
            if (Array.isArray(video.episodes)) {
                let serverIdx = servers.length + 1;
                for (const ep of video.episodes) {
                    const embedUrl = ep?.link_embed || ep?.url || ep?.embed_url;
                    if (embedUrl && !servers.some(s => s.iframe === embedUrl)) {
                        servers.push({ name: `Server ${serverIdx}`, iframe: embedUrl });
                        serverIdx++;
                    }
                }
            }

            // Deep search seluruh object video
            if (servers.length === 0) {
                const deepUrls = deepFindEmbedUrls(video);
                for (const embed of deepUrls) {
                    if (!servers.some(s => s.iframe === embed)) {
                        servers.push({ name: `Server ${servers.length + 1}`, iframe: embed });
                    }
                }
            }
        }

        // ── Strategi 4: Parse HTML langsung (fallback agresif) ──
        if (servers.length === 0) {
            const $ = cheerio.load(html);
            $('iframe').each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
                if (src && src.startsWith('http') && !servers.some(s => s.iframe === src)) {
                    servers.push({ name: `Server ${servers.length + 1}`, iframe: src });
                }
            });
        }

        // ── Strategi 5: Regex scan seluruh HTML untuk embed URL ──
        if (servers.length === 0) {
            const htmlEmbeds = extractIframesFromHtml(html);
            for (const embed of htmlEmbeds) {
                if (!servers.some(s => s.iframe === embed)) {
                    servers.push({ name: `Server ${servers.length + 1}`, iframe: embed });
                }
            }
        }

        // ── Solution B: Fallback ke sumber lain jika masih kosong ──
        if (servers.length === 0 && video?.movie_code) {
            console.log(`[JAV] Primary empty, trying fallback for ${video.movie_code}...`);
            const fallback = await getFallbackServers(video.movie_code);
            servers.push(...fallback);
        }

        // ── Hapus dari semua listing cache secara langsung ──
        if (servers.length === 0) {
            console.warn(`[JAV] Tidak ada server untuk id=${id}. Menghapus dari semua cache listing...`);
            removeVideoFromAllCaches(id).catch(() => {});
            return null;
        }

        // Susun downloads
        const downloads: any[] = [];
        const primaryUrl = video?.play_url || video?.url || servers[0]?.iframe || '';
        if (primaryUrl) {
            downloads.push({
                format: 'Premium HD',
                links: [{ name: 'Direct Download', link: primaryUrl }]
            });
        }

        return {
            title: cleanTitle(video?.name || video?.title || `JAV ${id}`),
            poster: video?.poster_url || video?.thumb_url || video?.cover || '',
            rating: '0.0',
            episode: video?.movie_code || id,
            type: 'JAV',
            servers,
            downloads
        };
    } catch (error) {
        console.error('Error scraping JAV watch data:', error);
        return null;
    }
}

export interface SearchResult {
    videos: AnimeLatest[];
    totalPages: number;
    total: number;
}

export function getSlugFromUrl(url: string | undefined): string {
    if (!url) return '';
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://cuanflix.site/${url.replace(/^\/+/, '')}`);
        return urlObj.pathname.replace(/^\/+|\/+$/g, '');
    } catch (e) {
        return url.replace(/^\/+|\/+$/g, '');
    }
}

export async function searchJav(query: string, page: number = 1): Promise<SearchResult> {
    try {
        const url = page === 1 
            ? `${SOURCE_URL}search?q=${encodeURIComponent(query)}`
            : `${SOURCE_URL}search?q=${encodeURIComponent(query)}&pg=${page}`;
            
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);
        
        // Key pattern: "search-{query}-{page}"
        const key = `search-${query}-${page}`;
        const data = dataObj?.[key];

        if (!data) {
            console.warn(`Specific search key "${key}" not found in Nuxt data. Falling back to find first list...`);
        }

        const finalData = data || Object.values(dataObj || {}).find((v: any) => v?.list && v?.query === query) || Object.values(dataObj || {}).find((v: any) => v?.list);

        const list = finalData?.list || [];
        const totalPages = finalData?.pagecount || 1;
        const total = finalData?.total || 0;

        // Solution A: filter bad videos dari search results
        const ids = list.map((item: any) => String(item.id));
        const badIds = await filterBadIds(ids);

        return {
            videos: list
                .filter((item: any) => !badIds.has(String(item.id)))
                .map((item: any) => ({
                    title: cleanTitle(item.name || ''),
                    image: item.poster_url || item.thumb_url || '',
                    link: `https://nontonasik.my.id/jav-domain/videos/${item.id}`,
                    episode: item.movie_code || item.type_name || '',
                    rating: '0.0',
                    type: item.type_name || 'JAV',
                    href: `jav/${item.id}`
                })),
            totalPages,
            total,
        };
    } catch (error) {
        console.error('Error searching JAV:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

