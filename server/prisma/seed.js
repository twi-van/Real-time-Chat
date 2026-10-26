const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  // Chỉ seed 3 tài khoản demo (không tạo room / tin sẵn — demo sạch)
  const userA = await prisma.user.upsert({
    where: { email: "a@a.com" },
    update: { passwordHash, displayName: "An" },
    create: {
      email: "a@a.com",
      passwordHash,
      displayName: "An",
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: "b@b.com" },
    update: { passwordHash, displayName: "Bình" },
    create: {
      email: "b@b.com",
      passwordHash,
      displayName: "Bình",
    },
  });

  const userC = await prisma.user.upsert({
    where: { email: "c@c.com" },
    update: { passwordHash, displayName: "Chi" },
    create: {
      email: "c@c.com",
      passwordHash,
      displayName: "Chi",
    },
  });

  console.log("Seeded users:", {
    a: userA.email,
    b: userB.email,
    c: userC.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
