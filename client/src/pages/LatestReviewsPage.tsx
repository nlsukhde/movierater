// src/pages/LatestReviewsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Film, Play, Camera } from "lucide-react";

interface ReviewRow {
  id: number;
  movie_id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface MovieInfo {
  poster_path: string;
  title: string;
}

export default function LatestReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [movieMeta, setMovieMeta] = useState<
    Record<number, { poster: string; title: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load latest reviews
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, movie_id, username, rating, comment, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Failed to fetch latest reviews:", error);
        setError("Could not load reviews.");
      } else if (data) {
        setReviews(data as ReviewRow[]);
      }
      setLoading(false);
    })();
  }, []);

  // Fetch movie poster and title for each unique movie_id
  useEffect(() => {
    const uniqueIds = Array.from(new Set(reviews.map((r) => r.movie_id)));
    if (!uniqueIds.length) return;

    (async () => {
      const entries = await Promise.all(
        uniqueIds.map(async (mid) => {
          try {
            const res = await api.get<MovieInfo>(`/api/movies/${mid}`);
            return [
              mid,
              { poster: res.data.poster_path, title: res.data.title },
            ] as const;
          } catch {
            return [mid, { poster: "", title: "" }] as const;
          }
        })
      );
      setMovieMeta(Object.fromEntries(entries));
    })();
  }, [reviews]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[...Array(10)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
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
      {/* Animated background elements */}
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
        {/* Page header with Back button */}
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

        <main>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => {
                const meta = movieMeta[r.movie_id] || { poster: "", title: "" };
                return (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/movies/${r.movie_id}`)}
                    className="cursor-pointer"
                  >
                    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                      {meta.poster && (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${meta.poster}`}
                          alt={meta.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <CardHeader className="p-4 pt-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">
                          {meta.title}
                        </h3>
                        <div className="mt-1 flex justify-between items-center text-xs text-gray-300">
                          <span>{r.username}</span>
                          <span>{formatDate(r.created_at)}</span>
                        </div>
                        <div className="mt-2">{renderStars(r.rating)}</div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-gray-300 line-clamp-3">
                          {r.comment || "—"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-300 mt-8">No reviews yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}
