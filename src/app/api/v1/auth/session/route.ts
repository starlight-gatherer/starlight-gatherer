import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session.apiKey) {
    return NextResponse.json({ authenticated: false });
  }

  const record = await prisma.apiKey.findUnique({
    where: { key: session.apiKey },
    select: { permissions: true, name: true },
  });

  if (!record) {
    // Key was revoked after session was created
    session.destroy();
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    permissions: record.permissions,
    name: record.name,
  });
}
