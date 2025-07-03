from flask import Flask, jsonify
from flask_cors import CORS
from db import db
from dotenv import load_dotenv
from routes.movies import tmdb_bp
import os

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# CORS setup (adjust origins as needed)
CORS(app, origins=["https://https://ratemyreel.vercel.app"])

# App configuration
app.register_blueprint(tmdb_bp, url_prefix="/api/movies")

# Example test route
@app.route("/")
def index():
    return jsonify({"message": "MovieRater backend is running."})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
