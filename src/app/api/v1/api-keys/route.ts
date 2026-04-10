import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey, generateApiKey, PERM_MANAGE_KEYS, PERM_ALL } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  if (!(await validateApiKey(req, PERM_MANAGE_KEYS))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    select: {
      id: true,
      prefix: true,
      name: true,
      permissions: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  if (!(await validateApiKey(req, PERM_MANAGE_KEYS))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, permissions } = body;

  if (!name || typeof permissions !== "number") {
    return NextResponse.json(
      { error: "name and permissions are required" },
      { status: 400 }
    );
  }

  const { key, prefix } = generateApiKey();

  try {
    const record = await prisma.apiKey.create({
      data: { key, prefix, name, permissions },
    });

    // Return full key only on creation
    return NextResponse.json(
      {
        id: record.id,
        prefix: record.prefix,
        name: record.name,
        permissions: record.permissions,
        key, // Only shown once!
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
