// src/pages/LatestReviewsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Film, Play, Camera, ArrowDown } from "lucide-react";

interface ReviewWithMeta {
  id: number;
  movie_id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  poster_path: string;
  title: string;
}

export default function LatestReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithMeta[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const loadPage = async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await api.get<{ reviews: ReviewWithMeta[] }>(
        "/api/movies/community/latest_reviews",
        { params: { page: pageNum, limit: PAGE_SIZE } }
      );
      const fetched = res.data.reviews;
      setReviews((prev) => (pageNum === 1 ? fetched : [...prev, ...fetched]));
      setHasMore(fetched.length === PAGE_SIZE);
      setPage(pageNum);
    } catch {
      setError("Could not load latest community reviews.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(10)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  if (loading)
    return <p className="p-4 text-center text-gray-300">Loading reviews…</p>;
  if (error) return <p className="p-4 text-center text-red-400">{error}</p>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-10 text-yellow-400/20 animate-pulse">
          <Star size={32} />
        </div>
        <div className="absolute top-32 right-16 text-red-400/20 animate-bounce">
          <Film size={40} />
        </div>
        <div className="absolute bottom-40 left-16 text-blue-400/20 animate-pulse">
          <Play size={36} />
        </div>
        <div className="absolute bottom-20 right-24 text-purple-400/20 animate-bounce">
          <Camera size={48} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Latest Community Reviews
            </h1>
          </div>
        </header>

        {/* Grid */}
        <main>
          {reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/movies/${r.movie_id}`)}
                    className="cursor-pointer h-full flex flex-col"
                  >
                    <Card className="flex flex-col h-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow p-0">
                      {r.poster_path && (
                        <div className="relative w-full aspect-[2/3] bg-gray-800">
                          <img
                            src={`https://image.tmdb.org/t/p/w300${r.poster_path}`}
                            alt={r.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <CardHeader className="p-3 pt-2">
                        <h3 className="text-sm font-semibold text-white line-clamp-1">
                          {r.title}
                        </h3>
                        <div className="mt-1 flex justify-between items-center text-xs text-gray-300">
                          <span>{r.username}</span>
                          <span>{formatDate(r.created_at)}</span>
                        </div>
                        <div className="mt-2">{renderStars(r.rating)}</div>
                      </CardHeader>

                      <CardContent className="p-3 pt-1 flex-grow overflow-hidden">
                        <p className="text-xs text-gray-300 line-clamp-3">
                          {r.comment || "—"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => loadPage(page + 1)}
                    disabled={loadingMore}
                  >
                    <ArrowDown className="w-4 h-4 mr-2" />
                    {loadingMore ? "Loading…" : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-300 mt-8">No reviews yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}
