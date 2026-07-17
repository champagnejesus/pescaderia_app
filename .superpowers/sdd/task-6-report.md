# Task 6: CRUD Products Endpoints - Report

## Status: Complete

## Commits
- `7a731c8` `feat(backend): add CRUD products endpoints`

## Files Changed
- **Created:** `backend/app/services/product_service.py` — full CRUD service with `get_products`, `get_product`, `create_product`, `update_product`, `delete_product`, `adjust_stock`, `get_low_stock`
- **Overwritten:** `backend/app/routers/products.py` — from stub to full router with list, create, read, update, delete, stock adjust, and low-stock endpoints
- **Created:** `backend/app/tests/test_products.py` — two async tests: create+list, get by ID
- **Modified:** `backend/app/tests/conftest.py` — fixed `async_session` fixture to use `@pytest_asyncio.fixture` so it properly resolves as async generator

## Test Results
```
app/tests/test_products.py::test_create_and_list_products PASSED
app/tests/test_products.py::test_get_product_by_id PASSED
```

## Concerns
- `conftest.py` had to be fixed: `@pytest.fixture` on an `async def` generator doesn't work with pytest-asyncio strict mode; changed to `@pytest_asyncio.fixture`
- Second test needed to capture `p.id` before `commit()` to avoid expired object lazy-load issues
- No pytest config file exists — `pytest-asyncio` warns about unset `asyncio_default_fixture_loop_scope`
