// MovieDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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

  // Movie state
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Authenticated user ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Rating form state
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  // 3.1) Track editing state
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editHoverRating, setEditHoverRating] = useState(0);

  // Fetch movie details from your Flask API
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

  // 3.2) Kick off edit: prefill fields
  const startEditing = (r: Review) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment);
  };

  // 3.3) Cancel edit
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

  // 3.4) Save edited review
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

  // Load reviews from Supabase
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
    setReviews(
      data.map((r) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.username,
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.created_at).toLocaleDateString(),
        helpful: r.helpful,
      }))
    );
  };

  useEffect(() => {
    loadReviews();
  }, [movieId]);

  // Helpers
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

  const renderStars = (
    rating: number,
    interactive = false,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const sizeCls = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" }[size];
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeCls} ${
              interactive ? "cursor-pointer" : ""
            } transition-colors ${
              i < (interactive ? hoverRating || userRating : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onMouseEnter={() => interactive && setHoverRating(i + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && setUserRating(i + 1)}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = async () => {
    if (userRating < 1 || !currentUser) return;

    setReviewError(null);
    setReviewMessage(null);

    // 1) Check for an existing review
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

    // 2) Upsert the review (will INSERT or UPDATE based on the unique constraint)
    const { error: upsertErr } = await supabase.from("reviews").upsert(
      [
        {
          movie_id: movieId,
          user_id: currentUser.id,
          username: currentUser.user_metadata.username,
          rating: userRating,
          comment: reviewComment || null,
          helpful: 0,
        },
      ],
      { onConflict: ["user_id", "movie_id"] }
    );

    if (upsertErr) {
      setReviewError(upsertErr.message);
    } else {
      // 3) Show the right message
      setReviewMessage(
        isUpdate
          ? "✅ Your review has been updated!"
          : "✅ Thanks for your review!"
      );
      loadReviews();
    }
  };

  if (loading) return <p className="p-4 text-center">Loading movie details…</p>;
  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;
  if (!movie) return <p className="p-4 text-center">Movie not found.</p>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-xl">🎬</div>
            <span className="font-semibold">MovieRate</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Movie Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(movie.release_date)}</span>
                <Clock className="w-4 h-4" />
                <span>{movie.runtime} min</span>
                <Users className="w-4 h-4" />
                <span>{reviews.length} reviews</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Badge key={g}>{g}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {renderStars(calculateAverage(), false, "lg")}
                <span className="text-2xl font-bold">{calculateAverage()}</span>
              </div>
              <h3 className="font-semibold">Synopsis</h3>
              <p className="text-muted-foreground">{movie.description}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Director</h4>
                  <p className="text-muted-foreground">
                    {movie.director.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Cast</h4>
                  <p className="text-muted-foreground">
                    {movie.cast.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                User Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewError && (
                <p className="text-sm text-red-600">{reviewError}</p>
              )}
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <Card key={r.id} className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.date}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingReviewId === r.id ? (
                        <>
                          {/* ——— Edit mode ——— */}
                          <div className="space-y-2">
                            <Label>Your Rating</Label>
                            {renderEditableStars(editRating, "md")}
                            <Label htmlFor="editComment">Comment</Label>
                            <Textarea
                              id="editComment"
                              rows={3}
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={saveEditedReview}
                                disabled={editRating < 1}
                              >
                                Save
                              </Button>
                              <Button variant="outline" onClick={cancelEditing}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* ——— Read mode ——— */}
                          <div className="flex items-center mb-2">
                            {renderStars(r.rating, false, "sm")}
                          </div>
                          <p>{r.comment}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              Helpful: {r.helpful}
                            </p>
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
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        {reviewMessage && (
          <p className="mb-4 text-sm text-green-600">{reviewMessage}</p>
        )}

        {/* Sidebar: rating form + stats */}
        <div className="space-y-6">
          {!hasReviewed ? (
            <Card>
              <CardHeader>
                <CardTitle>Rate This Movie</CardTitle>
                <CardDescription>Share your thoughts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Your Rating</Label>
                {renderStars(userRating, true, "lg")}
                <Label htmlFor="comment" className="mt-2">
                  Review (optional)
                </Label>
                <Textarea
                  id="comment"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
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
            <Card>
              <CardContent className="text-center">✅ Thanks!</CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>No data yet.</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movie Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
  );
}
