import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Users,
  ThumbsUp,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  duration: string;
  description: string;
  poster: string;
  director: string;
  cast: string[];
}

interface Review {
  id: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

const MovieDetailPage: React.FC = () => {
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [hasUserReviewed, setHasUserReviewed] = useState<boolean>(false);

  // Mock current user
  const currentUser: User = {
    id: "user123",
    name: "Alex Johnson",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };

  // Mock movie data
  const movie: Movie = {
    id: 1,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    genre: ["Animation", "Action", "Adventure", "Sci-Fi"],
    duration: "140 min",
    description:
      "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society, a team of Spider-People charged with protecting the Multiverse's very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must set out on his own to save those he cares about most.",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    director: "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
    cast: [
      "Shameik Moore",
      "Hailee Steinfeld",
      "Brian Tyree Henry",
      "Luna Lauren Vélez",
      "Jake Johnson",
    ],
  };

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitReview = () => {
    if (userRating > 0) {
      const newReview: Review = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        rating: userRating,
        comment: reviewComment.trim(),
        date: new Date().toISOString().split("T")[0],
        helpful: 0,
        verified: true,
      };

      setReviews((prev) => [newReview, ...prev]);
      setHasUserReviewed(true);
      setUserRating(0);
      setReviewComment("");
    }
  };

  const calculateAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const getRatingDistribution = () => {
    const distribution = Array(10).fill(0);
    reviews.forEach((review) => {
      distribution[review.rating - 1]++;
    });
    return distribution
      .map((count, index) => ({
        rating: index + 1,
        count,
        percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
      }))
      .reverse();
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    size: "sm" | "md" | "lg" = "md"
  ) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              interactive ? "cursor-pointer" : ""
            } transition-colors ${
              i < (interactive ? hoverRating || userRating : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onMouseEnter={() => interactive && setHoverRating(i + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && handleRatingClick(i + 1)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Movies
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-xl">🎬</div>
              <span className="font-semibold">MovieRate</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE4Ij5Nb3ZpZSBQb3N0ZXI8L3RleHQ+Cjwvc3ZnPg==";
                  }}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{reviews.length} reviews</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genre.map((g) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {renderStars(
                    Math.round(calculateAverageRating()),
                    false,
                    "lg"
                  )}
                  <div className="text-2xl font-bold">
                    {calculateAverageRating()}
                  </div>
                  <div className="text-muted-foreground">
                    ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Synopsis</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Director</h4>
                    <p className="text-muted-foreground">{movie.director}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Cast</h4>
                    <p className="text-muted-foreground">
                      {movie.cast.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  User Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage
                          src={review.userAvatar}
                          alt={review.userName}
                        />
                        <AvatarFallback>
                          {review.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {review.userName}
                          </span>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating, false, "sm")}
                          <span className="font-semibold">
                            {review.rating}/10
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Rating Sidebar */}
          <div className="space-y-6">
            {/* User Rating Card */}
            {!hasUserReviewed && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Movie</CardTitle>
                  <CardDescription>
                    Share your thoughts with the community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Your Rating
                    </Label>
                    {renderStars(0, true, "lg")}
                    <div className="mt-2 text-sm text-muted-foreground">
                      {userRating > 0 && `You rated: ${userRating}/10`}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="review-comment"
                      className="text-sm font-medium"
                    >
                      Review (Optional)
                    </Label>
                    <Textarea
                      id="review-comment"
                      placeholder="Share your thoughts about this movie..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={userRating === 0}
                    className="w-full"
                  >
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasUserReviewed && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">✅</div>
                    <p className="font-medium">Thank you for your review!</p>
                    <p className="text-sm text-muted-foreground">
                      Your rating has been submitted successfully.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRatingDistribution().map((item) => (
                    <div key={item.rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-medium w-2">
                          {item.rating}
                        </span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-0 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Movie Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="font-semibold">
                    {calculateAverageRating()}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release Year</span>
                  <span className="font-semibold">{movie.year}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: 1,
    userId: "user456",
    userName: "Sarah Chen",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b2dc79e5?w=150&h=150&fit=crop&crop=face",
    rating: 9,
    comment:
      "Absolutely stunning animation and incredible storytelling! Miles Morales continues to be such a compelling character, and the multiverse concept is executed brilliantly. The visual style is revolutionary.",
    date: "2023-06-15",
    helpful: 23,
    verified: true,
  },
  {
    id: 2,
    userId: "user789",
    userName: "Mike Rodriguez",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 10,
    comment:
      "Perfect sequel! The animation pushes boundaries and the story hits all the right emotional beats. Hailee Steinfeld and Shameik Moore deliver outstanding performances.",
    date: "2023-06-12",
    helpful: 18,
    verified: true,
  },
  {
    id: 3,
    userId: "user101",
    userName: "Emma Thompson",
    rating: 8,
    comment:
      "Great movie with incredible visuals, though I felt the pacing could have been tighter in the middle act. Still highly recommend!",
    date: "2023-06-10",
    helpful: 12,
    verified: false,
  },
  {
    id: 4,
    userId: "user202",
    userName: "David Kim",
    userAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 9,
    comment:
      "The multiverse storyline is handled expertly, and the character development is top-notch. Can't wait for the next installment!",
    date: "2023-06-08",
    helpful: 15,
    verified: true,
  },
  {
    id: 5,
    userId: "user303",
    userName: "Lisa Park",
    rating: 7,
    comment:
      "Solid animation and good story, but felt a bit overwhelming with all the different Spider-People. Still enjoyable overall.",
    date: "2023-06-05",
    helpful: 8,
    verified: false,
  },
];

export default MovieDetailPage;
