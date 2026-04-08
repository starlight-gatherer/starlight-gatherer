import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const series = await prisma.series.findMany({
    include: {
      seriesType: true,
      _count: { select: { events: true } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(series);
}
