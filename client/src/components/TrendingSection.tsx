import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

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
    <section className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-red-400" />
        <h2 className="text-2xl font-bold text-white">Trending This Week</h2>
      </div>

      {loading && <p className="text-gray-300">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((m) => (
          <Link key={m.id} to={`/movies/${m.id}`}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow bg-white/5 border border-white/20 rounded-2xl">
              <img
                src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                alt={m.title}
                className="w-full h-48 object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-red-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white line-clamp-1 mb-1">
                  {m.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {m.overview}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
