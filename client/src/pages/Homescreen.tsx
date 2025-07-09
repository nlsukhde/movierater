import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

import { StatsCards } from "../components/StatsCards";
import { TrendingSection } from "../components/TrendingSection";
import type { TrendingMovie } from "../components/TrendingSection";
import { SearchBar } from "../components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Film, Play, Camera } from "lucide-react";
import { getCached, setCached } from "@/lib/cache";

export default function MovieRaterHomeScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // stats
  const [nowPlayingCount, setNowPlayingCount] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  // lists
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TrendingMovie[]>([]);

  // loading & error
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [loadingNowPlaying, setLoadingNowPlaying] = useState(true);
  const [nowPlayingError, setNowPlayingError] = useState<string | null>(null);

  // search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrendingMovie[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // which panel is active?
  const [activeCategory, setActiveCategory] = useState<
    "trending" | "nowPlaying"
  >("trending");

  // ref to scroll to when results appear
  const resultsRef = useRef<HTMLDivElement>(null);

  // fetch counts & lists on mount
  useEffect(() => {
    const nowCnt = getCached<number>("nowPlayingCount", 60_000);
    if (nowCnt != null) {
      setNowPlayingCount(nowCnt);
    } else {
      api
        .get<{ count: number }>("/api/movies/now_playing/count")
        .then((r) => {
          setNowPlayingCount(r.data.count);
          setCached("nowPlayingCount", r.data.count);
        })
        .finally(() => {});
    }

    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count !== null) setTotalReviewsCount(count);
      });

    api
      .get("/api/movies/trending")
      .then((r) => setTrendingMovies(r.data.results))
      .catch(() => setTrendingError("Failed to load trending"))
      .finally(() => setLoadingTrending(false));

    api
      .get("/api/movies/now_playing")
      .then((r) => setNowPlayingMovies(r.data.results))
      .catch(() => setNowPlayingError("Failed to load in-theaters"))
      .finally(() => setLoadingNowPlaying(false));
  }, []);

  // fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = (user.user_metadata as any) || {};
        setUsername(meta.username || "");
      }
    });
  }, []);

  // scroll into view when results change
  useEffect(() => {
    if (searchResults.length > 0) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [searchResults]);

  // search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const r = await api.get("/api/movies/search", {
        params: { query: searchQuery },
      });
      setSearchResults(r.data.results);
    } catch {
      setSearchError("Search failed.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // pick which to show under trending
  const displayMovies =
    activeCategory === "trending" ? trendingMovies : nowPlayingMovies;
  const displayLoading =
    activeCategory === "trending" ? loadingTrending : loadingNowPlaying;
  const displayError =
    activeCategory === "trending" ? trendingError : nowPlayingError;

  // placeholder for all-movies
  const movies = [] as any[];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* animated icons */}
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* header */}
        <header className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
            <Link to="/my-reviews">
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm sm:text-base">
                My Reviews
              </Button>
            </Link>

            <Link to="/recommendations">
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                For You
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm sm:text-base"
            >
              Log Out
            </Button>
          </div>
        </header>

        {/* stats */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
          <StatsCards
            total={nowPlayingCount}
            trending={trendingMovies.length}
            reviews={totalReviewsCount}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* search bar */}
        <div className="mb-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        {/* trending/now playing */}
        <div className="mb-8">
          <TrendingSection
            movies={displayMovies}
            loading={displayLoading}
            error={displayError}
          />
        </div>

        {/* search results */}
        {searchQuery.trim() ? (
          <section ref={resultsRef}>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Search Results
            </h2>
            {loadingSearch && <p className="text-gray-300">Searching…</p>}
            {searchError && <p className="text-red-400">{searchError}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
              {searchResults.map((m) => (
                <Link key={m.id} to={`/movies/${m.id}`} className="h-full">
                  <Card className="relative flex flex-col h-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow p-0">
                    <div className="relative w-full aspect-[2/3] bg-gray-800">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                        alt={m.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    <CardContent className="p-4 flex flex-col flex-grow">
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
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              All Movies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
              {movies.map((m: any) => (
                <Link key={m.id} to={`/movies/${m.id}`} className="h-full">
                  <Card className="relative flex flex-col h-full hover:shadow-lg rounded-2xl overflow-hidden p-0">
                    <div className="relative w-full aspect-[2/3] bg-gray-800">
                      <img
                        src={m.poster}
                        alt={m.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                    <CardContent className="p-4 flex flex-col flex-grow">
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
