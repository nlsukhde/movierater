from flask import Blueprint, request, jsonify
import os, requests

api_key = os.getenv("API_KEY")