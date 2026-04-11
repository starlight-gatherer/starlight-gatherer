"use client";

import { useState, useEffect, useCallback } from "react";
import type { SeriesRow, SeriesTypeRow } from "../_types";
import { useInlineEdit } from "../_hooks/useInlineEdit";
import { DataTable } from "../_components/DataTable";
import { SearchInput } from "../_components/SearchInput";
import type { ColumnConfig } from "../_components/data-table/types";

export function SeriesTab() {
  const [seriesList, setSeriesList] = useState<SeriesRow[]>([]);
  const [seriesTypes, setSeriesTypes] = useState<SeriesTypeRow[]>([]);
  const [filter, setFilter] = useState("");

  const fetchSeries = useCallback(async () => {
    const res = await fetch("/api/v1/series-crud");
    const data = await res.json();
    setSeriesList(data);
  }, []);

  const fetchSeriesTypes = useCallback(async () => {
    const res = await fetch("/api/v1/series-types");
    const data = await res.json();
    setSeriesTypes(data);
  }, []);

  useEffect(() => {
    fetchSeries();
    fetchSeriesTypes();
  }, [fetchSeries, fetchSeriesTypes]);

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
  } = useInlineEdit<SeriesRow>({
    apiBase: "/api/v1/series-crud",
    pickEditData: (s) => ({
      title: s.title,
      seriesTypeId: s.seriesTypeId,
    }),
    addDefaults: { title: "", seriesTypeId: null },
    onSuccess: fetchSeries,
  });

  const deleteSeries = async (id: number) => {
    if (!confirm(`Delete series #${id}?`)) return;
    try {
      const res = await fetch(`/api/v1/series-crud/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Delete failed");
        return;
      }
      flash("ok", "Deleted");
      fetchSeries();
    } catch {
      flash("err", "Network error");
    }
  };

  const columns: ColumnConfig<SeriesRow>[] = [
    { header: "ID", accessor: "id", cellType: "id" },
    {
      header: "标题",
      accessor: "title",
      cellType: "truncated",
      edit: { type: "text" },
      editField: "title",
    },
    {
      header: "类型",
      accessor: "seriesType.name",
      cellType: "text",
      edit: {
        type: "select",
        options: seriesTypes.map((t) => ({ value: t.id, label: t.name })),
      },
      editField: "seriesTypeId",
    },
    { header: "Events", accessor: "_count.events", cellType: "count" },
  ];

  const displayed = seriesList.filter(
    (s) =>
      s.title.toLowerCase().includes(filter.toLowerCase()) ||
      s.seriesType?.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <SearchInput
        placeholder="搜索系列名或类型..."
        value={filter}
        onChange={setFilter}
      />
      <DataTable<SeriesRow>
        columns={columns}
        data={displayed}
        minWidth="500px"
        editing={editing}
        editData={editData}
        saving={saving}
        statusMsg={statusMsg}
        onUpdateField={updateField}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        actions={{
          onStartEdit: startEdit,
          onDelete: deleteSeries,
        }}
        addRow={{
          buttonLabel: "Add Series",
          defaultData: { title: "", seriesTypeId: null },
        }}
        onStartAdd={startAdd}
      />
    </>
  );
}
