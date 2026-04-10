export interface Archive {
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

export interface EventRow {
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

export interface SeriesRow {
  id: number;
  title: string;
  seriesTypeId: number | null;
  seriesType: { id: number; name: string } | null;
  _count: { events: number };
}

export interface SeriesTypeRow {
  id: number;
  name: string;
}

export type TabKey = "archives" | "events" | "series" | "cover" | "keys";

export interface ApiKeyRow {
  id: number;
  prefix: string;
  name: string;
  permissions: number;
  lastUsedAt: string | null;
  createdAt: string;
}
