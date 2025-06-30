# routes/movies.py

import os
import requests
from flask import Blueprint, jsonify

tmdb_bp = Blueprint("tmdb", __name__)

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY   = os.getenv("API_KEY")        # your v3 key
# (you can keep TMDB_READ_ACCESS_TOKEN around if you need v4 calls later)

@tmdb_bp.route("/trending", methods=["GET"])
def get_trending():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not set"}), 500

    url = f"{TMDB_BASE_URL}/trending/movie/day"
    params = {
        "language": "en-US",
        "api_key": TMDB_API_KEY,       # ← pass your key here
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