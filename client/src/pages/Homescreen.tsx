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
import { TrendingUp, Star, Film, Play, Camera } from "lucide-react";
import { getCached, setCached } from "@/lib/cache";
// Define your Movie type for all-movies grid
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  trending: boolean;
}

export default function MovieRaterHomeScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  // Stats state
  const [nowPlayingCount, setNowPlayingCount] = useState<number>(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);

  // Trending state
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrendingMovie[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Mock “all movies” for the All Movies section
  const movies: Movie[] = [
    // populate with { id, title, overview, poster, trending }
  ];

  useEffect(() => {
    const now = getCached<number>("nowPlaying", 60_000); // 1 min TTL
    const rev = getCached<number>("totalReviews", 60_000);
    const tr = getCached<TrendingMovie[]>("trending", 60_000);

    if (now != null && rev != null && tr) {
      setNowPlayingCount(now);
      setTotalReviewsCount(rev);
      setTrendingMovies(tr);
      setLoadingTrending(false);
    } else {
      Promise.all([
        api.get<{ count: number }>("/api/movies/now_playing/count"),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        api.get("/api/movies/trending"),
      ])
        .then(([nowR, revR, trR]) => {
          setNowPlayingCount(nowR.data.count);
          setTotalReviewsCount(revR.count!);
          setTrendingMovies(trR.data.results);
          setCached("nowPlaying", nowR.data.count);
          setCached("totalReviews", revR.count!);
          setCached("trending", trR.data.results);
        })
        .finally(() => setLoadingTrending(false));
    }
  }, []);

  // fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = (user.user_metadata as any) || {};
        setUsername(meta.username || "");
      }
    });
  }, []);

  // Fetch stats & trending on mount
  useEffect(() => {
    api
      .get<{ count: number }>("/api/movies/now_playing/count")
      .then(({ data }) => setNowPlayingCount(data.count))
      .catch(() => console.error("Failed to fetch now playing count"));

    (async () => {
      const { count, error } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true });
      if (!error && count !== null) setTotalReviewsCount(count);
    })();

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
      setSearchError("Search failed.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated BG Icons */}
      <div className="absolute inset-0">
        <div className="absolute top-24 left-12 text-yellow-400/20 animate-pulse">
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
        <header
          className="
            mb-8
            backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4
            flex flex-col items-start gap-4
            sm:flex-row sm:justify-between sm:items-center
          "
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Film className="text-red-500 w-8 h-8" />
              <Star className="absolute -top-1 -right-1 text-yellow-400 w-4 h-4 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-purple-500 bg-clip-text text-transparent">
              RateMyReel
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-white font-medium text-sm sm:text-base">
              Hi, {username}
            </p>
            <Button
              onClick={handleLogout}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm sm:text-base"
            >
              Log Out
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
          <StatsCards
            total={nowPlayingCount}
            trending={trendingMovies.length}
            reviews={totalReviewsCount}
          />
        </div>

        {/* Trending Section */}
        <div className="mb-8">
          <TrendingSection
            movies={trendingMovies}
            loading={loadingTrending}
            error={trendingError}
          />
        </div>

        {/* SearchBar */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim() ? (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Search Results
            </h2>
            {loadingSearch && <p className="text-gray-300">Searching…</p>}
            {searchError && <p className="text-red-400">{searchError}</p>}
            <MovieGrid>
              {searchResults.map((m) => (
                <Link key={m.id} to={`/movies/${m.id}`}>
                  <Card
                    className="
          backdrop-blur-xl
          bg-white/10
          border
          border-white/20
          rounded-2xl
          overflow-hidden
          hover:shadow-lg
          transition-shadow
        "
                  >
                    <div className="relative">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                        alt={m.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white line-clamp-1">
                        {m.title}
                      </h3>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {m.overview}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </MovieGrid>
          </section>
        ) : (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              All Movies
            </h2>
            <MovieGrid>
              {movies.map((m) => (
                <Link key={m.id} to={`/movies/${m.id}`}>
                  <Card className="relative hover:shadow-lg">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                    <CardContent>
                      <h3 className="font-semibold line-clamp-1 text-white">
                        {m.title}
                      </h3>
                      <p className="text-sm line-clamp-2 text-gray-300">
                        {m.overview}
                      </p>
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
