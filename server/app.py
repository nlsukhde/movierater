from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# CORS setup (adjust origins as needed)
CORS(app, supports_credentials=True)

# App configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')

# Initialize JWT
jwt = JWTManager(app)

# MongoDB connection
mongo_uri = os.environ.get('MONGO_URI')
mongo_client = MongoClient(mongo_uri)
db = mongo_client["movie_rater"]


# Example test route
@app.route("/")
def index():
    return jsonify({"message": "MovieRater backend is running."})

# Entry point
if __name__ == "__main__":
    app.run(debug=True)