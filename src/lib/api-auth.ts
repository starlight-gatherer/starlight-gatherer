import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// ── Permission bitmask constants ────────────────────────────────────────

export const PERM_READ        = 1 << 0; // 1
export const PERM_CREATE      = 1 << 1; // 2
export const PERM_UPDATE      = 1 << 2; // 4
export const PERM_DELETE      = 1 << 3; // 8
export const PERM_UPLOAD      = 1 << 4; // 16
export const PERM_MANAGE_KEYS = 1 << 5; // 32
export const PERM_ALL         = PERM_READ | PERM_CREATE | PERM_UPDATE | PERM_DELETE | PERM_UPLOAD | PERM_MANAGE_KEYS;

// ── API key validation ──────────────────────────────────────────────────

export async function validateApiKey(
  req: NextRequest,
  requiredPerm: number
): Promise<boolean> {
  const rawKey = req.headers.get("x-api-key");
  if (!rawKey) return false;

  const record = await prisma.apiKey.findUnique({ where: { key: rawKey } });
  if (!record) return false;
  if ((record.permissions & requiredPerm) !== requiredPerm) return false;

  // Fire-and-forget update of lastUsedAt
  prisma.apiKey
    .update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return true;
}

// ── Key generation ──────────────────────────────────────────────────────

export function generateApiKey(): { key: string; prefix: string } {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const key = `${process.env.API_KEY_PREFIX}_${hex}`;
  return { key, prefix: key.substring(0, 8) };
}
