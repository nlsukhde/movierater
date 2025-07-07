import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Film,
  Play,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface MovieDetail {
  id: number;
  title: string;
  description: string;
  release_date: string;
  runtime: number;
  genres: string[];
  director: string[];
  cast: string[];
  poster_path: string;
}

interface Review {
  id: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editHoverRating, setEditHoverRating] = useState(0);

  useEffect(() => {
    if (!movieId) {
      setError("Invalid movie ID");
      setLoading(false);
      return;
    }
    api
      .get<MovieDetail>(`/api/movies/${movieId}`)
      .then((res) => setMovie(res.data))
      .catch(() => setError("Failed to load movie details"))
      .finally(() => setLoading(false));
  }, [movieId]);

  const startEditing = (r: Review) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const renderEditableStars = (
    rating: number,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const sizeCls = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" }[size];
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeCls} cursor-pointer transition-colors ${
              i < (editHoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onMouseEnter={() => setEditHoverRating(i + 1)}
            onMouseLeave={() => setEditHoverRating(0)}
            onClick={() => setEditRating(i + 1)}
          />
        ))}
      </div>
    );
  };

  const saveEditedReview = async () => {
    if (editingReviewId === null || !currentUser) return;
    const { error: updErr } = await supabase
      .from("reviews")
      .update({
        rating: editRating,
        comment: editComment || null,
      })
      .eq("id", editingReviewId)
      .eq("user_id", currentUser.id);

    if (updErr) {
      setReviewError(updErr.message);
    } else {
      cancelEditing();
      loadReviews();
    }
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, user_id, username, rating, comment, created_at, helpful")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (error) {
      setReviewError("Failed to load reviews.");
      return;
    }
    const mapped = data.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.username,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString(),
      helpful: r.helpful,
    }));
    setReviews(mapped);

    if (currentUser) {
      const youReviewed = mapped.some((r) => r.userId === currentUser.id);
      setHasReviewed(youReviewed);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [movieId]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDeleteReview = async (reviewId: number) => {
    if (!currentUser) return;
    if (
      !window.confirm(
        "Are you sure you want to delete your review for this movie?"
      )
    )
      return;

    const { error: deleteErr } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", currentUser.id);

    if (deleteErr) {
      setReviewError(deleteErr.message);
    } else {
      loadReviews();
    }
  };

  const calculateAverage = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  // Updated renderStars: no hover highlight when not interactive
  const renderStars = (
    rating: number,
    interactive = false,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const sizeCls = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" }[size];
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => {
          const isFilled =
            i < (interactive ? hoverRating || userRating : rating);
          const fillClass = isFilled
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300";
          const hoverClass = interactive ? " hover:text-yellow-400" : "";
          return (
            <Star
              key={i}
              className={`${sizeCls} ${
                interactive ? "cursor-pointer" : ""
              } transition-colors ${fillClass}${hoverClass}`}
              onMouseEnter={() => interactive && setHoverRating(i + 1)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && setUserRating(i + 1)}
            />
          );
        })}
      </div>
    );
  };

  const handleSubmitReview = async () => {
    if (userRating < 1 || !currentUser) return;

    setReviewError(null);
    setReviewMessage(null);

    const { data: existing, error: existErr } = await supabase
      .from("reviews")
      .select("id")
      .eq("movie_id", movieId)
      .eq("user_id", currentUser.id);

    if (existErr) {
      setReviewError(existErr.message);
      return;
    }

    const isUpdate = (existing ?? []).length > 0;

    const payload = [
      {
        movie_id: movieId,
        user_id: currentUser.id,
        username: currentUser.user_metadata.username,
        rating: userRating,
        comment: reviewComment || null,
        helpful: 0,
      },
    ];
    const { error: upsertErr } = await supabase
      .from("reviews")
      .upsert(payload, { onConflict: "user_id,movie_id" });

    if (upsertErr) {
      setReviewError(upsertErr.message);
    } else {
      setReviewMessage(
        isUpdate
          ? "✅ Your review has been updated!"
          : "✅ Thanks for your review!"
      );
      setHasReviewed(true);
      loadReviews();
    }
  };

  if (loading)
    return (
      <p className="p-4 text-center text-gray-300">Loading movie details…</p>
    );
  if (error) return <p className="p-4 text-center text-red-400">{error}</p>;
  if (!movie)
    return <p className="p-4 text-center text-gray-300">Movie not found.</p>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background icons */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-12 text-yellow-400/20 animate-pulse">
          <Star size={28} />
        </div>
        <div className="absolute top-40 right-20 text-red-400/20 animate-bounce">
          <Film size={32} />
        </div>
        <div className="absolute bottom-32 left-20 text-blue-400/20 animate-pulse">
          <Play size={28} />
        </div>
        <div className="absolute bottom-20 right-32 text-purple-400/20 animate-bounce">
          <Camera size={36} />
        </div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-4 sticky top-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Film className="text-red-500 w-6 h-6" />
              <Star className="absolute -top-1 -right-1 text-yellow-400 w-4 h-4 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-purple-500 bg-clip-text text-transparent">
              RateMyReel
            </h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Info Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full rounded-2xl object-cover border border-white/20"
                />
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-3xl font-bold text-white">
                    {movie.title}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(movie.release_date)}</span>
                    <Clock className="w-4 h-4" />
                    <span>{movie.runtime} min</span>
                    <Users className="w-4 h-4" />
                    <span>{reviews.length} reviews</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <Badge
                        key={g}
                        className="bg-white/10 text-white border border-white/20"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    {renderStars(calculateAverage(), false, "lg")}
                    <span className="text-2xl font-bold text-white">
                      {calculateAverage()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Synopsis</h3>
                  <p className="text-gray-300">{movie.description}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white">Director</h4>
                      <p className="text-gray-300">
                        {movie.director.join(", ")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Cast</h4>
                      <p className="text-gray-300">{movie.cast.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Reviews Card */}
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5 text-white" />
                  User Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewError && (
                  <p className="text-sm text-red-400">{reviewError}</p>
                )}
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <Card
                      key={r.id}
                      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">
                            {r.userName}
                          </span>
                          <span className="text-xs text-gray-300">
                            {r.date}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingReviewId === r.id ? (
                          <>
                            {/* — Edit Mode — */}
                            <div className="space-y-2">
                              <Label className="text-white">Your Rating</Label>
                              {renderEditableStars(editRating, "md")}
                              <Label
                                htmlFor="editComment"
                                className="text-white"
                              >
                                Comment
                              </Label>
                              <Textarea
                                id="editComment"
                                rows={3}
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="
                                      bg-white/10
                                      border
                                      border-white/20
                                      rounded-lg
                                      p-2
                                      text-white
                                      placeholder-gray-400
                                      focus:border-red-400
                                      focus:ring-2
                                      focus:ring-red-400/20
                                    "
                                placeholder="Edit your review…"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={saveEditedReview}
                                  disabled={editRating < 1}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={cancelEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* — Read Mode — */}
                            <div className="flex items-center mb-2">
                              {renderStars(r.rating, false, "sm")}
                            </div>
                            <p className="text-white">{r.comment}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-300">Certified</p>
                              {currentUser?.id === r.userId && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => startEditing(r)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteReview(r.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-300">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
            {/* ← Insert confirmation here */}
            {reviewMessage && (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
                <p className="text-center text-sm text-green-400">
                  {reviewMessage}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {!hasReviewed ? (
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Rate This Movie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label className="text-white">Your Rating</Label>
                  {renderStars(userRating, true, "lg")}
                  <Label htmlFor="comment" className="mt-2 text-white">
                    Review (optional)
                  </Label>
                  <Textarea
                    id="comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="
                    bg-white/10
                    border
                    border-white/20
                    rounded-lg
                    p-2
                    text-white
                    placeholder-gray-400
                    focus:border-red-400
                    focus:ring-2
                    focus:ring-red-400/20
                  "
                    placeholder="Share your thoughts…"
                  />
                  <Button
                    onClick={handleSubmitReview}
                    disabled={!userRating}
                    className="w-full"
                  >
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
                <CardContent className="text-center text-white">
                  ✅ Thanks!
                </CardContent>
              </Card>
            )}

            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Rating Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">No data yet.</CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Movie Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Average Rating</span>
                  <span>{calculateAverage()}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Reviews</span>
                  <span>{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Release Year</span>
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
