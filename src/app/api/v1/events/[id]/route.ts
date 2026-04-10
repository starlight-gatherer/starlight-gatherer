import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey, PERM_UPDATE, PERM_DELETE } from "@/lib/api-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: { select: { archives: true } },
      type: { select: { id: true, name: true } },
      series: { select: { id: true, title: true } },
      archives: { select: { id: true, title: true } },
    },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await validateApiKey(req, PERM_UPDATE))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  // If date is provided, convert string to Date
  const data: Record<string, unknown> = { ...body };
  if (data.date && typeof data.date === "string") {
    data.date = new Date(data.date);
  }

  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data,
      include: {
        type: { select: { id: true, name: true } },
        series: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json(event);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await validateApiKey(req, PERM_DELETE))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
