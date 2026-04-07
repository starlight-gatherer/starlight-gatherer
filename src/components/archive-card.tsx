"use client";

import { TagBadge, translationToVariant } from "./tag-badge";
import { handleVideoAction } from "@/lib/actions";

interface ArchiveCardProps {
  id: string;
  title: string;
  bv: string | null;
  isTranslated: number;
  year: number;
  videoUrl: string | null;
  isClip: boolean;
  seriesTitle?: string | null;
  seriesVol?: number | null;
}

export function ArchiveCard({
  id, title, bv, isTranslated, year, videoUrl, isClip, seriesTitle, seriesVol,
}: ArchiveCardProps) {
  return (
    <article
      onClick={() => handleVideoAction({ id, videoUrl, title })}
      className="group relative bg-white rounded-2xl border border-slate-100 p-5
                 hover:border-red-300 hover:shadow-lg hover:shadow-red-50
                 transition-all duration-300 cursor-pointer break-inside-avoid"
    >
      <div className="absolute top-4 right-4 text-3xl font-black text-slate-100 leading-none select-none">
        {year}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <TagBadge variant={translationToVariant(isTranslated)} />
        {isClip && <TagBadge variant="clip" />}
        {seriesTitle && (
          <TagBadge variant="series" label={`${seriesTitle}${seriesVol ? ` #${seriesVol}` : ""}`} />
        )}
      </div>
      <h3 className="font-bold text-sm text-slate-800 leading-snug line-clamp-3 group-hover:text-red-600 transition-colors">
        {title}
      </h3>
      {bv && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{bv}</span>
        </div>
      )}
    </article>
  );
}
