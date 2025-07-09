# routes/movies.py
import os
import requests
from flask import Blueprint, jsonify, request
from routes.auth import verify_token
from collections import Counter
from supabase import create_client
import time

tmdb_bp = Blueprint("tmdb", __name__)

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY   = os.getenv("API_KEY")

# Supabase client setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# simple in-memory cache: { user_id: { "data": response_json, "expires_at": timestamp } }
recommendation_cache = {}
CACHE_TTL = 300  # seconds

# movie metadata cache
_movie_meta_cache = {}  
MOVIE_META_TTL = 24 * 3600   # 24h

# trending cache
_trending_cache = {
    "data": None,        # last response payload
    "expires_at": 0      # timestamp when it must be refreshed
}
TRENDING_TTL = 300       # 5 minutes

def get_movie_meta(mid):
    now = time.time()
    entry = _movie_meta_cache.get(mid)
    if entry and entry["expires_at"] > now:
        return entry["data"]
    # otherwise fetch from TMDB
    resp = requests.get(
        f"{TMDB_BASE_URL}/movie/{mid}",
        params={"api_key": TMDB_API_KEY, "language": "en-US"}
    )
    resp.raise_for_status()
    data = resp.json()
    meta = {
      "poster_path": data.get("poster_path"),
      "title":       data.get("title")
    }
    _movie_meta_cache[mid] = {
      "data": meta,
      "expires_at": now + MOVIE_META_TTL
    }
    return meta

@tmdb_bp.route("/trending", methods=["GET"])
def get_trending():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    # 0) check cache
    now = time.time()
    if _trending_cache["data"] and _trending_cache["expires_at"] > now:
        return jsonify(_trending_cache["data"])

    # 1) auth
    user = verify_token()
    supa_id = user["sub"]

    # 2) fetch fresh trending
    url = f"{TMDB_BASE_URL}/trending/movie/day"
    params = {"language": "en-US", "api_key": TMDB_API_KEY}
    resp = requests.get(url, params=params)
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return jsonify({
            "error": "TMDB request failed",
            "status": resp.status_code,
            "detail": resp.text
        }), resp.status_code

    data = resp.json()
    top10 = data.get("results", [])[:10]
    movies = [
        {
            "id":           m["id"],
            "title":        m["title"],
            "overview":     m.get("overview"),
            "poster_path":  m.get("poster_path"),
            "release_date": m.get("release_date"),
        }
        for m in top10
    ]
    payload = {"results": movies}

    # 3) cache & return
    _trending_cache["data"] = payload
    _trending_cache["expires_at"] = now + TRENDING_TTL
    return jsonify(payload)



@tmdb_bp.route("/search", methods=["GET"])
def search_movies():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    user = verify_token()
    supa_id = user["sub"]

    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Missing required query parameter 'query'"}), 400

    include_adult = request.args.get("include_adult", "false")
    language = request.args.get("language", "en-US")
    page = request.args.get("page", 1, type=int)

    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        "api_key":       TMDB_API_KEY,
        "query":         query,
        "include_adult": include_adult,
        "language":      language,
        "page":          page,
    }

    resp = requests.get(url, params=params)
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError:
        return jsonify({
            "error": "TMDB search request failed",
            "status": resp.status_code,
            "detail": resp.text
        }), resp.status_code

    data = resp.json()
    results = [
        {
            "id":           m["id"],
            "title":        m["title"],
            "overview":     m.get("overview"),
            "poster_path":  m.get("poster_path"),
            "release_date": m.get("release_date"),
        }
        for m in data.get("results", [])
    ]
    return jsonify({"results": results})


@tmdb_bp.route("/<int:movie_id>", methods=["GET"])
def get_movie_details(movie_id):
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    user = verify_token()
    supa_id = user["sub"]

    url = f"{TMDB_BASE_URL}/movie/{movie_id}"
    params = {
        "api_key":            TMDB_API_KEY,
        "language":           "en-US",
        "append_to_response": "credits"
    }

    resp = requests.get(url, params=params)
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError:
        return jsonify({
            "error": "TMDB movie details request failed",
            "status": resp.status_code,
            "detail": resp.text
        }), resp.status_code

    data = resp.json()
    genres   = [g["name"] for g in data.get("genres", [])]
    crew     = data.get("credits", {}).get("crew", [])
    directors= [c["name"] for c in crew if c.get("job") == "Director"]
    cast_list= data.get("credits", {}).get("cast", [])[:5]
    cast     = [c["name"] for c in cast_list]

    movie_detail = {
        "id":           data.get("id"),
        "title":        data.get("title"),
        "description":  data.get("overview"),
        "release_date": data.get("release_date"),
        "runtime":      data.get("runtime"),
        "genres":       genres,
        "director":     directors,
        "cast":         cast,
        "poster_path":  data.get("poster_path"),
    }
    return jsonify(movie_detail)


