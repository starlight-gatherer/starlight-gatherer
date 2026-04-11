// Seed script: insert the current NEXT_PUBLIC_ADMIN_API_KEY as a super-admin key
// Usage: npx tsx scripts/seed-api-key.ts

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { PrismaClient } from "@prisma/client.js";

const PERM_ALL = 63; // all 6 permission bits

const prisma = new PrismaClient();

async function main() {
  const envKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
  if (!envKey) {
    console.error("NEXT_PUBLIC_ADMIN_API_KEY not set in environment");
    process.exit(1);
  }

  const existing = await prisma.apiKey.findUnique({ where: { key: envKey } });
  if (existing) {
    console.log(`Key already exists: ${existing.prefix}... (${existing.name})`);
    return;
  }

  const prefix = envKey.substring(0, 8);
  const record = await prisma.apiKey.create({
    data: {
      key: envKey,
      prefix,
      name: "Super Admin (env)",
      permissions: PERM_ALL,
    },
  });

  console.log(`Created super-admin key: ${record.prefix}... (id=${record.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
