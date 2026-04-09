"use client";

import { useState, useEffect } from "react";
import type { SeriesRow } from "../_types";
import { API_KEY } from "../_constants";
import { useStatus } from "../_hooks/useStatus";
import { StatusBanner } from "../_components/StatusBanner";

export function CoverTab() {
  const [allSeries, setAllSeries] = useState<{ id: number; title: string }[]>(
    []
  );
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { statusMsg, flash } = useStatus();

  useEffect(() => {
    fetch("/api/v1/series-crud")
      .then((r) => r.json())
      .then((data: SeriesRow[]) =>
        setAllSeries(data.map((s) => ({ id: s.id, title: s.title })))
      );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedSeriesId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("seriesId", selectedSeriesId);

      const res = await fetch("/api/v1/upload-cover", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Upload failed");
        return;
      }

      const result = await res.json();
      flash("ok", `Uploaded to ${result.path}`);
      setFile(null);
      const fileInput = document.getElementById(
        "cover-file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch {
      flash("err", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <StatusBanner msg={statusMsg} />
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-lg">
        <h2 className="text-lg font-bold mb-6">上传系列封面</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              系列
            </label>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
                         focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 text-sm"
            >
              <option value="">选择系列...</option>
              {allSeries.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} - {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              封面图片
            </label>
            <input
              id="cover-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white
                         text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg
                         file:border-0 file:text-sm file:font-medium
                         file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
            />
          </div>
          {file && (
            <p className="text-xs text-slate-400">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
          <button
            type="submit"
            disabled={uploading || !file || !selectedSeriesId}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm
                       hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? "上传中..." : "上传"}
          </button>
        </form>
      </div>
    </>
  );
}
