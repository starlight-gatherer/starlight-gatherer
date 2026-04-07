import { NextRequest } from "next/server";

export function validateApiKey(req: NextRequest): boolean {
  if (req.method === "GET") return true;
  const apiKey = req.headers.get("x-api-key");
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  return apiKey === expected;
}
