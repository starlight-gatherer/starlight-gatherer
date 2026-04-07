import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface JsonArchive {
  id: string;
  title: string;
  year: number;
  video_url: string | null;
  BV: string | null;
  is_translated: number;
  part: { full_version: string | null } | null;
  series: { series_title: string | null; vol: number | null } | null;
}

async function main() {
  const jsonPath = path.resolve(__dirname, "../../archive.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const archives: JsonArchive[] = JSON.parse(raw);

  // 1. Collect unique series
  const seriesSet = new Set<string>();
  for (const a of archives) {
    if (a.series?.series_title) seriesSet.add(a.series.series_title);
  }

  // 2. Upsert series
  for (const title of seriesSet) {
    await prisma.series.upsert({
      where: { title },
      update: {},
      create: { title },
    });
  }

  // Build a map from series title to series id
  const seriesMap = new Map<string, number>();
  for (const title of seriesSet) {
    const record = await prisma.series.findUnique({ where: { title } });
    if (record) seriesMap.set(title, record.id);
  }

  // 3. Insert all archives without fullVersionId first (to avoid FK violations)
  const fullVersionUpdates: { id: string; fullVersionId: string }[] = [];

  for (const a of archives) {
    const seriesId = a.series?.series_title
      ? seriesMap.get(a.series.series_title) ?? null
      : null;

    const fullVersionId = a.part?.full_version ?? null;

    await prisma.archive.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        year: a.year,
        videoUrl: a.video_url,
        bv: a.BV,
        isTranslated: a.is_translated,
        seriesId,
        seriesVol: a.series?.vol ?? null,
      },
      create: {
        id: a.id,
        title: a.title,
        year: a.year,
        videoUrl: a.video_url,
        bv: a.BV,
        isTranslated: a.is_translated,
        seriesId,
        seriesVol: a.series?.vol ?? null,
      },
    });

    // Queue FK update for later
    if (fullVersionId) {
      fullVersionUpdates.push({ id: a.id, fullVersionId });
    }
  }

  // 4. Now update fullVersionId references (all referenced archives exist now)
  for (const { id, fullVersionId } of fullVersionUpdates) {
    await prisma.archive.update({
      where: { id },
      data: { fullVersionId },
    });
  }

  console.log(`Seeded ${archives.length} archives, ${seriesSet.size} series`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
