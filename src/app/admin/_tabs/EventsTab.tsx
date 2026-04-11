"use client";

import { useState, useEffect, useCallback } from "react";
import type { EventRow, SeriesRow, SeriesTypeRow } from "../_types";
import { useInlineEdit } from "../_hooks/useInlineEdit";
import { DataTable } from "../_components/DataTable";
import { SearchInput } from "../_components/SearchInput";
import type { ColumnConfig } from "../_components/data-table/types";

export function EventsTab() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [seriesTypes, setSeriesTypes] = useState<SeriesTypeRow[]>([]);
  const [allSeries, setAllSeries] = useState<{ id: number; title: string }[]>(
    []
  );
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [mergeTarget, setMergeTarget] = useState<number | null>(null);
  const [merging, setMerging] = useState(false);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/v1/events");
    const data = await res.json();
    setEvents(data);
  }, []);

  const fetchSeriesTypes = useCallback(async () => {
    const res = await fetch("/api/v1/series-crud");
    const seriesData: SeriesRow[] = await res.json();
    const typeMap = new Map<number, string>();
    seriesData.forEach((s) => {
      if (s.seriesType) typeMap.set(s.seriesType.id, s.seriesType.name);
    });
    setSeriesTypes(
      Array.from(typeMap.entries()).map(([id, name]) => ({ id, name }))
    );
    setAllSeries(seriesData.map((s) => ({ id: s.id, title: s.title })));
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchSeriesTypes();
  }, [fetchEvents, fetchSeriesTypes]);

  const {
    editing,
    editData,
    saving,
    statusMsg: editStatusMsg,
    flash: editFlash,
    startEdit,
    startAdd,
    cancelEdit,
    saveEdit,
    updateField,
  } = useInlineEdit<EventRow>({
    apiBase: "/api/v1/events",
    pickEditData: (ev) => ({
      title: ev.title,
      typeId: ev.typeId,
      seriesId: ev.seriesId,
      date: ev.date,
      isVirtual: ev.isVirtual,
    }),
    addDefaults: {
      title: "",
      typeId: null,
      seriesId: null,
      date: null,
      isVirtual: false,
    },
    onSuccess: fetchEvents,
  });

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
      if (mergeTarget === id) setMergeTarget(null);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const doMerge = async () => {
    if (!mergeTarget || selected.size < 2) return;
    setMerging(true);
    try {
      const sourceIds = Array.from(selected).filter(
        (id) => id !== mergeTarget
      );
      await fetch(`/api/v1/events/${mergeTarget}/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceIds }),
      });
      editFlash(
        "ok",
        `Merged ${sourceIds.length} events into #${mergeTarget}`
      );
      setSelected(new Set());
      setMergeTarget(null);
      fetchEvents();
    } catch {
      editFlash("err", "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm(`Delete event #${id}?`)) return;
    try {
      const res = await fetch(`/api/v1/events/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        editFlash("err", err.error || "Delete failed");
        return;
      }
      editFlash("ok", "Deleted");
      fetchEvents();
    } catch {
      editFlash("err", "Network error");
    }
  };

  const columns: ColumnConfig<EventRow>[] = [
    { header: "ID", accessor: "id", cellType: "id" },
    {
      header: "标题",
      accessor: "title",
      cellType: "truncated",
      edit: { type: "text" },
      editField: "title",
    },
    {
      header: "日期",
      accessor: "date",
      cellType: "date",
      edit: { type: "date" },
      editField: "date",
    },
    {
      header: "类型",
      accessor: "type.name",
      cellType: "text",
      edit: {
        type: "select",
        options: seriesTypes.map((t) => ({ value: t.id, label: t.name })),
      },
      editField: "typeId",
    },
    {
      header: "系列",
      accessor: "series.title",
      cellType: "text",
      edit: {
        type: "select",
        options: allSeries.map((s) => ({ value: s.id, label: s.title })),
      },
      editField: "seriesId",
    },
    { header: "Archives", accessor: "_count.archives", cellType: "count" },
    {
      header: "虚拟",
      accessor: "isVirtual",
      cellType: "boolean",
      edit: { type: "checkbox" },
      editField: "isVirtual",
    },
  ];

  const displayed = events.filter((ev) => {
    if (filter[0] === "#") {
      return ev.id === parseInt(filter.substring(1));
    } else {
      return (
        ev.title.toLowerCase().includes(filter.toLowerCase()) ||
        ev.series?.title.toLowerCase().includes(filter.toLowerCase()) ||
        ev.type?.name.toLowerCase().includes(filter.toLowerCase())
      );
    }
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <SearchInput
          placeholder="搜索活动标题、系列名或类型..."
          value={filter}
          onChange={setFilter}
          className="mb-0"
        />
        {selected.size > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={mergeTarget ?? ""}
              onChange={(e) =>
                setMergeTarget(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="">选择合并目标...</option>
              {Array.from(selected)
                .sort((a, b) => a - b)
                .map((id) => {
                  const ev = events.find((e) => e.id === id);
                  return (
                    <option key={id} value={id}>
                      #{id} - {ev?.title}
                    </option>
                  );
                })}
            </select>
            <button
              onClick={doMerge}
              disabled={!mergeTarget || merging}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold
                         hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {merging ? "..." : "Merge"}
            </button>
            <button
              onClick={() => {
                setSelected(new Set());
                setMergeTarget(null);
              }}
              className="px-3 py-2 text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <DataTable<EventRow>
        columns={columns}
        data={displayed}
        minWidth="700px"
        editing={editing}
        editData={editData}
        saving={saving}
        statusMsg={editStatusMsg}
        onUpdateField={updateField}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        actions={{
          onStartEdit: startEdit,
          onDelete: deleteEvent,
        }}
        selection={{
          selected,
          onToggle: toggleSelect,
          onSelectAll: (ids) =>
            setSelected(new Set(ids)),
        }}
        addRow={{
          buttonLabel: "Add Event",
          defaultData: {
            title: "",
            typeId: null,
            seriesId: null,
            date: null,
            isVirtual: false,
          },
        }}
        onStartAdd={startAdd}
      />
    </>
  );
}
