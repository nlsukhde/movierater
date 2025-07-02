import os, jwt
from flask import request, abort

# load your secret from env
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def verify_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        abort(401)
    token = auth.split(None, 1)[1]

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            issuer="https://yafdqpkldekwmbmhinmi.supabase.co/auth/v1"
        )
        return payload
    except jwt.PyJWTError:
        abort(401)
