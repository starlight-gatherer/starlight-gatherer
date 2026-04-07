"use client";

import { useState, useEffect, useCallback } from "react";

interface Archive {
  id: string;
  title: string;
  year: number;
  videoUrl: string | null;
  bv: string | null;
  isTranslated: number;
  series: { id: number; title: string } | null;
  seriesVol: number | null;
  fullVersionId: string | null;
  parts: { id: string; title: string }[];
}

const TRANSLATED_LABELS: Record<number, string> = {
  [-1]: "未知",
  0: "生肉",
  1: "熟肉",
  2: "机翻",
};

const TRANSLATED_OPTIONS: { value: number; label: string }[] = [
  { value: -1, label: "未知" },
  { value: 0, label: "生肉" },
  { value: 1, label: "熟肉" },
  { value: 2, label: "机翻" },
];

export default function AdminPage() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Archive>>({});
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchArchives = useCallback(async () => {
    const res = await fetch("/api/v1/archives");
    const data = await res.json();
    setArchives(data);
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const flash = (type: "ok" | "err", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const startEdit = (a: Archive) => {
    setEditing(a.id);
    setEditData({
      title: a.title,
      videoUrl: a.videoUrl,
      bv: a.bv,
      isTranslated: a.isTranslated,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/archives/${editing}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "change-me-in-production",
        },
        body: JSON.stringify({
          title: editData.title,
          videoUrl: editData.videoUrl,
          bv: editData.bv,
          isTranslated: editData.isTranslated,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Save failed");
        return;
      }
      flash("ok", "Saved");
      setEditing(null);
      fetchArchives();
    } catch {
      flash("err", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const displayed = archives.filter(
    (a) =>
      a.title.toLowerCase().includes(filter.toLowerCase()) ||
      a.bv?.toLowerCase().includes(filter.toLowerCase()) ||
      a.series?.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">管理后台</h1>
        <span className="text-sm text-slate-400">
          {displayed.length} / {archives.length} 条记录
        </span>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 px-4 py-2 rounded-lg text-sm font-medium ${
            statusMsg.type === "ok"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <input
        type="text"
        placeholder="搜索标题、BV 号或系列名..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 bg-white
                   focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 mb-8 text-sm"
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">BV</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">系列</th>
              <th className="px-4 py-3">年份</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {displayed.slice(0, 100).map((a) => (
              <tr
                key={a.id}
                className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                {editing === a.id ? (
                  <>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {a.id}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editData.title ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editData.bv ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, bv: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={editData.isTranslated ?? 0}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            isTranslated: Number(e.target.value),
                          })
                        }
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      >
                        {TRANSLATED_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {a.series?.title ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{a.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="text-xs text-green-600 font-bold hover:underline disabled:opacity-50"
                        >
                          {saving ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-xs text-slate-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {a.id}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium">
                      {a.title}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{a.bv}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          a.isTranslated === 1
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : a.isTranslated === 2
                              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                              : a.isTranslated === 0
                                ? "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                : "bg-red-500/10 text-red-600 border-red-500/20"
                        }`}
                      >
                        {TRANSLATED_LABELS[a.isTranslated] ?? "未知"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {a.series?.title ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{a.year}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(a)}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length > 100 && (
          <p className="px-4 py-3 text-xs text-slate-400 text-center border-t border-slate-100">
            显示前 100 条（共 {displayed.length} 条），请使用搜索缩小范围
          </p>
        )}
        {displayed.length === 0 && (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">
            没有匹配的记录
          </p>
        )}
      </div>
    </main>
  );
}
