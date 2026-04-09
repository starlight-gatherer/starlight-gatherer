import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArchiveCard } from "@/components/archive-card";
import { unstable_noStore as noStore } from 'next/cache';

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  noStore();

  const { id } = await params;
  const seriesId = parseInt(id);

  if (isNaN(seriesId)) notFound();

  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: {
      seriesType: true,
      events: {
        orderBy: [{ date: "asc" }, { id: "asc" }],
        include: {
          type: true,
          archives: {
            orderBy: { id: "asc" },
            include: { event: { include: { series: true } } },
          },
        },
      },
    },
  });

  if (!series) notFound();

  const totalArchives = series.events.reduce((sum, e) => sum + e.archives.length, 0);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-sm text-slate-400 mb-10 font-medium">
        <Link href="/" className="hover:text-red-500 transition-colors">首页</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{series.title}</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">{series.title}</h1>
        <p className="text-slate-400 font-medium">
          {series.events.length} 个活动 · {totalArchives} 项资源
          {series.seriesType && (
            <span className="ml-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
              {series.seriesType.name}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-8">
        {series.events.map((event) => (
          <div key={event.id}>
            <h2 className="text-lg font-bold text-slate-600 mb-3 flex items-center gap-2">
              <span>{event.title}</span>
              {event.date && (
                <span className="text-xs font-mono text-slate-400">
                  {event.date.toLocaleDateString("zh-CN")}
                </span>
              )}
            </h2>
            {event.archives.length > 0 ? (
              <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                {event.archives.map((a) => (
                  <ArchiveCard
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    bv={a.bv}
                    isTranslated={a.isTranslated}
                    year={a.year}
                    videoUrl={a.videoUrl}
                    isClip={!!a.fullVersionId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic pl-4">暂无视频资源</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
