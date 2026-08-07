"use server";

import { resolveTagByKeyword, incrementTagUsage, slugify } from "@/lib/tag-service";
import { prisma } from "@/lib/prisma";
import type { TagType } from "@/types";

export interface AutoTagResult {
  tagIds: string[];
  tagNames: string[];
}

interface ExtractedTag {
  name: string;
  type: TagType;
}

/**
 * Smart Tag Type Classifier Heuristic (Fallback when AI is offline)
 */
function inferTagType(tagName: string, origin: string, destination: string): TagType {
  const lowerName = tagName.toLowerCase();
  const lowerOrigin = origin.toLowerCase();
  const lowerDest = destination.toLowerCase();

  // 1. Check Transport Terms
  if (
    /\b(jeep|jeepney|bus|p2p|uv|van|mrt|lrt|tricycle|trike|toda|walk|lakad|ferry|taxi|car|train)\b/i.test(
      lowerName
    )
  ) {
    return "TRANSPORT";
  }

  // 2. Check Area & Location Indicators
  if (
    lowerOrigin.includes(lowerName) ||
    lowerDest.includes(lowerName) ||
    /\b(city|station|terminal|center|mall|park|hall|campus|street|ave|avenue|road|blvd|boulevard|bridge|market|town|square|heights)\b/i.test(
      lowerName
    )
  ) {
    return "AREA";
  }

  // 3. Otherwise default to CUSTOM context
  return "CUSTOM";
}

/**
 * AI Auto-Tag Normalization Engine (Pattern 2)
 * Analyzes post text using GPT-4.1-mini or local fallback dictionary to extract canonical tags with exact types
 */
export async function generateAutoTagsAction(
  title: string,
  body: string,
  origin: string,
  destination: string,
  userSelectedTransportTags: string[] = []
): Promise<AutoTagResult> {
  const combinedText = `${title} ${body} ${origin} ${destination}`;
  const extractedTagMap = new Map<string, TagType>();

  // 1. First add user-selected transport tags (Always type: TRANSPORT)
  for (const transportTag of userSelectedTransportTags) {
    if (transportTag) {
      extractedTagMap.set(transportTag, "TRANSPORT");
    }
  }

  // 2. AI Normalization Call via OpenAI REST API (GPT-4.1-mini)
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are an auto-tagger for a Philippine commute Q&A platform (KOMYUT). 
Analyze raw commuter questions and extract canonical tags with their correct category type ("AREA", "TRANSPORT", or "CUSTOM").
Examples:
- "QC", "Kyusi" -> { "name": "Quezon City", "type": "AREA" }
- "Fairview" -> { "name": "Fairview", "type": "AREA" }
- "BGC" -> { "name": "BGC", "type": "AREA" }
- "UPD", "UP Campus" -> { "name": "UP Diliman", "type": "AREA" }
- "SMNE", "SM North" -> { "name": "SM North EDSA", "type": "AREA" }
- "2 AM", "Madaling Araw" -> { "name": "Late-Night", "type": "CUSTOM" }
- "Peak Hour" -> { "name": "Rush-Hour", "type": "CUSTOM" }

Return ONLY a JSON array of objects with "name" and "type". Example: [{"name": "Quezon City", "type": "AREA"}, {"name": "Late-Night", "type": "CUSTOM"}]`,
            },
            {
              role: "user",
              content: combinedText,
            },
          ],
          temperature: 0.2,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();

        if (content) {
          try {
            const parsedTags = JSON.parse(content);
            if (Array.isArray(parsedTags)) {
              for (const tagObj of parsedTags) {
                if (typeof tagObj === "string" && tagObj.trim()) {
                  const tagType = inferTagType(tagObj.trim(), origin, destination);
                  extractedTagMap.set(tagObj.trim(), tagType);
                } else if (tagObj && typeof tagObj === "object" && tagObj.name) {
                  const tagName = tagObj.name.trim();
                  const tagType: TagType =
                    tagObj.type === "AREA" || tagObj.type === "TRANSPORT" || tagObj.type === "CUSTOM"
                      ? tagObj.type
                      : inferTagType(tagName, origin, destination);
                  extractedTagMap.set(tagName, tagType);
                }
              }
            }
          } catch (jsonErr) {
            console.warn("AI Auto-tagger response JSON parse warning:", jsonErr);
          }
        }
      }
    } catch (aiErr) {
      console.warn("OpenAI API call failed, falling back to local tag dictionary:", aiErr);
    }
  }

  // 3. Fallback Local Regex & Dictionary Lookup (Guarantees zero failure if AI is offline)
  const localKeywords: Array<{ pattern: RegExp; canonical: string; type: TagType }> = [
    { pattern: /\b(qc|q\.c\.|kyusi|quezon city)\b/i, canonical: "Quezon City", type: "AREA" },
    { pattern: /\b(bgc|fort bonifacio|global city)\b/i, canonical: "BGC", type: "AREA" },
    { pattern: /\b(upd|up campus|diliman)\b/i, canonical: "UP Diliman", type: "AREA" },
    { pattern: /\b(smne|sm north|north edsa)\b/i, canonical: "SM North EDSA", type: "AREA" },
    { pattern: /\b(cubao|araneta)\b/i, canonical: "Cubao", type: "AREA" },
    { pattern: /\b(makati|ayala)\b/i, canonical: "Makati", type: "AREA" },
    { pattern: /\b(ortigas|galleria)\b/i, canonical: "Ortigas", type: "AREA" },
    { pattern: /\b(fairview)\b/i, canonical: "Fairview", type: "AREA" },
    { pattern: /\b(2 am|madaling araw|midnight|night shift)\b/i, canonical: "Late-Night", type: "CUSTOM" },
    { pattern: /\b(rush hour|peak hour|traffic)\b/i, canonical: "Rush-Hour", type: "CUSTOM" },
  ];

  for (const item of localKeywords) {
    if (item.pattern.test(combinedText)) {
      if (!extractedTagMap.has(item.canonical)) {
        extractedTagMap.set(item.canonical, item.type);
      }
    }
  }

  // 4. Resolve extracted names/aliases to PostgreSQL canonical Tag records
  const resolvedTagIds: string[] = [];
  const resolvedTagNames: string[] = [];

  for (const [rawName, inferredType] of Array.from(extractedTagMap.entries())) {
    const resolvedTag = await resolveTagByKeyword(rawName);

    if (resolvedTag) {
      resolvedTagIds.push(resolvedTag.id);
      resolvedTagNames.push(resolvedTag.name);
    } else {
      // Create new tag with its correct classified type (AREA, TRANSPORT, or CUSTOM)
      try {
        const newTag = await prisma.tag.create({
          data: {
            name: rawName,
            slug: slugify(rawName),
            type: inferredType || inferTagType(rawName, origin, destination),
            aliases: [rawName],
          },
        });
        resolvedTagIds.push(newTag.id);
        resolvedTagNames.push(newTag.name);
      } catch (createErr) {
        // Tag might have been created concurrently
        const existing = await prisma.tag.findUnique({ where: { name: rawName } });
        if (existing) {
          resolvedTagIds.push(existing.id);
          resolvedTagNames.push(existing.name);
        }
      }
    }
  }

  // 5. Increment usage counters
  if (resolvedTagIds.length > 0) {
    await incrementTagUsage(resolvedTagIds);
  }

  return {
    tagIds: Array.from(new Set(resolvedTagIds)),
    tagNames: Array.from(new Set(resolvedTagNames)),
  };
}
