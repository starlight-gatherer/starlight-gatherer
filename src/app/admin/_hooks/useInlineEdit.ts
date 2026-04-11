"use client";

import { useState, useRef } from "react";
import { useStatus } from "./useStatus";

export interface UseInlineEditOptions<T extends { id: number }> {
  apiBase: string;
  pickEditData: (item: T) => Record<string, unknown>;
  onSuccess: () => void;
  addDefaults?: Record<string, unknown>;
}

export function useInlineEdit<T extends { id: number }>({
  apiBase,
  pickEditData,
  onSuccess,
  addDefaults,
}: UseInlineEditOptions<T>) {
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { statusMsg, flash } = useStatus();

  const startEdit = (item: T) => {
    setEditing(item.id);
    setEditData(pickEditData(item));
  };

  const startAdd = () => {
    setEditing("new");
    setEditData(addDefaults ?? {});
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (editing === null) return;
    setSaving(true);
    try {
      const url =
        editing === "new" ? apiBase : `${apiBase}/${editing}`;
      const method = editing === "new" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Save failed");
        return;
      }
      flash("ok", editing === "new" ? "Created" : "Saved");
      setEditing(null);
      onSuccessRef.current();
    } catch {
      flash("err", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return {
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
  };
}
