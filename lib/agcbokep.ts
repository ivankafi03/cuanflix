import * as cheerio from 'cheerio';
import prisma from './prisma';

const SOURCE_URL = 'https://demo.agcbokep.com';
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 jam

interface AgcVideo {
    title: string;
    image: string;
    href: string;
    episode?: string;
    type: string;
}

interface VideoServer {
    name: string;
    iframe: string;
}

async function fetchPage(url: string, referer?: string): Promise<string | null> {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': referer || SOURCE_URL,
            },
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
            console.warn(`[AGC] HTTP ${res.status} for ${url}`);
            return null;
        }
        return await res.text();
    } catch (e: any) {
        console.warn(`[AGC] Fetch failed for ${url}: ${e.message}`);
        return null;
    }
}

/**
 * Scrape halaman utama untuk mendapatkan daftar video
 */
async function scrapeHomepage(): Promise<AgcVideo[]> {
    const html = await fetchPage(SOURCE_URL);
    if (!html) return [];

    const $ = cheerio.load(html);
    const videos: AgcVideo[] = [];

    // Struktur: .video-list .video-card
    $('.video-list .video-card, .video-card').each((_, el) => {
        const $el = $(el);

        const href = $el.attr('href') || $el.find('a').first().attr('href') || '';
        if (!href) return;

        const title = (
            $el.find('.title').first().text().trim() ||
            $el.find('h3, h4, [class*="title"]').first().text().trim() ||
            $el.attr('title') || ''
        ).replace(/\s+/g, ' ').trim();

        if (!title || title.length < 3) return;

        const image = (
            $el.find('.thumbnail').first().attr('src') ||
            $el.find('.thumbnail').first().attr('data-src') ||
            $el.find('img').first().attr('src') ||
            $el.find('img').first().attr('data-src') ||
            ''
        );

        const duration = $el.find('.duration').text().trim();

        // Buat slug dari href: ambil parameter v= jika ada
        const vMatch = href.match(/v=([^&]+)/);
        const cleanHref = vMatch ? vMatch[1] : href.replace(SOURCE_URL, '').replace(/^\/+|\/+$/g, '').replace('watch/', '');

        if (!cleanHref) return;

        videos.push({
            title,
            image,
            href: `agc/${cleanHref}`,
            episode: duration || '',
            type: 'Video',
        });
    });

    // Fallback: Cari semua link yang mengandung /watch/?v=
    if (videos.length === 0) {
        $('a[href*="/watch/?v="]').each((_, el) => {
            const $el = $(el);
            const href = $el.attr('href') || '';
            const title = $el.text().trim() || $el.attr('title') || '';
            
            // Coba cari gambar di dalam <a>, parent, atau previous sibling
            const $img = $el.find('img').first();
            let image = $img.attr('data-src') || $img.attr('src') || '';
            
            // Jika tidak ada gambar di dalam <a>, cari di DOM terdekat
            if (!image) {
                const $parent = $el.parent();
                image = $parent.find('img').attr('data-src') || $parent.find('img').attr('src') || '';
            }

            const vMatch = href.match(/v=([^&]+)/);
            if (vMatch && title.length > 3 && !videos.find(v => v.href === `agc/${vMatch[1]}`)) {
                videos.push({
                    title,
                    image: image || '/placeholder-poster.png', // Gambar default jika gagal
                    href: `agc/${vMatch[1]}`,
                    episode: '',
                    type: 'Video',
                });
            }
        });
    }

    console.log(`[AGC] Found ${videos.length} videos from homepage`);
    return videos.slice(0, 24);
}

/**
 * Scrape halaman video untuk mendapatkan embed URL / M3U8
 */
