"use client";

import React from "react";
import type { DataTableProps } from "./data-table/types";
import {
  renderDisplayCell,
  renderEditCell,
  renderNewRowCell,
} from "./data-table/renderCell";
import { StatusBanner } from "./StatusBanner";
import { SaveCancelButtons } from "./SaveCancelButtons";

export function DataTable<T extends { id: number }>({
  columns,
  data,
  minWidth,
  maxRows,
  editing,
  editData,
  saving,
  statusMsg,
  onUpdateField,
  onSaveEdit,
  onCancelEdit,
  actions,
  selection,
  addRow,
  onStartAdd,
}: DataTableProps<T>) {
  const displayed = maxRows ? data.slice(0, maxRows) : data;
  const colSpan =
    columns.length + (selection ? 1 : 0) + (actions ? 1 : 0);

  return (
    <>
      <StatusBanner msg={statusMsg} />
      <div className="flex items-center gap-4 mb-8">
        {addRow && onStartAdd && (
          <button
            onClick={onStartAdd}
            disabled={editing === "new"}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold
                       hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            + {addRow.buttonLabel}
          </button>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table
          className="w-full text-sm"
          style={minWidth ? { minWidth } : undefined}
        >
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selection && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      displayed.length > 0 &&
                      displayed.every((row) =>
                        selection.selected.has(row.id)
                      )
                    }
                    onChange={(e) => {
                      selection.onSelectAll(
                        e.target.checked
                          ? displayed.map((r) => r.id)
                          : []
                      );
                    }}
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 ${col.headerClassName ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 w-28"></th>}
            </tr>
          </thead>
          <tbody>
            {editing === "new" && (
              <tr className="border-t border-slate-100 bg-blue-50/30">
                {selection && <td className="px-4 py-3"></td>}
                {columns.map((col, i) => (
                  <React.Fragment key={i}>
                    {renderNewRowCell(col, editData, onUpdateField)}
                  </React.Fragment>
                ))}
                {actions && (
                  <SaveCancelButtons
                    saving={saving}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                  />
                )}
              </tr>
            )}
            {displayed.map((row) => (
              <tr
                key={row.id}
                className={`border-t border-slate-100 hover:bg-slate-50/50 transition-colors ${
                  selection?.selected.has(row.id) ? "bg-red-50/30" : ""
                }`}
              >
                {selection && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selection.selected.has(row.id)}
                      onChange={() => selection.onToggle(row.id)}
                    />
                  </td>
                )}
                {editing === row.id ? (
                  <>
                    {columns.map((col, i) => (
                      <React.Fragment key={i}>
                        {renderEditCell(col, editData, onUpdateField, row)}
                      </React.Fragment>
                    ))}
                    {actions && (
                      <SaveCancelButtons
                        saving={saving}
                        onSave={onSaveEdit}
                        onCancel={onCancelEdit}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {columns.map((col, i) => (
                      <React.Fragment key={i}>
                        {renderDisplayCell(col, row)}
                      </React.Fragment>
                    ))}
                    {actions && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => actions.onStartEdit(row)}
                            className="text-xs text-blue-600 font-bold hover:underline"
                          >
                            Edit
                          </button>
                          {actions.onDelete && (
                            <button
                              onClick={() => actions.onDelete!(row.id)}
                              className="text-xs text-red-500 font-bold hover:underline"
                            >
                              Del
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
            {displayed.length === 0 && editing !== "new" && (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-8 text-sm text-slate-400 text-center"
                >
                  没有匹配的记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {maxRows && data.length > maxRows && (
          <p className="px-4 py-3 text-xs text-slate-400 text-center border-t border-slate-100">
            显示前 {maxRows} 条（共 {data.length} 条），请使用搜索缩小范围
          </p>
        )}
      </div>
    </>
  );
}
