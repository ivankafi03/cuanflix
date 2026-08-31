import * as cheerio from 'cheerio';
import prisma from "./prisma";
import { SearchResult, HomepageCategory, AnimeLatest, WatchPageData, VideoServer } from './jav';
import { encryptStreamToken } from './token';

const SOURCE_URL = "https://www.xnxx.com";

/**
 * Fetch HTML with retries and timeout
 */
async function fetchWithTimeout(url: string, options: any = {}) {
    const { timeout = 15000, retries = 2 } = options;
    
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
            
            if (error.message === 'fetch failed' || error.name === 'TypeError') {
                console.warn(`[XNXX] Access blocked by ISP for ${url}.`);
                return null;
            }

            const isLastRetry = i === retries - 1;
            if (isLastRetry) throw error;
            
            const delay = Math.pow(2, i) * 1000;
            console.warn(`[XNXX] Fetch failed for ${url}, retrying in ${delay}ms... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Parse a standard XNXX video listing page
 */
function parseXNXXListing(html: string): AnimeLatest[] {
    const $ = cheerio.load(html);
    const videos: AnimeLatest[] = [];

    $('.thumb-block').each((i, el) => {
        const $el = $(el);
        const $a = $el.find('.thumb a');
        const $img = $el.find('.thumb img');
        
        let link = $a.attr('href');
        if (!link) return;
        
        let idMatch = link.match(/\/video-([a-zA-Z0-9]+)\//);
        if (!idMatch && link.startsWith('/video')) {
            const parts = link.split('/');
            const videoPart = parts.find(p => p.startsWith('video'));
            if (videoPart) {
                idMatch = videoPart.match(/video-([a-zA-Z0-9]+)/);
            }
        }
        
        const videoId = idMatch ? idMatch[1] : link.replace('/', '');
        if (!videoId) return;

        let title = $el.find('.thumb-under p.title a').text().trim() 
                 || $el.find('p.title a').text().trim()
                 || $el.find('a[title]').attr('title')
                 || $img.attr('title') 
                 || $img.attr('alt') 
                 || '';

        if (!title || title === 'Unknown Title') {
            const slugTitle = link.split('/video-')[1]?.split('/')[1];
            if (slugTitle) {
                title = slugTitle.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else {
                title = `Video ${videoId}`;
            }
        }
                 
        let image = $img.attr('data-src') || $img.attr('src') || '';
        if (image && image.startsWith('/')) {
            image = SOURCE_URL + image;
        }

        let duration = $el.find('.metadata').text().trim() || $el.find('.video-hd').text().trim() || '';

        videos.push({
            title: title.length > 60 ? title.substring(0, 60) + '...' : title,
            image,
            episode: duration || 'HD',
            rating: '0.0',
            type: 'Video',
            href: `xnxx/${videoId}`
        });
    });

    return videos;
}

/**
 * Get categories for Homepage
 */
export async function getXNXXCategories(): Promise<HomepageCategory[]> {
    const CACHE_KEY = "homepage_categories_xnxx_v2";
    const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour

    try {
        const cached = await prisma.contentCache.findUnique({
            where: { key: CACHE_KEY }
        });

        if (cached) {
            const data = JSON.parse(cached.data) as HomepageCategory[];
            const age = Date.now() - new Date(cached.updatedAt).getTime();

            if (age < REVALIDATE_MS) return data;

            refreshHomepageCache().catch(err => console.error("[XNXX] Background refresh failed:", err));
            return data;
        }

        return await refreshHomepageCache();
    } catch (error) {
        console.error('[XNXX] Error in getXNXXCategories:', error);
        return [];
    }
}

async function refreshHomepageCache(): Promise<HomepageCategory[]> {
    const categories = [
        { name: "Video Terpopuler", path: "/best" },
        { name: "Koleksi Asia", path: "/search/asian" },
        { name: "Koleksi Amatir", path: "/search/amateur" },
    ];

    try {
        const results = await Promise.all(categories.map(async (cat, idx) => {
            try {
                const url = `${SOURCE_URL}${cat.path}`;
                const html = await fetchWithTimeout(url);
                if (html) {
                    const videos = parseXNXXListing(html);
                    if (videos.length > 0) {
                        return {
                            id: idx + 100,
                            title: cat.name,
                            videos: videos.slice(0, 12)
                        };
                    }
                }
            } catch (e) {
                console.error(`[XNXX] Error fetching category ${cat.name}:`, e);
            }
            return null;
        }));

        const fetchedCategories = results.filter((c): c is HomepageCategory => c !== null);
        
        if (fetchedCategories.length > 0) {
            await prisma.contentCache.upsert({
                where: { key: "homepage_categories_xnxx_v2" },
                update: {
                    data: JSON.stringify(fetchedCategories),
                    updatedAt: new Date()
                },
                create: {
                    key: "homepage_categories_xnxx_v2",
                    data: JSON.stringify(fetchedCategories)
                }
            });
        }

        return fetchedCategories;
    } catch (error) {
        console.error('[XNXX] Error refreshing homepage cache:', error);
        return [];
    }
}

/**
 * Search XNXX videos
 */
export async function searchXNXX(query: string, page: number = 1): Promise<SearchResult> {
    try {
        const url = `${SOURCE_URL}/search/${encodeURIComponent(query)}/${page}`;
        const html = await fetchWithTimeout(url);
        if (!html) return { videos: [], totalPages: 1, total: 0 };

        const videos = parseXNXXListing(html);
        const totalPages = videos.length > 0 ? page + 2 : page; 
        
        return {
            videos,
            totalPages,
            total: videos.length * totalPages
        };
    } catch (error) {
        console.error('[XNXX] Error searching:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

/**
 * Get Watch Page Data (Servers and Details) with Masked Encrypted Tokens
 */
export async function getXNXXWatchData(id: string): Promise<WatchPageData | null> {
    try {
        const url = `${SOURCE_URL}/video-${id}/cuanflix`;
        let html;
        try {
            html = await fetchWithTimeout(url);
        } catch (e) {
            console.warn("[XNXX] Could not fetch detail page, using fallback player generation.");
        }

        let title = `Video ${id}`;
        let poster = '';
        
        if (html) {
            const $ = cheerio.load(html);
            title = $('meta[property="og:title"]').attr('content') || $('title').text() || title;
            poster = $('meta[property="og:image"]').attr('content') || '';
            
            title = title.replace(/- XNXX\.COM/i, '').trim();
        }

        const rawServer1 = `https://www.xnxx.com/embedframe/${id}`;
        const rawServer2 = `https://www.xnxx.tv/embedframe/${id}`;
        const rawServer3 = `https://www.xnxx.com.es/embedframe/${id}`;
        const rawServer4 = `https://www.xvideos.com/embedframe/${id}`;

        const servers: VideoServer[] = [
            { name: "Server HD (Utama)", iframe: `/embed-player/${encryptStreamToken(rawServer1)}` },
            { name: "Server HD (Cadangan)", iframe: `/embed-player/${encryptStreamToken(rawServer2)}` },
            { name: "Server HD (Server 3)", iframe: `/embed-player/${encryptStreamToken(rawServer3)}` },
            { name: "Server HD (Server 4)", iframe: `/embed-player/${encryptStreamToken(rawServer4)}` }
        ];

        return {
            title,
            poster,
            rating: '0.0',
            episode: id,
            type: 'Video',
            servers,
            downloads: []
        };

    } catch (error) {
        console.error('[XNXX] Error getting watch data:', error);
        return null;
    }
}
