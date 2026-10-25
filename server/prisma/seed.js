const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  // 1. Upsert 3 tài khoản demo
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

  // 2. Tạo room 2 người (An + Bình, name = null) — idempotent (chống trùng)
  const candidateDirectRooms = await prisma.room.findMany({
    where: {
      name: null,
      AND: [
        { members: { some: { userId: userA.id } } },
        { members: { some: { userId: userB.id } } },
      ],
    },
    include: { members: true },
  });

  let directRoom = candidateDirectRooms.find((r) => r.members.length === 2);

  if (!directRoom) {
    directRoom = await prisma.room.create({
      data: {
        name: null,
        createdById: userA.id,
        members: {
          create: [{ userId: userA.id }, { userId: userB.id }],
        },
        messages: {
          create: [
            {
              senderId: userA.id,
              content: "Chào Bình! Đây là phòng chat đôi giữa An và Bình.",
            },
          ],
        },
      },
    });
    console.log("Created 2-member room (An + Bình):", directRoom.id);
  } else {
    console.log("2-member room (An + Bình) already exists:", directRoom.id);
  }

  // 3. Tạo room nhóm "Nhóm demo" (An + Bình + Chi) — idempotent
  let groupRoom = await prisma.room.findFirst({
    where: {
      name: "Nhóm demo",
      createdById: userA.id,
    },
  });

  if (!groupRoom) {
    groupRoom = await prisma.room.create({
      data: {
        name: "Nhóm demo",
        createdById: userA.id,
        members: {
          create: [
            { userId: userA.id },
            { userId: userB.id },
            { userId: userC.id },
          ],
        },
        messages: {
          create: [
            {
              senderId: userA.id,
              content: "Chào mọi người trong Nhóm demo!",
            },
          ],
        },
      },
    });
    console.log("Created group room 'Nhóm demo':", groupRoom.id);
  } else {
    console.log("Group room 'Nhóm demo' already exists:", groupRoom.id);
  }
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
