import type { ReactNode } from "react";

// ── Cell display types ──────────────────────────────────────────────────

export type CellType =
  | "id"
  | "text"
  | "truncated"
  | "date"
  | "count"
  | "boolean"
  | "mono"
  | "custom";

// ── Edit types ──────────────────────────────────────────────────────────

export type EditType =
  | { type: "text" }
  | { type: "number" }
  | { type: "select"; options: SelectOption[] }
  | { type: "date" }
  | { type: "checkbox" };

export interface SelectOption {
  value: string | number;
  label: string;
}

// ── Field accessor ──────────────────────────────────────────────────────

export type FieldAccessor<T> = string | ((row: T) => unknown);

// ── Column config ───────────────────────────────────────────────────────

export interface ColumnConfig<T> {
  header: string;
  accessor: FieldAccessor<T>;
  cellType: CellType;
  edit?: EditType;
  editField?: string;
  headerClassName?: string;
  render?: (value: unknown, row: T) => ReactNode;
  renderEdit?: (
    value: unknown,
    onChange: (field: string, value: unknown) => void,
    row: T
  ) => ReactNode;
}

// ── Selection (EventsTab checkbox pattern) ──────────────────────────────

export interface SelectionConfig<T extends { id: number }> {
  selected: Set<number>;
  onToggle: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
}

// ── Action callbacks ────────────────────────────────────────────────────

export interface ActionCallbacks<T extends { id: number }> {
  onStartEdit: (row: T) => void;
  onDelete?: (id: number) => void;
}

// ── Add row config ──────────────────────────────────────────────────────

export interface AddRowConfig {
  buttonLabel: string;
  defaultData: Record<string, unknown>;
}

// ── DataTable props ─────────────────────────────────────────────────────

export interface DataTableProps<T extends { id: number }> {
  columns: ColumnConfig<T>[];
  data: T[];
  minWidth?: string;
  maxRows?: number;

  editing: number | "new" | null;
  editData: Record<string, unknown>;
  saving: boolean;
  statusMsg: { type: "ok" | "err"; text: string } | null;
  onUpdateField: (field: string, value: unknown) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;

  actions?: ActionCallbacks<T>;
  selection?: SelectionConfig<T>;
  addRow?: AddRowConfig;
  onStartAdd?: () => void;
}
