import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const seriesId = formData.get("seriesId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!seriesId) {
      return NextResponse.json({ error: "seriesId is required" }, { status: 400 });
    }

    // Determine extension from original filename
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}. Allowed: ${allowedExts.join(", ")}` },
        { status: 400 }
      );
    }

    // Ensure the directory exists
    const dir = path.join(process.cwd(), "public", "images", "series");
    await mkdir(dir, { recursive: true });

    // Write file as public/images/series/{seriesId}.{ext}
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(dir, `${seriesId}${ext}`);
    await writeFile(filePath, buffer);

    const fullPath = `/images/series/${seriesId}${ext}`;
    await prisma.series.update({
      where: { id: parseInt(seriesId) },
      data: { coverURL: fullPath }
    });

    return NextResponse.json({
      success: true,
      path: fullPath,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
