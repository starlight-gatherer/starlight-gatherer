"use client";

import { useState, useEffect, useCallback } from "react";
import type { Archive } from "../_types";
import { TRANSLATED_LABELS, TRANSLATED_OPTIONS, API_KEY } from "../_constants";
import { useInlineEdit } from "../_hooks/useInlineEdit";
import { DataTable } from "../_components/DataTable";
import { SearchInput } from "../_components/SearchInput";
import type { ColumnConfig } from "../_components/data-table/types";

export function ArchivesTab() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [filter, setFilter] = useState("");

  const fetchArchives = useCallback(async () => {
    const res = await fetch("/api/v1/archives");
    const data = await res.json();
    setArchives(data);
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const {
    editing,
    editData,
    saving,
    statusMsg,
    flash,
    startEdit,
    startAdd,
    cancelEdit,
    saveEdit,
    updateField,
  } = useInlineEdit<Archive>({
    apiBase: "/api/v1/archives",
    pickEditData: (a) => ({
      title: a.title,
      videoUrl: a.videoUrl,
      bv: a.bv,
      isTranslated: a.isTranslated,
      eventId: a.eventId,
    }),
    addDefaults: {
      title: "",
      year: new Date().getFullYear(),
      videoUrl: "",
      bv: "",
      isTranslated: 0,
      eventId: null,
    },
    onSuccess: fetchArchives,
  });

  const deleteArchive = async (id: number) => {
    if (!confirm(`Delete archive #${id}?`)) return;
    try {
      const res = await fetch(`/api/v1/archives/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY },
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Delete failed");
        return;
      }
      flash("ok", "Deleted");
      fetchArchives();
    } catch {
      flash("err", "Network error");
    }
  };

  const columns: ColumnConfig<Archive>[] = [
    { header: "ID", accessor: "id", cellType: "id" },
    {
      header: "标题",
      accessor: "title",
      cellType: "truncated",
      edit: { type: "text" },
      editField: "title",
    },
    {
      header: "BV",
      accessor: "bv",
      cellType: "mono",
      edit: { type: "text" },
      editField: "bv",
    },
    {
      header: "状态",
      accessor: "isTranslated",
      cellType: "custom",
      render: (value) => {
        const v = value as number;
        return (
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              v === 1
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : v === 2
                  ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                  : v === 0
                    ? "bg-slate-500/10 text-slate-600 border-slate-500/20"
                    : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}
          >
            {TRANSLATED_LABELS[v] ?? "未知"}
          </span>
        );
      },
      edit: { type: "select", options: TRANSLATED_OPTIONS },
      editField: "isTranslated",
    },
    {
      header: "活动ID",
      accessor: "eventId",
      cellType: "text",
      edit: { type: "number" },
      editField: "eventId",
    },
    { header: "活动", accessor: "event.title", cellType: "truncated" },
    { header: "年份", accessor: "year", cellType: "count" },
  ];

  const displayed = archives.filter(
    (a) =>
      a?.title?.toLowerCase().includes(filter.toLowerCase()) ||
      a.bv?.toLowerCase().includes(filter.toLowerCase()) ||
      a.event?.title?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <SearchInput
        placeholder="搜索标题、BV 号或系列名..."
        value={filter}
        onChange={setFilter}
      />
      <DataTable<Archive>
        columns={columns}
        data={displayed}
        minWidth="640px"
        maxRows={100}
        editing={editing}
        editData={editData}
        saving={saving}
        statusMsg={statusMsg}
        onUpdateField={updateField}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        actions={{
          onStartEdit: startEdit,
          onDelete: deleteArchive,
        }}
        addRow={{
          buttonLabel: "Add Archive",
          defaultData: {
            title: "",
            year: new Date().getFullYear(),
            videoUrl: "",
            bv: "",
            isTranslated: 0,
            eventId: null,
          },
        }}
        onStartAdd={startAdd}
      />
    </>
  );
}