export async function getAgcWatchData(slug: string): Promise<{
    title: string;
    poster: string;
    servers: VideoServer[];
    type: string;
    rating: string;
    episode: string;
} | null> {
    const cacheKey = `agc_watch_${slug}`;
    
    // Cek cache
    try {
        const cached = await prisma.contentCache.findUnique({ where: { key: cacheKey } });
        if (cached) {
            const data = JSON.parse(cached.data);
            const age = Date.now() - new Date(cached.updatedAt).getTime();
            if (age < CACHE_TTL) return data;
        }
    } catch {}

    const url = `${SOURCE_URL}/watch/?v=${slug}`;
    const html = await fetchPage(url);
    if (!html) return null;

    const $ = cheerio.load(html);

    const title = (
        $('h1, h2, .title, [class*="title"]').first().text().trim() ||
        $('title').text().replace(/[|\-–].*/,'').trim()
    ).replace(/\s+/g, ' ').trim() || slug;

    const poster = (
        $('meta[property="og:image"]').attr('content') ||
        $('img.poster, img.thumbnail, [class*="poster"]').first().attr('src') || ''
    );

    const servers: VideoServer[] = [];

    // 1. Cari semua iframe
    $('iframe[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (!src) return;

        if (src.includes('dood') || src.includes('dood.la') || src.includes('dood.re') || src.includes('dood.pm')) {
            servers.push({ name: 'Doodstream', iframe: src });
        } else if (src.includes('filemoon') || src.includes('fmplayer')) {
            servers.push({ name: 'Filemoon', iframe: src });
        } else if (src.includes('streamwish') || src.includes('wish')) {
            servers.push({ name: 'StreamWish', iframe: src });
        } else if (src.includes('yourupload') || src.includes('your-upload')) {
            servers.push({ name: 'YourUpload', iframe: src });
        } else if (src.includes('mp4upload')) {
            servers.push({ name: 'MP4Upload', iframe: src });
        } else {
            servers.push({ name: 'Server 1', iframe: src });
        }
    });

    // 2. Cari link m3u8 atau video langsung di script tags
    $('script').each((_, el) => {
        const text = $(el).html() || '';
        
        // Cari URL m3u8
        const m3u8Match = text.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/);
        if (m3u8Match) {
            const m3u8Url = m3u8Match[0].replace(/\\n|\\t|\\r|\\|;.*$/g, '');
            // Bungkus dalam proxy VPS
            const proxied = `/api/hls-player?url=${encodeURIComponent(`/api/proxy/m3u8?url=${encodeURIComponent(m3u8Url)}`)}`;
            servers.push({ name: 'HD Stream (Proxy)', iframe: proxied });
        }

        // Cari Doodstream ID
        const doodMatch = text.match(/(?:dood\.la|dood\.re|dood\.pm|doods\.pro)\/(?:e|d)\/([a-z0-9]+)/i);
        if (doodMatch) {
            servers.push({ name: 'Doodstream', iframe: `https://dood.la/e/${doodMatch[1]}` });
        }
    });

    // 3. Cari di source tag
    $('source[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (src.includes('.m3u8')) {
            const proxied = `/api/hls-player?url=${encodeURIComponent(`/api/proxy/m3u8?url=${encodeURIComponent(src)}`)}`;
            servers.push({ name: 'HD Stream', iframe: proxied });
        } else if (src.includes('.mp4')) {
            servers.push({ name: 'MP4 Direct', iframe: src });
        }
    });

    if (servers.length === 0) return null;

    const result = { title, poster, servers, type: 'Video', rating: '0.0', episode: '' };

    // Simpan ke cache
    try {
        await prisma.contentCache.upsert({
            where: { key: cacheKey },
            update: { data: JSON.stringify(result), updatedAt: new Date() },
            create: { key: cacheKey, data: JSON.stringify(result) },
        });
    } catch {}

    return result;
}

/**
 * Ambil kategori untuk beranda dari demo.agcbokep.com
 */
export async function getAgcCategories(): Promise<{ title: string; videos: AgcVideo[] }[]> {
    const cacheKey = 'agc_homepage';

    // Cek cache
    try {
        const cached = await prisma.contentCache.findUnique({ where: { key: cacheKey } });
        if (cached) {
            const age = Date.now() - new Date(cached.updatedAt).getTime();
            if (age < CACHE_TTL) return JSON.parse(cached.data);
        }
    } catch {}

    const videos = await scrapeHomepage();

    if (videos.length === 0) {
        console.warn('[AGC] No videos found, site may be unreachable from this server.');
        return [];
    }

    const result = [{ title: 'Video Terbaru', videos }];

    // Simpan cache
    try {
        await prisma.contentCache.upsert({
            where: { key: cacheKey },
            update: { data: JSON.stringify(result), updatedAt: new Date() },
            create: { key: cacheKey, data: JSON.stringify(result) },
        });
    } catch {}

    return result;
}
