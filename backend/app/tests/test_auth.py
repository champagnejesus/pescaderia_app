from app.services.auth_service import hash_password, verify_password, create_access_token
from jose import jwt
from app.config import settings

def test_password_hashing():
    hashed = hash_password("test123")
    assert verify_password("test123", hashed)
    assert not verify_password("wrong", hashed)

def test_token_creation():
    token = create_access_token({"sub": "1", "email": "test@test.com"})
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    assert payload["sub"] == "1"
    assert payload["email"] == "test@test.com"

def test_refresh_token_creation_and_decode():
    from app.services.auth_service import create_refresh_token, decode_token
    token = create_refresh_token({"sub": "1", "email": "test@test.com"})
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "1"
    assert payload["type"] == "refresh"

def test_decode_invalid_token():
    from app.services.auth_service import decode_token
    assert decode_token("invalid-token") is None
