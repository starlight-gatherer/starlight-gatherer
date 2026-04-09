"use client";

export function StatusBanner({
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
