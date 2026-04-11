"use client";

import { Collapse } from "antd";
import { TagBadge, translationToVariant } from "./tag-badge";
import { handleVideoAction } from "@/lib/actions";
import { Calendar } from "lucide-react";

interface ArchiveData {
  id: number;
  title: string;
  bv: string | null;
  isTranslated: number;
  year: number;
  videoUrl: string | null;
  isClip: boolean;
  seriesVol: number | null;
}

export interface EventCardData {
  id: number;
  title: string;
  date: Date | null;
  seriesTitle: string | null;
  archives: ArchiveData[];
}

function ArchiveItem({ archive }: { archive: ArchiveData }) {
  const tags = [];
  const transVariant = translationToVariant(archive.isTranslated);
  if (transVariant !== "unknown") {
    tags.push(<TagBadge key="trans" variant={transVariant} />);
  }
  if (archive.isClip) {
    tags.push(<TagBadge key="clip" variant="clip" />);
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleVideoAction({ id: archive.id, videoUrl: archive.videoUrl, title: archive.title });
      }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-1 mb-1">
          {tags}
        </div>
        <p className="text-sm text-slate-700 font-medium line-clamp-2 group-hover:text-red-600 transition-colors">
          {archive.title}
        </p>
        {archive.bv && (
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1 inline-block">
            {archive.bv}
          </span>
        )}
      </div>
    </div>
  );
}

export function EventCard({ event }: { event: EventCardData }) {
  const archiveCount = event.archives.length;
  const dateStr = event.date
    ? event.date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
    : null;

  return (
    <Collapse
      bordered={false}
      className="event-card-collapse"
      items={[
        {
          key: String(event.id),
          label: (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 text-left">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  {dateStr && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  )}
                  {event.seriesTitle && (
                    <TagBadge variant="series" label={event.seriesTitle} />
                  )}
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-bold text-slate-300">
                {archiveCount}个资源
              </span>
            </div>
          ),
          children: (
            <div className="divide-y divide-slate-100">
              {event.archives.map((a) => (
                <ArchiveItem key={a.id} archive={a} />
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
