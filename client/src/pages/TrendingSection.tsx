// TrendingSection.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export interface TrendingMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
}

interface TrendingSectionProps {
  movies: TrendingMovie[];
  loading: boolean;
  error: string | null;
}

export function TrendingSection({
  movies,
  loading,
  error,
}: TrendingSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Trending This Week</h2>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((m) => (
          <Card
            key={m.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                alt={m.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge className="absolute top-2 right-2 bg-red-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {m.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {m.overview}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
