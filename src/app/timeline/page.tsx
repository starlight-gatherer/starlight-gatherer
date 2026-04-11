import { prisma } from "@/lib/db";
import { MasonryGrid } from "@/components/masonry-grid";
import { TimelineClient } from "./timeline-client";
import { unstable_noStore as noStore } from 'next/cache';

export default async function TimelinePage() {
  noStore();

  const events = await prisma.event.findMany({
    where: { isVirtual: false },
    include: {
      series: { select: { title: true } },
      archives: {
        orderBy: { id: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });

  // Group events by year (from event date, fallback to archive year)
  const byYear = new Map<number, typeof events>();
  for (const e of events) {
    const year = e.date ? e.date.getFullYear() : (e.archives[0]?.year ?? 0);
    const list = byYear.get(year) ?? [];
    list.push(e);
    byYear.set(year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  const eventData = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    seriesTitle: e.series?.title ?? null,
    archives: e.archives.map((a) => ({
      id: a.id,
      title: a.title,
      bv: a.bv,
      isTranslated: a.isTranslated,
      year: a.year,
      videoUrl: a.videoUrl,
      isClip: !!a.fullVersionId,
      seriesVol: a.seriesVol,
    })),
  }));

  const yearMap: Record<number, number[]> = {};
  for (const [year, evts] of byYear) {
    yearMap[year] = evts.map((e) => e.id);
  }

  return (
    <TimelineClient years={years} yearMap={yearMap} events={eventData} />
  );
}
