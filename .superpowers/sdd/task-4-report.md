## Task 4: Agregar endpoint GET /{client_id}/orders

**Status:** DONE

### What was implemented

Added the `GET /{client_id}/orders` endpoint to `backend/app/routers/clients.py`:

- Imported `ClientOrdersResponse` from schemas
- Added endpoint accepting `client_id: int` and `limit: int = Query(5)`
- Calls `client_service.get_client_orders(db, client_id, limit)`
- Returns `ClientOrdersResponse(orders=orders, total=len(orders))`

### Files changed

- `backend/app/routers/clients.py` — added import and endpoint (lines 5, 41-44)

### Test results

All 8 existing client tests pass:

```
app/tests/test_clients.py::test_create_and_list_clients PASSED
app/tests/test_clients.py::test_get_client_by_id PASSED
app/tests/test_clients.py::test_update_client PASSED
app/tests/test_clients.py::test_delete_client PASSED
app/tests/test_clients.py::test_adjust_balance PASSED
app/tests/test_clients.py::test_not_found PASSED
app/tests/test_clients.py::test_get_client_orders PASSED
app/tests/test_clients.py::test_get_client_orders_empty PASSED
```

**8/8 passing, output pristine (only deprecation warnings)**

### Self-review

- **Completeness:** All 4 steps in the task brief completed exactly as specified.
- **Quality:** Follows the exact pattern of existing endpoints in the file.
- **Discipline:** No overbuilding — implemented only what was requested.
- **Testing:** Service-level tests from Task 2 already cover `get_client_orders`. No new HTTP-level tests were required by the task brief.
