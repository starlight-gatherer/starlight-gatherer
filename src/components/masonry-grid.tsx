import { ReactNode } from "react";

interface MasonryGridProps {
  children: ReactNode;
}

export function MasonryGrid({ children }: MasonryGridProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
      {children}
    </div>
  );
}
