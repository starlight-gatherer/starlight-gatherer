import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey, PERM_UPLOAD } from "@/lib/api-auth";
import { uploadToS3 as uploadToS3 } from "@/lib/s3";
import { createHash } from "crypto";
import path from "path";

function md5(buffer: Buffer): string {
  return createHash("md5").update(buffer).digest("hex");
}

export async function POST(req: NextRequest) {
  if (!(await validateApiKey(req, PERM_UPLOAD))) {
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
      return NextResponse.json(
        { error: "seriesId is required" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${ext}. Allowed: ${allowedExts.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const prefix = (process.env.S3_COVER_PREFIX ?? "").replace(/^\/+|\/+$/g, "");
    const key = prefix ? `${prefix}/${md5(buffer)}${ext}` : `${md5(buffer)}${ext}`;

    await uploadToS3(key, buffer, "image/png");

    const rootUrl = (process.env.S3_PUBLIC_URL ?? "").replace(/\/+$/, "");
    const url = `${rootUrl}/${key}`;

    await prisma.series.update({
      where: { id: parseInt(seriesId) },
      data: { coverURL: url },
    });

    return NextResponse.json({ success: true, path: url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
