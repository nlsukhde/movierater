import React, { useState } from "react";
import {
  Star,
  TrendingUp,
  Calendar,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  reviewCount: number;
  poster: string;
  trending: boolean;
}

interface User {
  name: string;
  avatar?: string;
}

const MovieRaterHomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Mock user data
  const currentUser: User = {
    name: "Alex Johnson",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };

  // Mock movie data
  const movies: Movie[] = [
    {
      id: 1,
      title: "Guardians of the Galaxy Vol. 3",
      year: 2023,
      genre: ["Action", "Adventure", "Comedy"],
      rating: 8.2,
      reviewCount: 1247,
      poster: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
      trending: true,
    },
    {
      id: 2,
      title: "Spider-Man: Across the Spider-Verse",
      year: 2023,
      genre: ["Animation", "Action", "Adventure"],
      rating: 9.1,
      reviewCount: 2156,
      poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      trending: true,
    },
    {
      id: 3,
      title: "John Wick: Chapter 4",
      year: 2023,
      genre: ["Action", "Thriller", "Crime"],
      rating: 8.7,
      reviewCount: 1893,
      poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
      trending: false,
    },
    {
      id: 4,
      title: "Fast X",
      year: 2023,
      genre: ["Action", "Crime", "Thriller"],
      rating: 7.3,
      reviewCount: 987,
      poster: "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
      trending: false,
    },
    {
      id: 5,
      title: "The Little Mermaid",
      year: 2023,
      genre: ["Family", "Fantasy", "Romance"],
      rating: 7.8,
      reviewCount: 1432,
      poster: "https://image.tmdb.org/t/p/w500/ym1dxyOk4jFcSl4Q2zmRrA5BEEN.jpg",
      trending: false,
    },
    {
      id: 6,
      title: "Transformers: Rise of the Beasts",
      year: 2023,
      genre: ["Action", "Adventure", "Sci-Fi"],
      rating: 7.1,
      reviewCount: 756,
      poster: "https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg",
      trending: false,
    },
  ];

  const genres = [
    "all",
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Family",
    "Fantasy",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === "all" || movie.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const trendingMovies = movies.filter((movie) => movie.trending);

  const renderStars = (rating: number) => {
    const stars = Math.round(rating / 2); // Convert 10-point scale to 5-star
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">🎬</div>
              <h1 className="text-2xl font-bold">MovieRate</h1>
            </div>

            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  Movie Enthusiast
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Movies
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movies.length}</div>
              <p className="text-xs text-muted-foreground">Latest releases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trending Now
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trendingMovies.length}</div>
              <p className="text-xs text-muted-foreground">
                Hot picks this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reviews
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {movies
                  .reduce((acc, movie) => acc + movie.reviewCount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Community ratings</p>
            </CardContent>
          </Card>
        </div>

        {/* Trending Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingMovies.map((movie) => (
              <Card
                key={movie.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE2Ij5Nb3ZpZSBQb3N0ZXI8L3RleHQ+Cjwvc3ZnPg==";
                    }}
                  />
                  <Badge className="absolute top-2 right-2 bg-red-500">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    {renderStars(movie.rating)}
                    <span className="text-sm text-muted-foreground">
                      {movie.year}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {movie.reviewCount.toLocaleString()} reviews
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 2).map((g) => (
                      <Badge key={g} variant="secondary" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* All Movies Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Movies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE4Ij5Nb3ZpZSBQb3N0ZXI8L3RleHQ+Cjwvc3ZnPg==";
                    }}
                  />
                  {movie.trending && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 text-sm">
                    {movie.title}
                  </h3>
                  <div className="space-y-2">
                    {renderStars(movie.rating)}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{movie.year}</span>
                      <span>{movie.reviewCount} reviews</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.slice(0, 2).map((g) => (
                        <Badge key={g} variant="outline" className="text-xs">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No movies found matching your criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieRaterHomeScreen;
