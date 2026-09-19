const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Promote any user who is linked to a business but is still just a 'STAFF'
  const businessUsers = await prisma.businessUser.findMany({
    include: { user: true }
  });

  for (const bu of businessUsers) {
    if (bu.user.role === "STAFF") {
      await prisma.user.update({
        where: { id: bu.userId },
        data: { role: "OWNER" }
      });
      console.log(`Promoted ${bu.user.email} to OWNER.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
