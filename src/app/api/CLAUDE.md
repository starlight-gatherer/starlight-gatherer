# API Routes & Authentication

## Permission Bitmask

```
READ        = 1 << 0 = 1     // GET data
CREATE      = 1 << 1 = 2     // POST new records
UPDATE      = 1 << 2 = 4     // PATCH existing records
DELETE      = 1 << 3 = 8     // DELETE records
UPLOAD      = 1 << 4 = 16    // Upload cover images
MANAGE_KEYS = 1 << 5 = 32    // Manage API keys (create/revoke)
```

Common combinations:
- Read-only: `1`
- Editor: `1 | 2 | 4 = 7`
- Full (no key mgmt): `1 | 2 | 4 | 8 | 16 = 31`
- Super admin: `63`

Constants exported from `src/lib/api-auth.ts`.

## ApiKey Model (SQLite)

```prisma
model ApiKey {
  id          Int       @id @default(autoincrement())
  key         String    @unique   // Full key: sg_live_{32hex}
  prefix      String              // First 8 chars for quick lookup
  name        String              // Human-readable label
  permissions Int                 // Bitmask integer
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
}
```

## Key Format

`sg_{env}_{random32hex}` — e.g. `sg_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

- `sg_` = starlight-gatherer prefix
- `live` / `test` = environment tag
- 32 hex chars via `crypto.getRandomValues`

Full key shown only once at creation. List API returns only `prefix`.

## Auth Flow

1. Client sends `x-api-key` header
2. `validateApiKey(req, requiredPerm)` looks up key in DB via `prisma.apiKey.findUnique`
3. Checks `(record.permissions & requiredPerm) === requiredPerm`
4. Updates `lastUsedAt` fire-and-forget
5. Returns `boolean` (async)

## Route → Permission Mapping

| Route | Method | Permission |
|-------|--------|-----------|
| `/api/v1/archives` | POST | `PERM_CREATE` |
| `/api/v1/archives/[id]` | PATCH | `PERM_UPDATE` |
| `/api/v1/archives/[id]` | DELETE | `PERM_DELETE` |
| `/api/v1/events` | POST | `PERM_CREATE` |
| `/api/v1/events/[id]` | PATCH | `PERM_UPDATE` |
| `/api/v1/events/[id]` | DELETE | `PERM_DELETE` |
| `/api/v1/events/[id]/merge` | POST | `PERM_UPDATE` |
| `/api/v1/series-crud` | POST | `PERM_CREATE` |
| `/api/v1/series-crud/[id]` | PATCH | `PERM_UPDATE` |
| `/api/v1/series-crud/[id]` | DELETE | `PERM_DELETE` |
| `/api/v1/upload-cover` | POST | `PERM_UPLOAD` |
| `/api/v1/api-keys` | GET/POST | `PERM_MANAGE_KEYS` |
| `/api/v1/api-keys/[id]` | PATCH/DELETE | `PERM_MANAGE_KEYS` |
| All GET routes (data) | GET | No auth required |

## Key Management API

**`POST /api/v1/api-keys`** — Create key
- Body: `{ name: string, permissions: number }`
- Response includes full `key` (only time it's returned)

**`GET /api/v1/api-keys`** — List keys
- Returns `{ id, prefix, name, permissions, lastUsedAt, createdAt }` (no full key)

**`PATCH /api/v1/api-keys/[id]`** — Update name/permissions

**`DELETE /api/v1/api-keys/[id]`** — Revoke key

All require `PERM_MANAGE_KEYS` in the caller's key.

## Seed Script

`scripts/seed-api-key.ts` — Imports `NEXT_PUBLIC_ADMIN_API_KEY` env var as a super-admin key (permissions=63).

Run: `npx tsx scripts/seed-api-key.ts`

## Adding a New Protected Route

```ts
import { validateApiKey, PERM_CREATE } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  if (!(await validateApiKey(req, PERM_CREATE))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... handler logic
}
```
