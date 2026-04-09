"use client";

export function SaveCancelButtons({
  saving,
  onSave,
  onCancel,
}: {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <td className="px-4 py-3">
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="text-xs text-green-600 font-bold hover:underline disabled:opacity-50"
        >
          {saving ? "..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    </td>
  );
}
