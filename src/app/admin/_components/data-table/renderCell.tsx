import type { ReactNode } from "react";
import type { ColumnConfig } from "./types";
import { getFieldValue } from "./getFieldValue";

const INPUT_CLASS =
  "w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30";

// ── Display cell content (no <td> wrapper) ──────────────────────────────

function renderDisplayContent<T>(
  col: ColumnConfig<T>,
  value: unknown
): ReactNode {
  if (col.render) return null; // handled by caller

  switch (col.cellType) {
    case "id":
      return String(value ?? "");
    case "truncated":
    case "text":
    case "mono":
      return value != null ? String(value) : "-";
    case "date":
      return value
        ? new Date(value as string).toLocaleDateString()
        : "-";
    case "count":
      return value != null ? String(value) : "0";
    case "boolean":
      return value ? "Yes" : "No";
    default:
      return value != null ? String(value) : "-";
  }
}

// ── Display cell ────────────────────────────────────────────────────────

export function renderDisplayCell<T>(col: ColumnConfig<T>, row: T): ReactNode {
  const value = getFieldValue(row, col.accessor);

  if (col.render) {
    return (
      <td className="px-4 py-3">
        {col.render(value, row)}
      </td>
    );
  }

  const content = renderDisplayContent(col, value);

  switch (col.cellType) {
    case "id":
      return (
        <td className="px-4 py-3 font-mono text-xs text-slate-400">
          {content}
        </td>
      );
    case "truncated":
      return (
        <td className="px-4 py-3 max-w-xs truncate font-medium">
          {content}
        </td>
      );
    case "text":
      return (
        <td className="px-4 py-3 text-xs text-slate-500">{content}</td>
      );
    case "mono":
      return (
        <td className="px-4 py-3 font-mono text-xs">{content}</td>
      );
    case "date":
      return (
        <td className="px-4 py-3 text-slate-500 text-xs">{content}</td>
      );
    case "count":
      return <td className="px-4 py-3 text-slate-400">{content}</td>;
    case "boolean":
      return <td className="px-4 py-3 text-xs">{content}</td>;
    case "custom":
    default:
      return <td className="px-4 py-3">{content}</td>;
  }
}

// ── Edit cell ───────────────────────────────────────────────────────────

export function renderEditCell<T>(
  col: ColumnConfig<T>,
  editData: Record<string, unknown>,
  onUpdateField: (field: string, value: unknown) => void,
  row: T
): ReactNode {
  const field =
    col.editField ??
    (typeof col.accessor === "string" ? col.accessor : "");
  const value = editData[field];

  if (col.renderEdit) {
    return (
      <td className="px-4 py-3">
        {col.renderEdit(value, onUpdateField, row)}
      </td>
    );
  }

  if (!col.edit) {
    return renderDisplayCell(col, row);
  }

  switch (col.edit.type) {
    case "text":
      return (
        <td className="px-4 py-3">
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onUpdateField(field, e.target.value)}
            className={INPUT_CLASS}
          />
        </td>
      );
    case "number":
      return (
        <td className="px-4 py-3">
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) =>
              onUpdateField(
                field,
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className={INPUT_CLASS}
          />
        </td>
      );
    case "select":
      return (
        <td className="px-4 py-3">
          <select
            value={String(value ?? "")}
            onChange={(e) =>
              onUpdateField(
                field,
                e.target.value ? Number(e.target.value) : null
              )
            }
            className={INPUT_CLASS}
          >
            <option value="">-</option>
            {col.edit.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </td>
      );
    case "date":
      return (
        <td className="px-4 py-3">
          <input
            type="date"
            value={String(value ?? "").split("T")[0]}
            onChange={(e) => onUpdateField(field, e.target.value || null)}
            className={INPUT_CLASS}
          />
        </td>
      );
    case "checkbox":
      return (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onUpdateField(field, e.target.checked)}
          />
        </td>
      );
  }
}

// ── New row cell ────────────────────────────────────────────────────────

export function renderNewRowCell<T>(
  col: ColumnConfig<T>,
  editData: Record<string, unknown>,
  onUpdateField: (field: string, value: unknown) => void
): ReactNode {
  if (!col.edit) {
    if (col.cellType === "id") {
      return (
        <td className="px-4 py-3 font-mono text-xs text-slate-400">-</td>
      );
    }
    return <td className="px-4 py-3 text-slate-300">-</td>;
  }

  return renderEditCell(col, editData, onUpdateField, {} as T);
}
