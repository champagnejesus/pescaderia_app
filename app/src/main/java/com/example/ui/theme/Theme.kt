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
