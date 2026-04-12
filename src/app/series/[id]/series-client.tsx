"use client";

import { Collapse } from "antd";
import { TagBadge, translationToVariant } from "@/components/tag-badge";
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
}

interface EventData {
  id: number;
  title: string;
  date: string | null;
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

export function SeriesClient({
  events,
  seriesTitle,
  seriesTypeName,
  totalArchives,
}: {
  events: EventData[];
  seriesTitle: string;
  seriesTypeName: string | null;
  totalArchives: number;
}) {
  const collapseItems = events.map((event) => ({
    key: String(event.id),
    label: (
      <div className="flex items-center gap-3 py-1" id={`event-${event.id}`}>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 text-left">
            {event.title}
          </h2>
          {event.date && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
              <Calendar className="w-3 h-3" />
              {event.date}
            </span>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-bold text-slate-300">
          {event.archives.length}个资源
        </span>
      </div>
    ),
    children: event.archives.length > 0 ? (
      <div className="divide-y divide-slate-100">
        {event.archives.map((a) => (
          <ArchiveItem key={a.id} archive={a} />
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-400 italic p-3">暂无视频资源</p>
    ),
  }));

  return (
    <main className="max-w-7xl mx-auto px-6 py-16 flex gap-8">
      {/* Event sidebar */}
      {/* {events.length > 1 && (
        <aside className="hidden lg:block w-40 shrink-0">
          <nav className="sticky top-24">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3">
              活动导航
            </p>
            <ul className="space-y-1">
              {events.map((event) => (
                <li key={event.id}>
                  <a
                    href={`#event-${event.id}`}
                    className="block text-xs font-medium text-slate-400 hover:text-red-500 transition-colors py-1 truncate"
                    title={event.title}
                  >
                    {event.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )} */}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">
            {seriesTitle}
          </h1>
          <p className="text-slate-400 font-medium">
            {events.length} 个活动 · {totalArchives} 项资源
            {seriesTypeName && (
              <span className="ml-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                {seriesTypeName}
              </span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="scroll-mt-24">
              <Collapse
                bordered={false}
                className="event-card-collapse"
                items={[
                  collapseItems.find((item) => item.key === String(event.id))!,
                ]}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
