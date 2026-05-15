/**
 * clean-bad-cache.js
 * Jalankan di VPS: node scripts/clean-bad-cache.js
 * 
 * Fungsi: Cek semua cache JAV, hapus yang servers-nya kosong
 * sehingga saat user buka video, data fresh akan di-fetch ulang
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Scanning ContentCache untuk video dengan server kosong...\n');

    // Ambil semua cache entry yang berhubungan dengan watch/jav
    const allCache = await prisma.contentCache.findMany({
        where: {
            OR: [
                { key: { startsWith: 'watch_' } },
                { key: { startsWith: 'jav_watch_' } },
            ]
        }
    });

    console.log(`📦 Total cache ditemukan: ${allCache.length}`);

    let toDelete = [];
    let valid = 0;
    let broken = 0;

    for (const entry of allCache) {
        try {
            const data = JSON.parse(entry.data);
            const servers = data?.servers || [];
            
            if (!servers || servers.length === 0) {
                toDelete.push(entry.key);
                broken++;
                console.log(`  ❌ BROKEN: ${entry.key}`);
            } else {
                valid++;
            }
        } catch (e) {
            // JSON corrupt
            toDelete.push(entry.key);
            broken++;
            console.log(`  ❌ CORRUPT JSON: ${entry.key}`);
        }
    }

    console.log(`\n📊 Hasil Scan:`);
    console.log(`   ✅ Cache valid    : ${valid}`);
    console.log(`   ❌ Cache broken   : ${broken}`);

    if (toDelete.length === 0) {
        console.log('\n✨ Tidak ada cache rusak yang perlu dihapus!');
        return;
    }

    console.log(`\n🗑️  Menghapus ${toDelete.length} cache yang rusak...`);

    const result = await prisma.contentCache.deleteMany({
        where: {
            key: { in: toDelete }
        }
    });

    console.log(`✅ Berhasil dihapus: ${result.count} entries`);
    console.log('\n💡 Cache video yang dihapus akan di-fetch ulang saat user membuka halaman tersebut.');
    console.log('   Pastikan server source (nontonasik.my.id) masih aktif!\n');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
