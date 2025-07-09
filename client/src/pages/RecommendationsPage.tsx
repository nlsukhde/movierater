// src/pages/RecommendationsPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { TrendingSection } from "../components/TrendingSection";
import type { TrendingMovie } from "../components/TrendingSection";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [recs, setRecs] = useState<TrendingMovie[]>([]);
  const [topGenres, setTopGenres] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{
        results: TrendingMovie[];
        top_genres: string[];
        message?: string;
      }>("/api/movies/recommendations")
      .then((r) => {
        setRecs(r.data.results);
        setTopGenres(r.data.top_genres);
        setMessage(r.data.message ?? null);
      })
      .catch(() => setError("Failed to load recommendations."))
      .finally(() => setLoading(false));
  }, []);

  // If user has no reviews yet, show CTA
  if (
    !loading &&
    !error &&
    (message === "No high-rated movies yet" || recs.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          No Recommendations Yet
        </h1>
        <p className="text-gray-300 mb-6 text-center">
          It looks like you haven’t rated any movies yet.
          <br />
          Head back to the home page to add some reviews and unlock personalized
          recommendations!
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/homescreen")}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            Rate Movies
          </Button>
          <Link to="/homescreen">
            <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Recommended for You
        </h1>
        <Link to="/homescreen">
          <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            Home
          </Button>
        </Link>
      </header>

      {loading ? (
        <p className="text-gray-300">Loading recommendations…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <>
          {topGenres.length > 0 && (
            <p className="mb-4 text-gray-200">
              Recommended because you like {topGenres.join(", ")} movies.
            </p>
          )}
          <TrendingSection movies={recs} loading={false} error={null} />
        </>
      )}
    </div>
  );
}
