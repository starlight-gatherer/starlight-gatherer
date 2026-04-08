import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const isTranslated = searchParams.get("isTranslated");
  const eventId = searchParams.get("eventId");

  const where: Record<string, unknown> = {};
  if (year) where.year = parseInt(year);
  if (isTranslated) where.isTranslated = parseInt(isTranslated);
  if (eventId) where.eventId = parseInt(eventId);

  const archives = await prisma.archive.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      event: { include: { series: true } },
      fullVersion: { select: { id: true, title: true } },
      parts: { select: { id: true, title: true } },
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(archives);
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, year, videoUrl, bv, isTranslated, fullVersionId, eventId, seriesVol } = body;

  if (!title || !year) {
    return NextResponse.json({ error: "title, year are required" }, { status: 400 });
  }

  try {
    const archive = await prisma.archive.create({
      data: { title, year, videoUrl, bv, isTranslated, fullVersionId, eventId, seriesVol },
    });
    return NextResponse.json(archive, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
