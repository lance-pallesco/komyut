import { prisma } from "@/lib/prisma";

/**
 * Clean slugify helper handling Filipino special characters like 'ñ' / 'Ñ'
 * Example: "Parañaque Integrated Terminal Exchange" -> "paranaque-integrated-terminal-exchange"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves raw user slang, abbreviations, or full names to Canonical Tag
 * Example: "Parañaque Integrated Terminal Exchange" -> Tag("PITX")
 */
export async function resolveTagByKeyword(keyword: string) {
  if (!keyword || !keyword.trim()) return null;

  const cleanKeyword = keyword.trim();
  const slugified = slugify(cleanKeyword);

  // 1. Direct Canonical Name Match
  let tag = await prisma.tag.findUnique({
    where: { name: cleanKeyword },
  });

  if (tag) return tag;

  // 2. Direct Slug Match
  tag = await prisma.tag.findFirst({
    where: { slug: slugified },
  });

  if (tag) return tag;

  // 3. Aliases Array Match (Pattern 1)
  const tagsWithAlias = await prisma.tag.findMany({
    where: {
      aliases: {
        has: cleanKeyword,
      },
    },
  });

  if (tagsWithAlias.length > 0) {
    return tagsWithAlias[0];
  }

  // 4. Case-Insensitive & Normalized Fallback Lookup
  const fallbackTags = await prisma.tag.findMany({
    where: {
      OR: [
        { name: { equals: cleanKeyword, mode: "insensitive" } },
        { aliases: { has: cleanKeyword.toUpperCase() } },
        { aliases: { has: cleanKeyword.toLowerCase() } },
        { slug: { equals: slugified } },
      ],
    },
  });

  return fallbackTags[0] || null;
}

/**
 * Increment usage count on matched canonical tags
 */
export async function incrementTagUsage(tagIds: string[]) {
  if (!tagIds || tagIds.length === 0) return;

  await prisma.tag.updateMany({
    where: { id: { in: tagIds } },
    data: {
      usageCount: { increment: 1 },
    },
  });
}
