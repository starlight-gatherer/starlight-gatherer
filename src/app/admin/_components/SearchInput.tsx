"use client";

export function SearchInput({
  placeholder,
  value,
  onChange,
  className = "",
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 mb-8 text-sm ${className}`}
    />
  );
}
