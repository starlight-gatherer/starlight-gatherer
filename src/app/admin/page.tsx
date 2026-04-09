"use client";

import { useState, useEffect, useCallback } from "react";
import { ConfigProvider, App } from "antd";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { LockOutlined } from "@ant-design/icons";

// ── Types ──────────────────────────────────────────────────────────────

interface Archive {
  id: number;
  title: string;
  year: number;
  videoUrl: string | null;
  bv: string | null;
  isTranslated: number;

  eventId: number | null;
  event: EventRow;

  fullVersionId: number | null;
  parts: { id: number; title: string }[];
}

interface EventRow {
  id: number;
  title: string;
  typeId: number | null;
  type: { id: number; name: string } | null;
  date: string | null;
  isVirtual: boolean;
  seriesId: number | null;
  series: { id: number; title: string } | null;
  _count: { archives: number };
}

interface SeriesRow {
  id: number;
  title: string;
  seriesTypeId: number | null;
  seriesType: { id: number; name: string } | null;
  _count: { events: number };
}

interface SeriesTypeRow {
  id: number;
  name: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
const SESSION_KEY = process.env.NEXT_PUBLIC_ADMIN_SESSION_KEY ?? "admin-auth";
const API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "";

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

type TabKey = "archives" | "events" | "series" | "cover";

// ── Auth Gate (using ProForm LoginForm) ─────────────────────────────────

function AuthGate({ onAuth }: { onAuth: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoginForm
        title="Starlight Gatherer"
        subTitle="管理后台"
        onFinish={async (values) => {
          if (values.password === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, "1");
            onAuth();
            return;
          }
          throw new Error("密码错误");
        }}
      >
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined />,
          }}
          placeholder="输入管理密码"
          rules={[{ required: true, message: "请输入密码" }]}
        />
      </LoginForm>
    </div>
  );
}

// ── Status message helper ──────────────────────────────────────────────

function useStatus() {
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return { statusMsg, flash };
}

