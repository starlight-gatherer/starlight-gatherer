import { prisma } from "@/lib/db";
import { Hero } from "@/components/hero";
import { SeriesCard } from "@/components/series-card";
import { ArchiveCard } from "@/components/archive-card";
import { MasonryGrid } from "@/components/masonry-grid";
import { getSeriesCover, getSeriesAccent } from "@/lib/series-config";

export default async function HomePage() {
  // Fetch all series with archive counts
  const allSeries = await prisma.series.findMany({
    include: {
      _count: { select: { archives: true } },
    },
  });

  // Fetch archives NOT belonging to any series (for timeline)
  const nonSeriesArchives = await prisma.archive.findMany({
    where: { seriesId: null },
    orderBy: [{ year: "desc" }, { id: "asc" }],
  });

  // Group by year
  const byYear = new Map<number, typeof nonSeriesArchives>();
  for (const a of nonSeriesArchives) {
    const list = byYear.get(a.year) ?? [];
    list.push(a);
    byYear.set(a.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <Hero />

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-24">
        {/* Featured Series */}
        <section>
          <h2 className="text-3xl font-black tracking-tight mb-10 text-slate-800">
            系列<span className="text-red-500">.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSeries.map((s) => (
              <SeriesCard
                key={s.id}
                seriesId={s.id}
                title={s.title}
                count={s._count.archives}
                coverImage={getSeriesCover(s.id)}
                accentColor={getSeriesAccent(s.title)}
              />
            ))}
          </div>
        </section>

        {/* Timeline Archives (masonry) */}
        <section>
          <h2 className="text-3xl font-black tracking-tight mb-10 text-slate-300">
            归档<span className="text-slate-400">.</span>
          </h2>
          {years.map((year) => (
            <div key={year} className="mb-16">
              <h3 className="text-6xl font-black text-slate-100 mb-8 select-none">{year}</h3>
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
                    seriesTitle={null}
                    seriesVol={a.seriesVol}
                  />
                ))}
              </MasonryGrid>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
