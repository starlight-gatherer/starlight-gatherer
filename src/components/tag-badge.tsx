type TagVariant = "cooked" | "raw" | "machine" | "clip" | "series" | "unknown";

const variantStyles: Record<TagVariant, string> = {
  cooked:   "bg-red-500/10 text-red-600 border-red-500/20",
  raw:      "bg-slate-100 text-slate-500 border-slate-200",
  machine:  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  clip:     "bg-violet-500/10 text-violet-600 border-violet-500/20",
  series:   "bg-blue-500/10 text-blue-600 border-blue-500/20",
  unknown:  "bg-slate-50 text-slate-400 border-slate-100",
};

const variantLabels: Record<TagVariant, string> = {
  cooked: "熟肉",
  raw: "生肉",
  machine: "机翻",
  clip: "切片",
  series: "",
  unknown: "未知",
};

interface TagBadgeProps {
  variant: TagVariant;
  label?: string;
}

export function TagBadge({ variant, label }: TagBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${variantStyles[variant]}`}>
      {label ?? variantLabels[variant]}
    </span>
  );
}

export function translationToVariant(t: number): TagVariant {
  switch (t) {
    case 0: return "raw";
    case 1: return "cooked";
    case 2: return "machine";
    default: return "unknown";
  }
}
