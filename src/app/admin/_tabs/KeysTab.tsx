"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiKeyRow } from "../_types";
import { PERM_LABELS } from "../_constants";
import { useStatus } from "../_hooks/useStatus";
import { StatusBanner } from "../_components/StatusBanner";

export function KeysTab() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState(31); // all except manage_keys
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const { statusMsg, flash } = useStatus();

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/v1/api-keys");
    if (res.ok) {
      setKeys(await res.json());
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/v1/api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName.trim(), permissions: newPerms }),
    });
    if (!res.ok) {
      const err = await res.json();
      flash("err", err.error || "Create failed");
      return;
    }
    const data = await res.json();
    setCreatedKey(data.key);
    flash("ok", "Key created — copy it now, it won't be shown again");
    setShowCreate(false);
    setNewName("");
    fetchKeys();
  };

  const deleteKey = async (id: number) => {
    if (!confirm(`Delete API key #${id}?`)) return;
    const res = await fetch(`/api/v1/api-keys/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      flash("err", err.error || "Delete failed");
      return;
    }
    flash("ok", "Deleted");
    fetchKeys();
  };

  const togglePerm = (bit: number) => {
    setNewPerms((prev) => (prev & bit ? prev & ~bit : prev | bit));
  };

  const permBadgeList = (perms: number) =>
    PERM_LABELS.filter((p) => perms & p.bit).map((p) => p.label);

  return (
    <>
      <StatusBanner msg={statusMsg} />

      {createdKey && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
          <p className="font-bold text-blue-700 mb-1">New API Key (copy now!):</p>
          <code className="block bg-white px-3 py-2 rounded border text-xs break-all">
            {createdKey}
          </code>
          <button
            onClick={() => setCreatedKey(null)}
            className="mt-2 text-xs text-blue-500 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold
                     hover:bg-blue-700 transition-colors"
        >
          + Create Key
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 max-w-lg">
          <h3 className="font-bold mb-4">New API Key</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Editor Team"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Permissions
            </label>
            <div className="flex flex-wrap gap-2">
              {PERM_LABELS.map((p) => (
                <label
                  key={p.bit}
                  className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                    newPerms & p.bit
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!(newPerms & p.bit)}
                    onChange={() => togglePerm(p.bit)}
                    className="hidden"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createKey}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Last Used</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr
                key={k.id}
                className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {k.id}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{k.prefix}...</td>
                <td className="px-4 py-3 font-medium">{k.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {permBadgeList(k.permissions).map((label) => (
                      <span
                        key={label}
                        className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {k.lastUsedAt
                    ? new Date(k.lastUsedAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(k.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteKey(k.id)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-sm text-slate-400 text-center"
                >
                  No API keys
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
