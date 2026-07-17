### Task 19: Android — Theme Dark/Light + Dashboard Toggle

Add light theme support and a dark/light toggle to the dashboard. The Android app currently only has dark mode (Abyssal Slate dark). Need to add light mode colors, a light color scheme, a `isDarkMode` state in ViewModel, and a toggle icon in the dashboard top bar.

**Files to modify:**
- `Color.kt` — add light color definitions
- `Theme.kt` — add light color scheme + `isDarkTheme` parameter
- `ErpViewModel.kt` — add `isDarkMode` StateFlow + toggleTheme()
- `Screens.kt` — add toggle icon button in DashboardScreen top bar
- `MainActivity.kt` — observe isDarkMode, pass to MyApplicationTheme

#### 1. Color.kt — Add Light Colors

Add the following after existing dark color definitions:

```kotlin
// Light Mode Colors
val LightBackground = Color(0xFFF2F2F7)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceHigh = Color(0xFFE8E8ED)
val LightSurfaceHighest = Color(0xFFD1D1D6)
val LightOutline = Color(0xFFC6C6C8)
val LightOutlineVariant = Color(0xFFAEAEB2)
val LightPrimary = Color(0xFF5E5CE6)
val LightPrimaryLight = Color(0xFF3634A3)
val LightOnPrimary = Color(0xFFFFFFFF)
val LightGreen = Color(0xFF34C759)
val LightGreenBg = Color(0x2634C759)
val LightYellow = Color(0xFFFFCC02)
val LightYellowBg = Color(0x26FFCC02)
val LightRed = Color(0xFFFF3B30)
val LightRedBg = Color(0x26FF3B30)
val LightTextPrimary = Color(0xFF1C1C1E)
val LightTextSecondary = Color(0xFF8E8E93)
val LightTextSecondaryVariant = Color(0xFF3C3C43)
```

#### 2. Theme.kt — Add Light Scheme + isDarkTheme Param

Replace existing code:

```kotlin
package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = AbyssalPrimary,
    onPrimary = AbyssalOnPrimary,
    primaryContainer = AbyssalPrimary,
    onPrimaryContainer = AbyssalOnPrimary,
    secondary = AbyssalGreen,
    onSecondary = AbyssalBackground,
    tertiary = AbyssalYellow,
    onTertiary = AbyssalBackground,
    background = AbyssalBackground,
    onBackground = AbyssalTextPrimary,
    surface = AbyssalSurface,
    onSurface = AbyssalTextPrimary,
    surfaceVariant = AbyssalSurfaceHigh,
    onSurfaceVariant = AbyssalTextSecondaryVariant,
    outline = AbyssalOutline,
    outlineVariant = AbyssalOutlineVariant,
    error = AbyssalRed
)

private val LightColorScheme = lightColorScheme(
    primary = LightPrimary,
    onPrimary = LightOnPrimary,
    primaryContainer = LightPrimaryLight,
    onPrimaryContainer = LightPrimary,
    secondary = LightGreen,
    onSecondary = LightOnPrimary,
    tertiary = LightYellow,
    onTertiary = LightOnPrimary,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceHigh,
    onSurfaceVariant = LightTextSecondaryVariant,
    outline = LightOutline,
    outlineVariant = LightOutlineVariant,
    error = LightRed
)

@Composable
fun MyApplicationTheme(
    isDarkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (isDarkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

#### 3. ErpViewModel.kt — Add isDarkMode

Add after `_loginError`:

```kotlin
private val _isDarkMode = MutableStateFlow(true)
val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

fun toggleTheme() {
    _isDarkMode.value = !_isDarkMode.value
}
```

#### 4. Screens.kt — Add Toggle Icon in Dashboard Top Bar

Find the `DashboardScreen` top bar `Row` with buttons. There's already an `IconButton(onClick = {})` for Notifications and an AccountCircle icon. Replace the Notifications section with:

```kotlin
IconButton(onClick = { viewModel.toggleTheme() }) {
    Icon(
        imageVector = Icons.Default.DarkMode,
        contentDescription = "Toggle theme",
        tint = AbyssalTextPrimary
    )
}
```

Wait, need a conditional icon. Use a composable that observes `viewModel.isDarkMode`:

```kotlin
val isDarkMode by viewModel.isDarkMode.collectAsState()
// ... in the top bar Row ...
IconButton(onClick = { viewModel.toggleTheme() }) {
    Icon(
        imageVector = if (isDarkMode) Icons.Default.DarkMode else Icons.Default.LightMode,
        contentDescription = "Toggle theme",
        tint = AbyssalTextPrimary
    )
}
```

Replace the existing Notifications IconButton in DashboardScreen with this toggle.

#### 5. MainActivity.kt — Wire Theme Mode

Add import for `collectAsState` if needed. Then in `setContent`:

```kotlin
val isDarkMode by viewModel.isDarkMode.collectAsState()

MyApplicationTheme(isDarkTheme = isDarkMode) {
    // ... existing content ...
}
```

**Commit:**
```bash
git add app/src/main/java/com/example/ui/theme/ app/src/main/java/com/example/ui/ErpViewModel.kt app/src/main/java/com/example/ui/Screens.kt app/src/main/java/com/example/MainActivity.kt
git commit -m "feat(android): add light/dark theme toggle with dashboard button"
```