function StatusBanner({
  msg,
}: {
  msg: { type: "ok" | "err"; text: string } | null;
}) {
  if (!msg) return null;
  return (
    <div
      className={`mb-6 px-4 py-2 rounded-lg text-sm font-medium ${
        msg.type === "ok"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {msg.text}
    </div>
  );
}

// ── Tabs component ─────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "archives", label: "Archives" },
  { key: "events", label: "Events" },
  { key: "series", label: "Series" },
  { key: "cover", label: "Series Cover" },
];

function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <div className="flex gap-1 mb-8 bg-slate-100 rounded-xl p-1">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            active === t.key
              ? "bg-white text-red-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Archives Tab ───────────────────────────────────────────────────────

function ArchivesTab() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Archive>>({});
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const { statusMsg, flash } = useStatus();

  const fetchArchives = useCallback(async () => {
    const res = await fetch("/api/v1/archives");
    const data = await res.json();
    setArchives(data);
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const startEdit = (a: Archive) => {
    setEditing(a.id);
    setEditData({
      title: a.title,
      videoUrl: a.videoUrl,
      bv: a.bv,
      isTranslated: a.isTranslated,
      eventId: a.eventId
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
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          title: editData.title,
          videoUrl: editData.videoUrl,
          bv: editData.bv,
          isTranslated: editData.isTranslated,
          eventId: editData.eventId
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
      a.title?.toLowerCase().includes(filter.toLowerCase()) ||
      a.bv?.toLowerCase()?.includes(filter.toLowerCase()) || 
      a.event?.title?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <StatusBanner msg={statusMsg} />
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
              <th className="px-4 py-3">活动ID</th>
              <th className="px-4 py-3">活动</th>
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
                      <input
                        type="text"
                        value={editData.eventId ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, eventId: parseInt(e.target.value) })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium">
                      {a.event?.title ?? "-"}
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
                      {a.eventId ?? "-"}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium">
                      {a.event?.title ?? "-"}
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
    </>
  );
}

// ── Events Tab ─────────────────────────────────────────────────────────

function EventsTab() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [seriesTypes, setSeriesTypes] = useState<SeriesTypeRow[]>([]);
  const [allSeries, setAllSeries] = useState<{ id: number; title: string }[]>(
    []
  );
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [mergeTarget, setMergeTarget] = useState<number | null>(null);
  const [merging, setMerging] = useState(false);
  const { statusMsg, flash } = useStatus();

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/v1/events");
    const data = await res.json();
    setEvents(data);
  }, []);

  const fetchSeriesTypes = useCallback(async () => {
    const res = await fetch("/api/v1/series-crud");
    // SeriesType data is embedded in series, but we need types directly
    // Fetch from the types relation - for now derive from events
    const seriesData: SeriesRow[] = await res.json();
    // Derive series types from the series list
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

  const startEdit = (ev: EventRow) => {
    setEditing(ev.id);
    setEditData({
      title: ev.title,
      typeId: ev.typeId,
      seriesId: ev.seriesId,
      date: ev.date,
      isVirtual: ev.isVirtual,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/events/${editing}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(editData),
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Save failed");
        return;
      }
      flash("ok", "Saved");
      setEditing(null);
      fetchEvents();
    } catch {
      flash("err", "Network error");
    } finally {
      setSaving(false);
    }
  };

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
      const sourceIds = Array.from(selected).filter((id) => id !== mergeTarget);
      // Move all archives from source events to target event
      await fetch(`/api/v1/events/${mergeTarget}/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ sourceIds }),
      });
      flash("ok", `Merged ${sourceIds.length} events into #${mergeTarget}`);
      setSelected(new Set());
      setMergeTarget(null);
      fetchEvents();
    } catch {
      flash("err", "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm(`Delete event #${id}?`)) return;
    try {
      const res = await fetch(`/api/v1/events/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY },
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Delete failed");
        return;
      }
      flash("ok", "Deleted");
      fetchEvents();
    } catch {
      flash("err", "Network error");
    }
  };

  const displayed = events.filter(
    (ev) => {
      if (filter[0] === '#') {
        return ev.id === parseInt(filter.substring(1));
      }
      else {
        return ev.title.toLowerCase().includes(filter.toLowerCase()) ||
          ev.series?.title.toLowerCase().includes(filter.toLowerCase()) ||
          ev.type?.name.toLowerCase().includes(filter.toLowerCase());
      }
    }
  );

  return (
    <>
      <StatusBanner msg={statusMsg} />
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="搜索活动标题、系列名或类型..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md px-4 py-3 rounded-xl border border-slate-200 bg-white
                     focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 text-sm"
        />
        {selected.size > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={mergeTarget ?? ""}
              onChange={(e) =>
                setMergeTarget(e.target.value ? Number(e.target.value) : null)
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    displayed.length > 0 &&
                    displayed.every((ev) => selected.has(ev.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected(new Set(displayed.map((ev) => ev.id)));
                    } else {
                      setSelected(new Set());
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">日期</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">系列</th>
              <th className="px-4 py-3">Archives</th>
              <th className="px-4 py-3">虚拟</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((ev) => (
              <tr
                key={ev.id}
                className={`border-t border-slate-100 hover:bg-slate-50/50 transition-colors ${
                  selected.has(ev.id) ? "bg-red-50/30" : ""
                }`}
              >
                {editing === ev.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(ev.id)}
                        onChange={() => toggleSelect(ev.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {ev.id}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={(editData.title as string) ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={(editData.date as string)?.split("T")[0] ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, date: e.target.value || null })
                        }
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={(editData.typeId as number) ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            typeId: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      >
                        <option value="">-</option>
                        {seriesTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={(editData.seriesId as number) ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            seriesId: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      >
                        <option value="">-</option>
                        {allSeries.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {ev._count.archives}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={editData.isVirtual as boolean}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            isVirtual: e.target.checked,
                          })
                        }
                      />
                    </td>
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
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(ev.id)}
                        onChange={() => toggleSelect(ev.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {ev.id}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium">
                      {ev.title}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {ev.date ? new Date(ev.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {ev.type?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {ev.series?.title ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {ev._count.archives}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {ev.isVirtual ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(ev)}
                          className="text-xs text-blue-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="text-xs text-red-500 font-bold hover:underline"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">
            没有匹配的记录
          </p>
        )}
      </div>
    </>
  );
}

// ── Series Tab ─────────────────────────────────────────────────────────

function SeriesTab() {
  const [seriesList, setSeriesList] = useState<SeriesRow[]>([]);
  const [seriesTypes, setSeriesTypes] = useState<SeriesTypeRow[]>([]);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const { statusMsg, flash } = useStatus();

  const fetchSeries = useCallback(async () => {
    const res = await fetch("/api/v1/series-crud");
    const data = await res.json();
    setSeriesList(data);
    // Derive series types
    const typeMap = new Map<number, string>();
    data.forEach((s: SeriesRow) => {
      if (s.seriesType) typeMap.set(s.seriesType.id, s.seriesType.name);
    });
    setSeriesTypes(
      Array.from(typeMap.entries()).map(([id, name]) => ({ id, name }))
    );
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const startEdit = (s: SeriesRow) => {
    setEditing(s.id);
    setEditData({
      title: s.title,
      seriesTypeId: s.seriesTypeId,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/series-crud/${editing}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(editData),
      });
      if (!res.ok) {
        const err = await res.json();
        flash("err", err.error || "Save failed");
        return;
      }
      flash("ok", "Saved");
      setEditing(null);
      fetchSeries();
    } catch {
      flash("err", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const deleteSeries = async (id: number) => {
    if (!confirm(`Delete series #${id}?`)) return;
    try {
      const res = await fetch(`/api/v1/series-crud/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY },
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

  const displayed = seriesList.filter(
    (s) =>
      s.title.toLowerCase().includes(filter.toLowerCase()) ||
      s.seriesType?.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <StatusBanner msg={statusMsg} />
      <input
        type="text"
        placeholder="搜索系列名或类型..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 bg-white
                   focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 mb-8 text-sm"
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">Events</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((s) => (
              <tr
                key={s.id}
                className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                {editing === s.id ? (
                  <>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {s.id}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={(editData.title as string) ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={(editData.seriesTypeId as number) ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            seriesTypeId: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                      >
                        <option value="">-</option>
                        {seriesTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s._count.events}
                    </td>
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
                      {s.id}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium">
                      {s.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {s.seriesType?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s._count.events}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="text-xs text-blue-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSeries(s.id)}
                          className="text-xs text-red-500 font-bold hover:underline"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">
            没有匹配的记录
          </p>
        )}
      </div>
    </>
  );
}

// ── Series Cover Upload Tab ────────────────────────────────────────────

function CoverTab() {
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
      // Reset file input
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

// ── Main Admin Page ────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("archives");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthenticated(true);
    }
  }, []);

  if (!authenticated) {
    return (
      <ConfigProvider>
        <AuthGate onAuth={() => setAuthenticated(true)} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider>
      <App>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black">管理后台</h1>
            <button
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setAuthenticated(false);
              }}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              退出登录
            </button>
          </div>

          <TabBar active={activeTab} onChange={setActiveTab} />

          {activeTab === "archives" && <ArchivesTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "series" && <SeriesTab />}
          {activeTab === "cover" && <CoverTab />}
        </main>
      </App>
    </ConfigProvider>
  );
}
