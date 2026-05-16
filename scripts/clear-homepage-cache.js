const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.contentCache.deleteMany({
        where: { 
            key: {
                in: ['homepage_categories', 'homepage_categories_xnxx']
            }
        }
    });
    console.log('All homepage caches deleted successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
