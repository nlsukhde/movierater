// MovieGrid.tsx
import React from "react";

interface MovieGridProps {
  children: React.ReactNode;
}

export function MovieGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {children}
    </div>
  );
}
