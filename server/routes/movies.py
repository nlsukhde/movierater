# routes/movies.py

import os
import requests
from flask import Blueprint, jsonify, request
from routes.auth import verify_token

tmdb_bp = Blueprint("tmdb", __name__)

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY   = os.getenv("API_KEY") 

@tmdb_bp.route("/trending", methods=["GET"])
def get_trending():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500
    
    user = verify_token()
    supa_id = user["sub"]   # Supabase UUID

    url = f"{TMDB_BASE_URL}/trending/movie/day"
    params = {
        "language": "en-US",
        "api_key": TMDB_API_KEY,     
    }

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
    return jsonify({ "results": movies })


@tmdb_bp.route("/search", methods=["GET"])
def search_movies():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    # required
    user = verify_token()
    supa_id = user["sub"]   # Supabase UUID

    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Missing required query parameter 'query'"}), 400

    # optional params with defaults
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
    supa_id = user["sub"]   # Supabase UUID

    # Fetch movie + credits in one call
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

    # Extract genres as list of names
    genres = [g["name"] for g in data.get("genres", [])]

    # Extract directors from crew
    crew = data.get("credits", {}).get("crew", [])
    directors = [c["name"] for c in crew if c.get("job") == "Director"]

    # Extract top-billed cast (first 5)
    cast_list = data.get("credits", {}).get("cast", [])
    cast = [c["name"] for c in cast_list[:5]]

    movie_detail = {
        "id":            data.get("id"),
        "title":         data.get("title"),
        "description":   data.get("overview"),
        "release_date":  data.get("release_date"),
        "runtime":       data.get("runtime"),
        "genres":        genres,
        "director":      directors,
        "cast":          cast,
        "poster_path":   data.get("poster_path"),
    }

    return jsonify(movie_detail)

@tmdb_bp.route("/now_playing/count", methods=["GET"])
def get_now_playing_count():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    # verify user JWT
    user = verify_token()
    supa_id = user["sub"]

    # fetch now-playing movies, page 1
    url = f"{TMDB_BASE_URL}/movie/now_playing"
    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "page": 1,
    }

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
    # count how many movies returned on this page
    count = len(data.get("results", []))

    return jsonify({"count": count})