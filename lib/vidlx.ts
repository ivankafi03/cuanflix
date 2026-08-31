import * as cheerio from 'cheerio';
import prisma from "./prisma";
import { SearchResult, HomepageCategory, AnimeLatest, WatchPageData, VideoServer } from './jav';
import { encryptStreamToken } from './token';

const SOURCE_URL = "https://vidlx.fun";

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
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                    ...options.headers
                }
            });
            clearTimeout(id);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error: any) {
            clearTimeout(id);
            
            if (error.message === 'fetch failed' || error.name === 'TypeError') {
                console.warn(`[Vidlx] Access failed for ${url}.`);
                return null;
            }

            const isLastRetry = i === retries - 1;
            if (isLastRetry) throw error;
            
            const delay = Math.pow(2, i) * 1000;
            console.warn(`[Vidlx] Fetch failed for ${url}, retrying in ${delay}ms... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function cleanVidlxTitle(str: string): string {
    if (!str) return "";
    return str
        .replace(/[-|_|\s]*vidlx\.fun/gi, '')
        .replace(/[-|_|\s]*vidlx/gi, '')
        .replace(/[-|_|\s]*bokepindo/gi, '')
        .replace(/[-|_|\s]*nontonasik/gi, '')
        .replace(/[-|_|\s]*videy\.co/gi, '')
        .replace(/[-|_|\s]*[a-zA-Z0-9-]+\.(fun|com|co|net|org|xyz|site|club|vip|my\.id)/gi, '')
        .replace(/^[\s\-_:=]+|[\s\-_:=]+$/g, '')
        .trim();
}

/**
 * Parse a standard video listing page with strict HD image extraction & filtering
 */
function parseVidlxListing(html: string): AnimeLatest[] {
    const $ = cheerio.load(html);
    const videos: AnimeLatest[] = [];

    $('a.card').each((i, el) => {
        const href = $(el).attr('href') || '';
        const slugMatch = href.match(/slug=([^&]+)/);
        const slug = slugMatch ? slugMatch[1] : '';
        if (!slug) return;

        const rawTitle = $(el).find('.card-title').text().trim() || $(el).attr('title') || '';
        const title = cleanVidlxTitle(rawTitle);
        if (!title) return;

        const $img = $(el).find('img');
        let image = $img.attr('data-src') 
                 || $img.attr('data-lazy-src') 
                 || $img.attr('data-original')
                 || $img.attr('srcset')
                 || $img.attr('src') 
                 || '';

        if (image.startsWith('data:image')) {
            const onerror = $img.attr('onerror') || '';
            const match = onerror.match(/https?%3A%2F%2F[^'"]+/i) || onerror.match(/https?:\/\/[^'"]+/i);
            if (match) {
                image = decodeURIComponent(match[0]);
            }
        }

        if (!image || image.includes('No Thumbnail') || image.includes('w3.org/2000/svg') || image.startsWith('data:')) {
            return;
        }

        const duration = $(el).find('.duration').text().trim() || 'HD';

        videos.push({
            title: title.length > 70 ? title.substring(0, 70) + '...' : title,
            image,
            episode: duration,
            rating: '0.0',
            type: 'Video',
            href: `vidlx/${slug}`
        });
    });

    return videos;
}

/**
 * Get page (with optional category)
 */
export async function getVidlxPage(page: number = 1, category?: string): Promise<SearchResult> {
    try {
        let url = `${SOURCE_URL}/?page=${page}`;
        if (category) {
            url = `${SOURCE_URL}/?category=${encodeURIComponent(category)}&page=${page}`;
        }
        const html = await fetchWithTimeout(url);
        if (!html) return { videos: [], totalPages: 1, total: 0 };

        const videos = parseVidlxListing(html);
        
        const $ = cheerio.load(html);
        let totalPages = page;
        $('a[href*="page="]').each((i, el) => {
            const href = $(el).attr('href') || '';
            const match = href.match(/page=(\d+)/);
            if (match) {
                const pVal = parseInt(match[1], 10);
                if (pVal > totalPages) totalPages = pVal;
            }
        });

        return {
            videos,
            totalPages,
            total: videos.length * totalPages
        };
    } catch (error) {
        console.error('[Vidlx] Error getting page:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

/**
 * Search videos with smart multi-fallback (index?q, ?category=cleanSlug, ?category=hyphenated)
 */
export async function searchVidlx(query: string, page: number = 1): Promise<SearchResult> {
    try {
        const cleanSlug = query.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        let url = `${SOURCE_URL}/index?q=${encodeURIComponent(query)}&page=${page}`;
        let html = await fetchWithTimeout(url);
        let videos = html ? parseVidlxListing(html) : [];

        if (videos.length === 0 && cleanSlug) {
            url = `${SOURCE_URL}/?category=${encodeURIComponent(cleanSlug)}&page=${page}`;
            html = await fetchWithTimeout(url);
            if (html) {
                videos = parseVidlxListing(html);
            }
        }

        if (videos.length === 0 && (query.includes(" ") || query.includes("_"))) {
            const hyphenSlug = query.toLowerCase().replace(/[\s_]+/g, '-');
            url = `${SOURCE_URL}/?category=${encodeURIComponent(hyphenSlug)}&page=${page}`;
            html = await fetchWithTimeout(url);
            if (html) {
                videos = parseVidlxListing(html);
            }
        }

        const $ = cheerio.load(html || '');
        let totalPages = page;
        $('a[href*="page="]').each((i, el) => {
            const href = $(el).attr('href') || '';
            const match = href.match(/page=(\d+)/);
            if (match) {
                const pVal = parseInt(match[1], 10);
                if (pVal > totalPages) totalPages = pVal;
            }
        });

        return {
            videos,
            totalPages,
            total: videos.length * totalPages
        };
    } catch (error) {
        console.error('[Vidlx] Error searching videos:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

/**
 * Get categories for Homepage
 */
export async function getVidlxCategories(): Promise<HomepageCategory[]> {
    const CACHE_KEY = "homepage_categories_vidlx_v3";
    const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour

    try {
        const cached = await prisma.contentCache.findUnique({
            where: { key: CACHE_KEY }
        });

        if (cached) {
            const data = JSON.parse(cached.data) as HomepageCategory[];
            const age = Date.now() - new Date(cached.updatedAt).getTime();

            if (age < REVALIDATE_MS) return data;

            refreshHomepageCache().catch(err => console.error("[Vidlx] Background refresh failed:", err));
            return data;
        }

        return await refreshHomepageCache();
    } catch (error) {
        console.error('[Vidlx] Error in getVidlxCategories:', error);
        return [];
    }
}

async function refreshHomepageCache(): Promise<HomepageCategory[]> {
    const categories = [
        { name: "Indo Terbaru", fn: () => getVidlxPage(1, "indohotnew") },
        { name: "Indo SMA", fn: () => getVidlxPage(1, "sma") },
        { name: "Indo Viral", fn: () => searchVidlx("viral", 1) },
        { name: "Bokep Barat", fn: () => searchVidlx("barat", 1) }
    ];

    try {
        const results = await Promise.all(categories.map(async (cat, idx) => {
            try {
                const result = await cat.fn();
                if (result.videos.length > 0) {
                    return {
                        id: idx + 200,
                        title: cat.name,
                        videos: result.videos.slice(0, 8)
                    };
                }
            } catch (e) {
                console.error(`[Vidlx] Error fetching category ${cat.name}:`, e);
            }
            return null;
        }));

        const fetchedCategories = results.filter((c): c is HomepageCategory => c !== null);
        
        if (fetchedCategories.length > 0) {
            await prisma.contentCache.upsert({
                where: { key: "homepage_categories_vidlx_v3" },
                update: {
                    data: JSON.stringify(fetchedCategories),
                    updatedAt: new Date()
                },
                create: {
                    key: "homepage_categories_vidlx_v3",
                    data: JSON.stringify(fetchedCategories)
                }
            });
        }

        return fetchedCategories;
    } catch (error) {
        console.error('[Vidlx] Error refreshing homepage cache:', error);
        return [];
    }
}

/**
 * Get Watch Page Data (Servers and Details) with Masked Encrypted Tokens
 */
export async function getVidlxWatchData(slug: string): Promise<WatchPageData | null> {
    try {
        const detailUrl = `${SOURCE_URL}/detail?slug=${slug}`;
        const detailHtml = await fetchWithTimeout(detailUrl);
        if (!detailHtml) return null;

        const $ = cheerio.load(detailHtml);
        const title = cleanVidlxTitle($('title').text());
        
        let poster = '';
        const $img = $('.video-thumbnail img, .thumb img, img.loaded').first();
        if ($img.length > 0) {
            poster = $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('src') || '';
            if (poster.startsWith('data:')) poster = '';
        }

        const playerIframeUrl = `${SOURCE_URL}/player.php?slug=${slug}&source=upload2`;
        let directStreamUrl = '';
        
        try {
            const playerHtml = await fetchWithTimeout(playerIframeUrl, {
                headers: {
                    'Referer': detailUrl
                }
            });
            if (playerHtml) {
                const match = playerHtml.match(/videoSrc\s*=\s*['"]([^'"]+)['"]/i) || 
                              playerHtml.match(/src\s*:\s*['"]([^'"]+)['"]/i) ||
                              playerHtml.match(/source\s+src=['"]([^'"]+)['"]/i);
                if (match) {
                    directStreamUrl = match[1];
                }
            }
        } catch (e) {
            console.warn("[Vidlx] Failed to extract direct stream URL, falling back to iframe.");
        }

        const servers: VideoServer[] = [];
        if (directStreamUrl) {
            const rawMainUrl = `/api/hls-player?url=${encodeURIComponent(directStreamUrl)}`;
            servers.push({
                name: "Server HD (Utama)",
                iframe: `/embed-player/${encryptStreamToken(rawMainUrl)}`
            });
        }

        const rawBackupUrl = playerIframeUrl;
        servers.push({
            name: "Server HD (Cadangan)",
            iframe: `/embed-player/${encryptStreamToken(rawBackupUrl)}`
        });

        return {
            title,
            poster,
            rating: '0.0',
            episode: slug,
            type: 'Video',
            servers,
            downloads: []
        };
    } catch (error) {
        console.error('[Vidlx] Error in getVidlxWatchData:', error);
        return null;
    }
}
