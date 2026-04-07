import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArchiveCard } from "@/components/archive-card";

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seriesId = parseInt(id);

  if (isNaN(seriesId)) notFound();

  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: {
      archives: {
        orderBy: [{ seriesVol: "asc" }, { id: "asc" }],
        include: { series: true },
      },
    },
  });

  if (!series) notFound();

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-sm text-slate-400 mb-10 font-medium">
        <Link href="/" className="hover:text-red-500 transition-colors">首页</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{series.title}</span>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">{series.title}</h1>
        <p className="text-slate-400 font-medium">{series.archives.length} 项资源</p>
      </div>

      <div className="space-y-4">
        {series.archives.map((a) => (
          <ArchiveCard
            key={a.id}
            id={a.id}
            title={a.title}
            bv={a.bv}
            isTranslated={a.isTranslated}
            year={a.year}
            videoUrl={a.videoUrl}
            isClip={!!a.fullVersionId}
            seriesTitle={a.series?.title}
            seriesVol={a.seriesVol}
          />
        ))}
      </div>
    </main>
  );
}
