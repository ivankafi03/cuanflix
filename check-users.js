const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 3
  });
  console.log("Users found:", users.map(u => ({ email: u.email, role: u.role, password: "Encrypted (bcrypt)" })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
