"use client";

import { MasonryGrid } from "@/components/masonry-grid";
import { EventCard, EventCardData } from "@/components/event-card";

interface TimelineClientProps {
  years: number[];
  yearMap: Record<number, number[]>;
  events: EventCardData[];
}

export function TimelineClient({ years, yearMap, events }: TimelineClientProps) {
  const eventMap = new Map(events.map((e) => [e.id, e]));

  return (
    <main className="max-w-7xl mx-auto px-6 py-20 flex gap-8">
      {/* Year sidebar */}
      <aside className="hidden lg:block w-24 shrink-0">
        <nav className="sticky top-24">
          <ul className="space-y-1">
            {years.map((y) => (
              <li key={y}>
                <a
                  href={`#year-${y}`}
                  className="block text-sm font-bold text-slate-300 hover:text-red-500 transition-colors py-1"
                >
                  {y}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-800">
          时间线<span className="text-slate-300">.</span>
        </h1>
        <p className="text-slate-400 font-medium mb-16">
          按年份归档的所有活动
        </p>

        {years.map((year) => (
          <div key={year} id={`year-${year}`} className="mb-16 scroll-mt-24">
            <h2 className="text-6xl font-black text-slate-100 mb-8 select-none">{year}</h2>
            <MasonryGrid>
              {(yearMap[year] ?? []).map((eid) => {
                const event = eventMap.get(eid);
                if (!event) return null;
                return (
                  <div key={eid} className="break-inside-avoid mb-4">
                    <EventCard event={event} />
                  </div>
                );
              })}
            </MasonryGrid>
          </div>
        ))}
      </div>
    </main>
  );
}
