import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SeriesClient } from "./series-client";
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

  const events = series.events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date ? event.date.toLocaleDateString("zh-CN") : null,
    archives: event.archives.map((a) => ({
      id: a.id,
      title: a.title,
      bv: a.bv,
      isTranslated: a.isTranslated,
      year: a.year,
      videoUrl: a.videoUrl,
      isClip: !!a.fullVersionId,
    })),
  }));

  return (
    <>
      <nav className="max-w-7xl mx-auto px-6 pt-16 text-sm text-slate-400 font-medium">
        <Link href="/" className="hover:text-red-500 transition-colors">首页</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{series.title}</span>
      </nav>

      <SeriesClient
        events={events}
        seriesTitle={series.title}
        seriesTypeName={series.seriesType?.name ?? null}
        totalArchives={totalArchives}
      />
    </>
  );
}
