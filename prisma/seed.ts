import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment variables");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = getPrismaClient();

async function main() {
  console.log("🌱 Starting KOMYUT database seed...");

  // 1. Seed Transport Mode Tags
  const transportTags = [
    { name: "Jeepney", category: "transport_mode" },
    { name: "Bus", category: "transport_mode" },
    { name: "MRT", category: "transport_mode" },
    { name: "LRT-1", category: "transport_mode" },
    { name: "LRT-2", category: "transport_mode" },
    { name: "Tricycle", category: "transport_mode" },
    { name: "UV Express", category: "transport_mode" },
    { name: "Walk", category: "transport_mode" },
  ];

  for (const tag of transportTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { category: tag.category },
      create: tag,
    });
  }
  console.log(`✅ Seeded ${transportTags.length} transport mode tags.`);

  // 2. Seed Demo Users
  const user1 = await prisma.user.upsert({
    where: { email: "carlom@komyut.ph" },
    update: {},
    create: {
      email: "carlom@komyut.ph",
      username: "carlom",
      name: "Carlo Mendoza",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      reputationPoints: 120,
      verifiedAnswersCount: 2,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "kenneth@komyut.ph" },
    update: {},
    create: {
      email: "kenneth@komyut.ph",
      username: "kennethtan",
      name: "Kenneth Tan",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      reputationPoints: 240,
      verifiedAnswersCount: 5,
    },
  });

  console.log("✅ Seeded demo users.");

  // 3. Seed Demo Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: user1.id,
      title: "Paano pumunta mula SM North EDSA papuntang BGC High Street?",
      body: "First time ko pumunta sa BGC. May UV Express ba sa SM North terminal o mag-MRT + Carousel bus na lang ako?",
      origin: "SM North EDSA",
      destination: "BGC High Street",
      region: "Metro Manila",
      status: "verified",
      upvoteCount: 24,
      answerCount: 2,
    },
  });

  // Attach Tags to Post
  const busTag = await prisma.tag.findUnique({ where: { name: "Bus" } });
  const mrtTag = await prisma.tag.findUnique({ where: { name: "MRT" } });

  if (busTag) {
    await prisma.postTag.create({
      data: { postId: post1.id, tagId: busTag.id },
    });
  }
  if (mrtTag) {
    await prisma.postTag.create({
      data: { postId: post1.id, tagId: mrtTag.id },
    });
  }

  // 4. Seed Verified Answer
  await prisma.answer.create({
    data: {
      postId: post1.id,
      authorId: user2.id,
      body: "Mula SM North, sakay ka ng MRT-3 North Ave station tapos baba ka sa Ayala station. Mula Ayala station footbridge, tumawid ka papuntang BGC Bus Terminal (Telus building). Sakay ng West Route o East Route BGC Bus, baba ka sa Bonifacio High Street.",
      isVerified: true,
      upvoteCount: 16,
    },
  });

  console.log("✅ Seeded demo posts & verified answers.");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
