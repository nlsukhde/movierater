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
  if (loading) {
    return (
      <p className="p-4 text-center text-gray-300 animate-pulse">
        Loading trending…
      </p>
    );
  }
  if (error) {
    return <p className="p-4 text-center text-red-400">{error}</p>;
  }

  return (
    <section className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 max-w-screen-xl mx-auto">
      {/* …header… */}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
        {movies.map((m) => (
          <Link key={m.id} to={`/movies/${m.id}`} className="h-full">
            <Card className="relative flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow bg-white/5 border border-white/20 rounded-2xl p-0">
              <div className="relative w-full aspect-[2/3] bg-gray-800">
                <img
                  src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                  alt={m.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <Badge className="absolute top-2 right-2 bg-red-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>

              <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-white line-clamp-1 mb-1">
                  {m.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
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
