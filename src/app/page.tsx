import { prisma } from "@/lib/db";
import { Hero } from "@/components/hero";
import { SeriesCard } from "@/components/series-card";
import { getSeriesCover } from "@/lib/series-config";

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
          // 取出该 series 下时间最早的一个 event
          events: {
            orderBy: { date: "asc" },
            take: 1,
            select: { date: true },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  // 内存排序：根据第一个 event 的 date 进行升序排列
  seriesTypes.forEach((type) => {
    type.series.sort((a, b) => {
      // 获取时间戳。如果没有 event 或 date 为 null，将其设为 Infinity (排到最后面)
      const dateA = a.events[0]?.date?.getTime() ?? Infinity;
      const dateB = b.events[0]?.date?.getTime() ?? Infinity;

      return dateA - dateB;
    });
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
                {Promise.all(
                  type.series.map(async (s) => (
                    <SeriesCard
                      key={s.id}
                      seriesId={s.id}
                      title={s.title}
                      count={s._count.events}
                      coverImage={await getSeriesCover(s.id)}
                    />
                  )
                  ))
                }
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
