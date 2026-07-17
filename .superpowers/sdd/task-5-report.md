# Task 5: Auth Service + Endpoints — Report

**Status:** ✅ Complete

## Files Created/Modified
- `backend/app/services/auth_service.py` — new (password hashing, token creation, register/authenticate)
- `backend/app/routers/auth.py` — overwritten (POST /register, POST /login endpoints)
- `backend/app/tests/test_auth.py` — new (password hashing & token tests)
- `backend/requirements.txt` — pinned `bcrypt==4.1.3` (passlib 1.7.4 incompatibility with bcrypt 5.x)

## Test Results
```
app/tests/test_auth.py::test_password_hashing PASSED
app/tests/test_auth.py::test_token_creation PASSED
```

## Commit
```
64eec40 feat(backend): add auth with register, login, JWT
```

## Concerns
- bcrypt 5.x breaks passlib 1.7.4 — pinned to `bcrypt==4.1.3` as a fix.
