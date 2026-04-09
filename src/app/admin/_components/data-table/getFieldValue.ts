import type { FieldAccessor } from "./types";

export function getFieldValue<T>(
  row: T,
  accessor: FieldAccessor<T>
): unknown {
  if (typeof accessor === "function") {
    return accessor(row);
  }
  return accessor.split(".").reduce<unknown>((obj, key) => {
    if (obj == null || typeof obj !== "object") return undefined;
    return (obj as Record<string, unknown>)[key];
  }, row);
}
