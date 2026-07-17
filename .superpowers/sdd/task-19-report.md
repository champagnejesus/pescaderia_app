# Task 19 — Android: Theme Dark/Light + Dashboard Toggle

**Status:** ✅ Complete

**Commit:** `12b8b29` — `feat(android): add light/dark theme toggle with dashboard button`

## Files Modified

1. **`Color.kt`** — Added 18 light mode color definitions (LightBackground, LightSurface, LightPrimary, etc.)
2. **`Theme.kt`** — Replaced `AbyssalColorScheme` with `DarkColorScheme`, added `LightColorScheme`, added `isDarkTheme: Boolean = true` parameter to `MyApplicationTheme`, conditional `colorScheme` selection
3. **`ErpViewModel.kt`** — Added `_isDarkMode`/`isDarkMode` StateFlow, `toggleTheme()` function
4. **`Screens.kt`** — Replaced Notifications `IconButton` in `DashboardScreen` top bar with theme toggle button using `Icons.Default.DarkMode`/`Icons.Default.LightMode` based on `isDarkMode` state
5. **`MainActivity.kt`** — Added `val isDarkMode by viewModel.isDarkMode.collectAsState()`, passes `isDarkTheme = isDarkMode` to `MyApplicationTheme`

## Concerns

- Screens other than Dashboard still use hardcoded `Abyssal*` colors directly (e.g. `AbyssalBackground`, `AbyssalTextPrimary`) instead of `MaterialTheme.colorScheme.*`. The theme toggle will affect `MaterialTheme.colorScheme` values but existing hardcoded color references will remain dark. A full migration to semantic `MaterialTheme.colorScheme` usage across all screens would be needed for a complete light theme experience.
- The CRLF warnings from Git are non-blocking — the files work correctly regardless.
