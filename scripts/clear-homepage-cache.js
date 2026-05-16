const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deleted = await prisma.contentCache.deleteMany({
        where: { 
            OR: [
                { key: { in: ['homepage_categories', 'homepage_categories_xnxx'] } },
                { key: { contains: 'xnxx_watch_' } }
            ]
        }
    });
    console.log(`Successfully deleted ${deleted.count} cache entries!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
