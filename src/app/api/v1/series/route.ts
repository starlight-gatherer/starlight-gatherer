import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const series = await prisma.series.findMany({
    include: {
      _count: { select: { archives: true } },
      archives: {
        orderBy: { seriesVol: "asc" },
        take: 1,
        select: { videoUrl: true, bv: true },
      },
    },
    orderBy: { title: "asc" },
  });
  return NextResponse.json(series);
}
