import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { apiKey } = await req.json();

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const record = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!record) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const session = await getSession();
  session.apiKey = apiKey;
  await session.save();

  // Fire-and-forget update lastUsedAt
  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return NextResponse.json({
    ok: true,
    permissions: record.permissions,
    name: record.name,
  });
}
