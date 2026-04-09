import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const types = await prisma.seriesType.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(types);
}
