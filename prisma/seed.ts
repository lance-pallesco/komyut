import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TagType } from "../lib/generated/prisma/client";

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

  // 1. Seed Canonical Tags (Transport, Area, Custom)
  const canonicalTags: Array<{
    name: string;
    slug: string;
    aliases: string[];
    type: TagType;
  }> = [
    // Transport Modes
    { name: "Jeepney", slug: "jeepney", aliases: ["Jeep", "Modern Jeep", "PUJ"], type: TagType.TRANSPORT },
    { name: "Bus", slug: "bus", aliases: ["P2P", "EDSA Carousel", "City Bus"], type: TagType.TRANSPORT },
    { name: "UV Express", slug: "uv-express", aliases: ["UV", "Van"], type: TagType.TRANSPORT },
    { name: "MRT-3", slug: "mrt-3", aliases: ["MRT", "Metro Rail Transit"], type: TagType.TRANSPORT },
    { name: "LRT-1", slug: "lrt-1", aliases: ["LRT 1", "LRT Line 1"], type: TagType.TRANSPORT },
    { name: "LRT-2", slug: "lrt-2", aliases: ["LRT 2", "LRT Line 2"], type: TagType.TRANSPORT },
    { name: "Tricycle", slug: "tricycle", aliases: ["TODA", "Trike"], type: TagType.TRANSPORT },
    { name: "Walk", slug: "walk", aliases: ["Lakad", "Footpath"], type: TagType.TRANSPORT },

    // Area & Landmark Locations
    { name: "Quezon City", slug: "quezon-city", aliases: ["QC", "Q.C.", "Kyusi"], type: TagType.AREA },
    { name: "BGC", slug: "bgc", aliases: ["Bonifacio Global City", "Fort Bonifacio", "Global City"], type: TagType.AREA },
    { name: "UP Diliman", slug: "up-diliman", aliases: ["UPD", "UP Campus", "Diliman"], type: TagType.AREA },
    { name: "SM North EDSA", slug: "sm-north-edsa", aliases: ["SMNE", "SM North", "North EDSA"], type: TagType.AREA },
    { name: "Cubao", slug: "cubao", aliases: ["Araneta Center", "Cubao Terminal"], type: TagType.AREA },
    { name: "Makati", slug: "makati", aliases: ["Ayala", "Makati CBD"], type: TagType.AREA },
    { name: "PITX", slug: "pitx", aliases: ["Parañaque Integrated Terminal Exchange", "Paranaque Integrated Terminal Exchange", "Paranaque Terminal"], type: TagType.AREA },
    { name: "Parañaque", slug: "paranaque", aliases: ["Paranaque", "Pque", "Parañaque City"], type: TagType.AREA },
    { name: "Ortigas", slug: "ortigas", aliases: ["Ortigas Center", "Galleria"], type: TagType.AREA },

    // Custom Context Tags
    { name: "Late-Night", slug: "late-night", aliases: ["2 AM", "Madaling Araw", "Midnight", "Night Shift"], type: TagType.CUSTOM },
    { name: "Rush-Hour", slug: "rush-hour", aliases: ["Peak Hour", "Traffic", "Heavy Traffic"], type: TagType.CUSTOM },
  ];

  for (const tag of canonicalTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {
        slug: tag.slug,
        aliases: tag.aliases,
        type: tag.type,
      },
      create: {
        name: tag.name,
        slug: tag.slug,
        aliases: tag.aliases,
        type: tag.type,
      },
    });
  }
  console.log(`✅ Seeded ${canonicalTags.length} canonical tags with aliases.`);

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
