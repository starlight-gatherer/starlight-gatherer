# Admin Page Architecture

## Directory Structure

```
src/app/admin/
  page.tsx                          # AuthGate + AdminPage (entry point)
  _types.ts                         # Archive, EventRow, SeriesRow, SeriesTypeRow, ApiKeyRow, TabKey
  _constants.ts                     # Env keys, TRANSLATED_*, TABS, PERM_LABELS
  _hooks/
    useStatus.ts                    # Flash status message (type + text, auto-dismiss 3s)
    useInlineEdit.ts                # Generic inline edit/add state for any { id: number } entity
  _components/
    StatusBanner.tsx                # Green/red flash banner
    TabBar.tsx                      # Tab switcher (renders from TABS constant)
    SearchInput.tsx                 # Styled search input (placeholder, value, onChange)
    SaveCancelButtons.tsx           # Save/Cancel <td> for edit rows
    DataTable.tsx                   # Config-driven generic table (see below)
    data-table/
      types.ts                      # ColumnConfig, CellType, EditType, DataTableProps
      getFieldValue.ts              # Dot-path resolver ("event.title" → row.event?.title)
      renderCell.tsx                # Built-in display/edit cell renderers
  _tabs/
    ArchivesTab.tsx                 # 8 columns, custom badge render, delete, add
    EventsTab.tsx                   # 9 columns, selection + merge, add
    SeriesTab.tsx                   # 5 columns, add, delete
    CoverTab.tsx                    # File upload form (standalone, no DataTable)
    KeysTab.tsx                     # API key management (standalone table)
```

## Config-Driven DataTable

Each tab defines a `ColumnConfig<T>[]` array and passes it to `<DataTable<T>>`. No manual `<td>` markup needed.

### ColumnConfig Fields

| Field | Purpose |
|-------|---------|
| `header` | Column header text |
| `accessor` | Dot-path string (`"event.title"`) or function `((row) => ...)` |
| `cellType` | Display mode: `id`, `text`, `truncated`, `mono`, `date`, `count`, `boolean`, `custom` |
| `edit` | Edit mode config: `{ type: "text" \| "number" \| "select" \| "date" \| "checkbox" }` |
| `editField` | Key in `editData` Record (may differ from accessor, e.g. accessor=`"type.name"` → editField=`"typeId"`) |
| `render` | Custom display override `(value, row) => ReactNode` |
| `renderEdit` | Custom edit override `(value, onChange, row) => ReactNode` |

### CellType → td className Mapping

| CellType | Display className |
|----------|-------------------|
| `id` | `px-4 py-3 font-mono text-xs text-slate-400` |
| `text` | `px-4 py-3 text-xs text-slate-500` |
| `truncated` | `px-4 py-3 max-w-xs truncate font-medium` |
| `mono` | `px-4 py-3 font-mono text-xs` |
| `date` | `px-4 py-3 text-slate-500 text-xs` |
| `count` | `px-4 py-3 text-slate-400` |
| `boolean` | `px-4 py-3 text-xs` |
| `custom` | `px-4 py-3` (render prop controls content) |

Edit inputs all share: `w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30`

### DataTable Special Props

- **`selection`** — Adds checkbox column (EventsTab merge feature)
- **`actions`** — Auto-generates Edit/Del buttons; shows SaveCancelButtons in edit mode
- **`addRow`** — Shows "+ Add" button; inserts empty edit row at top when `editing === "new"`
- **`onStartAdd`** — Callback to enter add mode (sets `editing = "new"` in useInlineEdit)
- **`maxRows`** — Truncates display + shows overflow message

## useInlineEdit Hook

Manages edit/add state for any entity type `T extends { id: number }`.

```
editing: number | "new" | null
editData: Record<string, unknown>
saving: boolean
statusMsg: { type, text } | null
```

| Method | Behavior |
|--------|----------|
| `startEdit(item)` | Sets `editing = item.id`, populates `editData` via `pickEditData` |
| `startAdd()` | Sets `editing = "new"`, `editData = addDefaults` |
| `saveEdit()` | If `"new"` → `POST apiBase`; if number → `PATCH apiBase/{id}` |
| `cancelEdit()` | Sets `editing = null` |
| `updateField(field, value)` | Merges into `editData` |

Uses `useRef` for `onSuccess` callback to avoid stale closure issues with `useCallback`.

## Adding a New Tab

1. Add type to `TabKey` in `_types.ts`
2. Add entry to `TABS` in `_constants.ts`
3. Create `_tabs/NewTab.tsx` with `"use client"` directive
4. Import and render in `page.tsx` under `activeTab === "newtab"`

## Key Conventions

- All files use `"use client"` (admin page is fully client-side)
- API key for write operations comes from `_constants.ts` → `NEXT_PUBLIC_ADMIN_API_KEY`
- Filter logic stays in the tab (not in DataTable)
- Custom rendering (like translation status badge) uses `render` prop override
