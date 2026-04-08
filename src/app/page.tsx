import { prisma } from "@/lib/db";
import { Hero } from "@/components/hero";
import { SeriesCard } from "@/components/series-card";
import { getSeriesCover, getSeriesAccent } from "@/lib/series-config";

const TYPE_LABELS: Record<string, string> = {
  musical: "舞台剧",
  live: "LIVE",
  nama_housou: "生放送",
  mixed_live: "拼盘 LIVE",
  fest: "活动祭典",
  reading_theatre: "朗读剧",
  radio: "广播",
  talking: "谈话节目",
  other: "其他活动",
};

export default async function HomePage() {
  const seriesTypes = await prisma.seriesType.findMany({
    include: {
      series: {
        include: {
          _count: { select: { events: true } },
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return (
    <>
      <Hero />
      <main className="max-w-7xl mx-auto px-6 py-20 space-y-24">
        {seriesTypes.map((type) => {
          if (type.series.length === 0) return null;
          return (
            <section key={type.id}>
              <h2 className="text-3xl font-black tracking-tight mb-10 text-slate-800">
                {TYPE_LABELS[type.name] ?? type.name}
                <span className="text-red-500">.</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {type.series.map((s) => (
                  <SeriesCard
                    key={s.id}
                    seriesId={s.id}
                    title={s.title}
                    count={s._count.events}
                    coverImage={getSeriesCover(s.id)}
                    accentColor={getSeriesAccent(s.title)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