@tmdb_bp.route("/now_playing/count", methods=["GET"])
def get_now_playing_count():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    user = verify_token()
    supa_id = user["sub"]

    url = f"{TMDB_BASE_URL}/movie/now_playing"
    params = {"api_key": TMDB_API_KEY, "language": "en-US", "page": 1}

    resp = requests.get(url, params=params)
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError:
        return jsonify({
            "error": "TMDB now_playing request failed",
            "status": resp.status_code,
            "detail": resp.text
        }), resp.status_code

    data = resp.json()
    count = len(data.get("results", []))
    return jsonify({"count": count})


@tmdb_bp.route("/now_playing", methods=["GET"])
def get_now_playing_list():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    user = verify_token()
    supa_id = user["sub"]

    url = f"{TMDB_BASE_URL}/movie/now_playing"
    params = {"api_key": TMDB_API_KEY, "language": "en-US", "page": request.args.get("page", 1)}

    resp = requests.get(url, params=params)
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError:
        return jsonify({
            "error": "TMDB now_playing request failed",
            "status": resp.status_code,
            "detail": resp.text
        }), resp.status_code

    return jsonify(resp.json())


# Replace your existing /recommendations route with this:
@tmdb_bp.route("/recommendations", methods=["GET"])
def get_recommendations():
    user    = verify_token()
    user_id = user["sub"]
    now     = time.time()

    # 0) Count how many movies this user has rated ≥3
    count_resp = (
        supabase.table("reviews")
        .select("rating", count="exact", head=True)
        .eq("user_id", user_id)
        .gte("rating", 3)
        .execute()
    )
    liked_count = count_resp.count or 0

    # 1) Check cache: only valid if not expired AND liked_count matches
    cache_entry = recommendation_cache.get(user_id)
    if cache_entry and cache_entry["expires_at"] > now and cache_entry["liked_count"] == liked_count:
        return jsonify(cache_entry["data"])

    # 2) Fetch all this user’s reviews (we need movie_id + rating)
    resp    = supabase.table("reviews") \
                      .select("movie_id, rating") \
                      .eq("user_id", user_id) \
                      .execute()
    reviews = resp.data or []

    # 3) Identify liked movies
    liked = [r["movie_id"] for r in reviews if r["rating"] >= 3]
    if not liked:
        payload = {"results": [], "top_genres": [], "message": "No high-rated movies yet"}
        recommendation_cache[user_id] = {
            "data":       payload,
            "expires_at": now + CACHE_TTL,
            "liked_count": liked_count
        }
        return jsonify(payload)

    # 4) Build genre profile
    genre_counts   = Counter()
    genre_name_map = {}
    for mid in liked:
        details = requests.get(
            f"{TMDB_BASE_URL}/movie/{mid}",
            params={"api_key": TMDB_API_KEY, "language": "en-US"}
        ).json()
        for g in details.get("genres", []):
            genre_counts[g["id"]] += 1
            genre_name_map[g["id"]] = g["name"]

    top_ids   = [gid for gid, _ in genre_counts.most_common(3)]
    top_names = [genre_name_map[gid] for gid in top_ids]

    # 5) Single discover call
    disc = requests.get(
        f"{TMDB_BASE_URL}/discover/movie",
        params={
            "api_key":     TMDB_API_KEY,
            "language":    "en-US",
            "with_genres": ",".join(map(str, top_ids)),
            "sort_by":     "popularity.desc",
            "page":        1,
        }
    )
    disc.raise_for_status()
    candidates = disc.json().get("results", [])

    # 6) Filter & take top 10
    seen_ids = {r["movie_id"] for r in reviews}
    recs     = []
    for m in candidates:
        if m["id"] in seen_ids:
            continue
        recs.append({
            "id":          m["id"],
            "title":       m["title"],
            "overview":    m.get("overview"),
            "poster_path": m.get("poster_path"),
        })
        if len(recs) >= 10:
            break

    payload = {"results": recs, "top_genres": top_names}

    # 7) Cache with the current liked_count
    recommendation_cache[user_id] = {
        "data":        payload,
        "expires_at":  now + CACHE_TTL,
        "liked_count": liked_count
    }
    return jsonify(payload)

# In routes/movies.py, replace your existing get_latest_reviews with this paginated version:

@tmdb_bp.route("/community/latest_reviews", methods=["GET"])
def get_latest_reviews():
    # 1) Parse pagination params
    page  = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=20, type=int)
    offset = (page - 1) * limit
    to_index = offset + limit - 1

    # 2) Fetch that slice of reviews
    resp = (
        supabase
        .table("reviews")
        .select("id, movie_id, username, rating, comment, created_at")
        .order("created_at", desc=True)
        .range(offset, to_index)
        .execute()
    )
    reviews = resp.data or []

    # 3) Batch‐get unique movie metadata via cached helper
    unique_ids = {r["movie_id"] for r in reviews}
    metas = {mid: get_movie_meta(mid) for mid in unique_ids}

    # 4) Merge and return
    out = []
    for r in reviews:
        m = metas.get(r["movie_id"], {})
        out.append({
            **r,
            "title":       m.get("title", ""),
            "poster_path": m.get("poster_path", "")
        })

    return jsonify({"reviews": out})

