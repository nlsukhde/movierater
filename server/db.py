from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()  # Make sure .env is loaded here too

mongo_uri = os.environ.get('MONGO_URI')
mongo_client = MongoClient(mongo_uri)
db = mongo_client["movie_rater"]