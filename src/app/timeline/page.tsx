import { prisma } from "@/lib/db";
import { ArchiveCard } from "@/components/archive-card";
import { MasonryGrid } from "@/components/masonry-grid";
import { unstable_noStore as noStore } from 'next/cache';

export default async function TimelinePage() {
  noStore();

  const archives = await prisma.archive.findMany({
    where: { event: { isVirtual: false } },
    include: {
      // 获取 archive 的所有字段（默认），并包含关联的 event
      event: {
        select: {
          title: true, // 获取 event 的 title
          date: true,  // 获取 event 的 date
          series: {
            select: {
              title: true // 深入获取 series 的 title
            }
          }
        }
      }
    },
    orderBy: [{ event: { date: "desc" } }, { id: "asc" }]
  });

  const byYear = new Map<number, typeof archives>();
  for (const a of archives) {
    const list = byYear.get(a.year) ?? [];
    list.push(a);
    byYear.set(a.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-800">
        时间线<span className="text-slate-300">.</span>
      </h1>
      <p className="text-slate-400 font-medium mb-16">
        按年份归档的所有资源
      </p>

      {years.map((year) => (
        <div key={year} className="mb-16">
          <h2 className="text-6xl font-black text-slate-100 mb-8 select-none">{year}</h2>
          <MasonryGrid>
            {byYear.get(year)!.map((a) => (
              <ArchiveCard
                key={a.id}
                id={a.id}
                title={a.title}
                bv={a.bv}
                isTranslated={a.isTranslated}
                year={a.year}
                videoUrl={a.videoUrl}
                isClip={!!a.fullVersionId}
                seriesTitle={a.event?.series?.title}
                seriesVol={a.seriesVol}
              />
            ))}
          </MasonryGrid>
        </div>
      ))}
    </main>
  );
}
