/**
 * validate-jav-videos.js
 * 
 * Jalankan di VPS: node scripts/validate-jav-videos.js
 * Atau tambahkan ke cron: 0 * /6 * * * node /root/cuanflix/scripts/validate-jav-videos.js
 * 
 * Fungsi: Scan semua video di listing cache, cek apakah punya server,
 * tandai yang rusak agar tidak muncul di listing.
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();
const SOURCE_URL = 'https://nontonasik.my.id/jav-domain/';
const BAD_VIDEO_TTL_HOURS = 12;
const CONCURRENCY = 3; // Berapa video dicek bersamaan (jangan terlalu tinggi)
const DELAY_MS = 1500; // Jeda antar request (ms)

async function fetchPage(url) {
    return new Promise((resolve) => {
        const req = https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 15000,
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        });
        req.on('error', () => resolve(''));
        req.on('timeout', () => { req.destroy(); resolve(''); });
    });
}

function extractNuxtData(html) {
    if (!html) return null;
    const match = html.match(/<script[^>]+id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch { return null; }
}

function hasVideoServer(html, id) {
    if (!html || html.length < 1000) return false;

    // Cek __NUXT_DATA__ punya server URLs
    const nuxtData = extractNuxtData(html);
    if (nuxtData) {
        const str = JSON.stringify(nuxtData);
        if (str.includes('play_url') || str.includes('link_embed') || 
            str.includes('embed_url') || str.includes('stream_url')) {
            // Cek nilainya tidak kosong (null atau string pendek)
            const urlMatch = str.match(/"(?:play_url|link_embed|embed_url|stream_url)"\s*:\s*"(https?:\/\/[^"]{10,})"/);
            if (urlMatch) return true;
        }
    }

    // Cek HTML langsung untuk iframe dengan src
    const iframeMatch = html.match(/<iframe[^>]+src=["'](https?:\/\/[^"']{10,})["']/i);
    if (iframeMatch) return true;

    // Cek regex untuk URL streaming
    const streamMatch = html.match(/(https?:\/\/[^"']{10,}\.m3u8)/i);
    if (streamMatch) return true;

    return false;
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function checkVideo(id) {
    const url = `${SOURCE_URL}videos/${id}`;
    const html = await fetchPage(url);
    return hasVideoServer(html, id);
}

async function runInBatches(items, fn, concurrency) {
    const results = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);
        if (i + concurrency < items.length) await sleep(DELAY_MS);
        
        const progress = Math.min(i + concurrency, items.length);
        process.stdout.write(`\r  Progress: ${progress}/${items.length} (${Math.round(progress/items.length*100)}%)`);
    }
    return results;
}

async function main() {
    console.log('🔍 JAV Video Validator\n');
    console.log('📦 Mengambil semua video dari listing cache...');

    // Ambil semua listing cache
    const listingCaches = await prisma.contentCache.findMany({
        where: { key: { startsWith: 'jav_latest_page_' } },
        select: { key: true, data: true }
    });

    if (listingCaches.length === 0) {
        console.log('⚠️  Tidak ada listing cache ditemukan. Pastikan site pernah dibuka.');
        console.log('   Coba buka https://cuanflix.site/jav dulu, lalu jalankan script ini lagi.');
        return;
    }

    // Kumpulkan semua video ID unik dari semua halaman listing
    const allVideoIds = new Set();
    for (const cache of listingCaches) {
        try {
            const data = JSON.parse(cache.data);
            const videos = data?.videos || [];
            for (const v of videos) {
                // href format: "jav/12345"
                const id = v.href?.replace('jav/', '') || v.link?.split('/').pop();
                if (id && !isNaN(Number(id))) allVideoIds.add(id);
            }
        } catch { /* skip */ }
    }

    console.log(`✅ Total video unik ditemukan: ${allVideoIds.size}\n`);

    if (allVideoIds.size === 0) {
        console.log('⚠️  Tidak ada video ID yang bisa diekstrak dari cache.');
        return;
    }

    // Cek mana yang sudah ditandai bad (skip)
    const alreadyBad = await prisma.contentCache.findMany({
        where: { key: { startsWith: 'jav_bad_' } },
        select: { key: true, updatedAt: true }
    });
    const recentlyBadIds = new Set(
        alreadyBad
            .filter(e => Date.now() - new Date(e.updatedAt).getTime() < BAD_VIDEO_TTL_HOURS * 3600 * 1000)
            .map(e => e.key.replace('jav_bad_', ''))
    );

    const toCheck = [...allVideoIds].filter(id => !recentlyBadIds.has(id));
    console.log(`⏭️  Sudah ditandai bad (skip): ${recentlyBadIds.size}`);
    console.log(`🔬 Akan dicek: ${toCheck.length} video\n`);

    if (toCheck.length === 0) {
        console.log('✨ Semua video sudah pernah dicek!');
        console.log(`   Bad videos saat ini: ${recentlyBadIds.size}`);
        return;
    }

    console.log(`🚀 Mulai validasi (${CONCURRENCY} concurrent, ${DELAY_MS}ms delay)...\n`);

    const hasServer = await runInBatches(toCheck, checkVideo, CONCURRENCY);

    console.log('\n');
    
    // Tandai yang rusak
    const badIds = toCheck.filter((_, i) => !hasServer[i]);
    const goodIds = toCheck.filter((_, i) => hasServer[i]);

    console.log(`📊 Hasil Validasi:`);
    console.log(`   ✅ Video OK     : ${goodIds.length}`);
    console.log(`   ❌ Video rusak  : ${badIds.length}`);

    if (badIds.length > 0) {
        console.log(`\n🗑️  Menandai ${badIds.length} video sebagai bad...`);
        
        // Batch upsert ke ContentCache
        const BATCH = 20;
        let marked = 0;
        for (let i = 0; i < badIds.length; i += BATCH) {
            const batch = badIds.slice(i, i + BATCH);
            await Promise.all(batch.map(id =>
                prisma.contentCache.upsert({
                    where: { key: `jav_bad_${id}` },
                    update: { data: '{"bad":true}', updatedAt: new Date() },
                    create: { key: `jav_bad_${id}`, data: '{"bad":true}' }
                })
            ));
            marked += batch.length;
            process.stdout.write(`\r  Marking: ${marked}/${badIds.length}`);
        }
        console.log('\n');
    }

    // Hapus listing cache agar dibangun ulang tanpa video rusak
    console.log('🔄 Menghapus listing cache agar dibangun ulang (tanpa video rusak)...');
    const deleted = await prisma.contentCache.deleteMany({
        where: { key: { startsWith: 'jav_latest_page_' } }
    });
    console.log(`   ✅ Deleted ${deleted.count} listing cache entries\n`);

    console.log('🎉 Selesai!');
    console.log(`   Total bad videos: ${recentlyBadIds.size + badIds.length}`);
    console.log('   Listing akan otomatis di-rebuild saat user membuka halaman JAV.');
    console.log('   Jalankan script ini tiap 6 jam via cron untuk menjaga listing tetap bersih.\n');
}

main()
    .catch(e => { console.error('\n❌ Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
