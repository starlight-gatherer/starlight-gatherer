import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const targetId = parseInt(id);
  const body = await req.json();
  const { sourceIds } = body as { sourceIds: number[] };

  if (!Array.isArray(sourceIds) || sourceIds.length === 0) {
    return NextResponse.json(
      { error: "sourceIds must be a non-empty array of event IDs" },
      { status: 400 }
    );
  }

  if (sourceIds.includes(targetId)) {
    return NextResponse.json(
      { error: "Target event cannot be in sourceIds" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Move all archives from source events to the target event
      await tx.archive.updateMany({
        where: {
          eventId: { in: sourceIds },
        },
        data: {
          eventId: targetId,
        },
      });

      // Delete the source events
      await tx.event.deleteMany({
        where: {
          id: { in: sourceIds },
        },
      });
    });

    return NextResponse.json({
      success: true,
      mergedCount: sourceIds.length,
      targetId,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
