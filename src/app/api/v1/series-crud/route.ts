import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(_req: NextRequest) {
  const seriesList = await prisma.series.findMany({
    include: {
      _count: { select: { events: true } },
      seriesType: { select: { id: true, name: true } },
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(seriesList);
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, seriesTypeId } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const series = await prisma.series.create({
      data: {
        title,
        seriesTypeId: seriesTypeId ?? null,
      },
      include: {
        seriesType: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(series, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
