// MovieGrid.tsx
import React from "react";

interface MovieGridProps {
  children: React.ReactNode;
}

export function MovieGrid({ children }: MovieGridProps) {
  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {children}
    </div>
  );
}
