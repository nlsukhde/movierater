from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from pymongo.errors import DuplicateKeyError
from bson.objectid import ObjectId
from flask_jwt_extended import create_access_token
import datetime
from db import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    # Basic input validation
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    # Check if user already exists
    if db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists."}), 409

    # Hash password
    hashed_pw = generate_password_hash(password)

    # Insert user
    user = {
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.datetime.utcnow()
    }

    result = db.users.insert_one(user)

    return jsonify({
        "message": "User created successfully.",
        "user_id": str(result.inserted_id)
    }), 201