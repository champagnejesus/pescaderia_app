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
