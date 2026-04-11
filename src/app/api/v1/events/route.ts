import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey, PERM_CREATE } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (title) where.title = { contains: title, mode: "insensitive" };
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where.date = { gte: start, lt: end };
  }

  const events = await prisma.event.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      _count: { select: { archives: true } },
      type: { select: { id: true, name: true } },
      series: { select: { id: true, title: true } },
    },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  if (!(await validateApiKey(req, PERM_CREATE))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, typeId, date, isVirtual, seriesId } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        typeId: typeId ?? null,
        date: date ? new Date(date) : null,
        isVirtual: isVirtual ?? false,
        seriesId: seriesId ?? null,
      },
      include: {
        type: { select: { id: true, name: true } },
        series: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
