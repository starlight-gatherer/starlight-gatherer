export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
export const SESSION_KEY = process.env.NEXT_PUBLIC_ADMIN_SESSION_KEY ?? "admin-auth";
export const API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY ?? "";

export const TRANSLATED_LABELS: Record<number, string> = {
  [-1]: "未知",
  0: "生肉",
  1: "熟肉",
  2: "机翻",
};

export const TRANSLATED_OPTIONS: { value: number; label: string }[] = [
  { value: -1, label: "未知" },
  { value: 0, label: "生肉" },
  { value: 1, label: "熟肉" },
  { value: 2, label: "机翻" },
];

export const TABS: { key: import("./_types").TabKey; label: string }[] = [
  { key: "archives", label: "Archives" },
  { key: "events", label: "Events" },
  { key: "series", label: "Series" },
  { key: "cover", label: "Series Cover" },
];
