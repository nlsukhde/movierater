from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from db import db
from dotenv import load_dotenv
from routes.auth import auth_bp
from routes.movies import tmdb_bp
import os

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# CORS setup (adjust origins as needed)
CORS(app, supports_credentials=True)

# App configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.register_blueprint(auth_bp)
app.register_blueprint(tmdb_bp, url_prefix="/api/movies")

# Initialize JWT
jwt = JWTManager(app)



# Example test route
@app.route("/")
def index():
    return jsonify({"message": "MovieRater backend is running."})

# Entry point
if __name__ == "__main__":
    app.run(debug=True)