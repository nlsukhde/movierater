// MovieRaterHomeScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

// your new components
import { StatsCards } from "../components/StatsCards";
import { TrendingSection } from "../components/TrendingSection";
import type { TrendingMovie } from "../components/TrendingSection";
import { SearchBar } from "../components/SearchBar";
import { MovieGrid } from "../components/MovieGrid";

// UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  reviewCount: number;
  poster: string;
  trending: boolean;
}

export default function MovieRaterHomeScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  // Trending state
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrendingMovie[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Mock “all movies” for StatsCards and later “All Movies” grid
  const movies: Movie[] = [
    /* … */
  ];
  const totalReviews = movies.reduce((sum, m) => sum + m.reviewCount, 0);

  // fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (user) {
        const meta = (user.user_metadata as any) || {};
        setUsername(meta.username || "");
      }
    });
  }, []);

  // fetch trending
  useEffect(() => {
    api
      .get("/api/movies/trending")
      .then((res) => setTrendingMovies(res.data.results))
      .catch(() => setTrendingError("Failed to load trending."))
      .finally(() => setLoadingTrending(false));
  }, []);

  // search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const res = await api.get("/api/movies/search", {
        params: { query: searchQuery },
      });
      setSearchResults(res.data.results);
    } catch {
      setSearchError("Search failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  // logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ← NAVBAR / HEADER */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">🎬</div>
            <h1 className="text-2xl font-bold">MovieRate</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Hello, {username}</p>
            <Button onClick={handleLogout} variant="outline">
              Log Out
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <StatsCards
          total={movies.length}
          trending={trendingMovies.length}
          reviews={totalReviews}
        />

        {/* Trending Section */}
        <TrendingSection
          movies={trendingMovies}
          loading={loadingTrending}
          error={trendingError}
        />

        {/* Search + Filter */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Results vs All Movies */}
        {searchQuery.trim() ? (
          <section>
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            {loadingSearch && <p>Searching…</p>}
            {searchError && <p className="text-red-600">{searchError}</p>}
            {!loadingSearch && !searchError && searchResults.length === 0 && (
              <p className="text-muted-foreground">No results found.</p>
            )}
            <MovieGrid>
              {searchResults.map((m) => (
                <Link key={m.id} to={`/movies/${m.id}`}>
                  <Card className="hover:shadow-lg">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                      alt={m.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <CardContent>
                      <h3 className="font-semibold line-clamp-1">{m.title}</h3>
                      <p className="text-sm line-clamp-2">{m.overview}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </MovieGrid>
          </section>
        ) : (
          <section>
            <h2 className="text-2xl font-bold mb-4">All Movies</h2>
            <MovieGrid>
              {movies.map((m) => (
                <Link key={m.id} to={`/movies/${m.id}`}>
                  <Card className="hover:shadow-lg">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {m.trending ? "Hot" : ""}
                    </Badge>
                    <CardContent>
                      <h3 className="font-semibold line-clamp-1">{m.title}</h3>
                      {/* rating, year, etc. */}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </MovieGrid>
          </section>
        )}
      </div>
    </div>
  );
}
