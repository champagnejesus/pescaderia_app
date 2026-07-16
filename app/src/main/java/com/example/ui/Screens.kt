package com.example.ui

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.Client
import com.example.data.Order
import com.example.data.Product
import com.example.data.Supplier
import com.example.data.Transaction
import com.example.ui.theme.*
import java.util.Locale
import androidx.compose.ui.text.TextStyle

// ----------------------------------------------------
// 1. LOGIN SCREEN
// ----------------------------------------------------
@Composable
fun LoginScreen(
    viewModel: ErpViewModel,
    onLoginSuccess: () -> Unit
) {
    var username by remember { mutableStateOf("admin_peces") }
    var password by remember { mutableStateOf("admin123") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    val loginError by viewModel.loginError.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Fish Icon
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .clip(CircleShape)
                    .background(AbyssalSurfaceHigh)
                    .border(1.dp, AbyssalOutline, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.SetMeal,
                    contentDescription = "Logo",
                    tint = AbyssalPrimaryLight,
                    modifier = Modifier.size(48.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Bienvenido",
                style = MaterialTheme.typography.displayLarge,
                color = AbyssalTextPrimary,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Ingresa tus credenciales",
                style = MaterialTheme.typography.bodyLarge,
                color = AbyssalTextSecondary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(40.dp))

            // User Field
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Usuario",
                    style = MaterialTheme.typography.labelSmall,
                    color = AbyssalTextSecondary,
                    modifier = Modifier.padding(start = 12.dp, bottom = 8.dp)
                )
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    placeholder = { Text("admin_peces") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp)),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = AbyssalSurface,
                        unfocusedContainerColor = AbyssalSurface,
                        focusedBorderColor = AbyssalPrimary,
                        unfocusedBorderColor = AbyssalOutline
                    ),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Password Field
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Contraseña",
                    style = MaterialTheme.typography.labelSmall,
                    color = AbyssalTextSecondary,
                    modifier = Modifier.padding(start = 12.dp, bottom = 8.dp)
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = { Text("••••••••") },
                    leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                    trailingIcon = {
                        IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                            Icon(
                                imageVector = if (isPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = "Toggle password"
                            )
                        }
                    },
                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp)),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = AbyssalSurface,
                        unfocusedContainerColor = AbyssalSurface,
                        focusedBorderColor = AbyssalPrimary,
                        unfocusedBorderColor = AbyssalOutline
                    ),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = true
                )
            }

            if (loginError != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = loginError ?: "",
                    color = AbyssalRed,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "¿Olvidé mi contraseña?",
                style = MaterialTheme.typography.bodyMedium,
                color = AbyssalTextSecondary,
                modifier = Modifier
                    .align(Alignment.End)
                    .clickable { }
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = {
                    if (viewModel.login(username, password)) {
                        onLoginSuccess()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text("Ingresar", style = MaterialTheme.typography.titleMedium, color = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.Default.Login, contentDescription = null, tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Footer capsule
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(24.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(24.dp))
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(AbyssalGreen)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Sistema de Gestión Logística",
                    style = MaterialTheme.typography.labelSmall,
                    color = AbyssalTextSecondaryVariant
                )
            }
        }
    }
}

// ----------------------------------------------------
// 2. DASHBOARD SCREEN
// ----------------------------------------------------
@Composable
fun DashboardScreen(
    viewModel: ErpViewModel,
    onNavigateToNewOrder: () -> Unit,
    onNavigateToOrders: () -> Unit
) {
    val orders by viewModel.orders.collectAsState()
    val isDarkMode by viewModel.isDarkMode.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Dashboard",
                style = MaterialTheme.typography.displayLarge,
                color = AbyssalPrimaryLight
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                IconButton(onClick = { viewModel.toggleTheme() }) {
                    Icon(
                        imageVector = if (isDarkMode) Icons.Default.DarkMode else Icons.Default.LightMode,
                        contentDescription = "Toggle theme",
                        tint = AbyssalTextPrimary
                    )
                }
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(AbyssalSurfaceHigh)
                        .border(1.dp, AbyssalOutline, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = "Profile",
                        tint = AbyssalTextPrimary,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Large Card: Ganancia Bruta with sparkline
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(AbyssalSurface)
                .border(1.dp, AbyssalOutline, RoundedCornerShape(24.dp))
                .padding(20.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column {
                        Text(
                            text = "GANANCIA BRUTA",
                            style = MaterialTheme.typography.labelSmall,
                            color = AbyssalTextSecondary
                        )
                        Text(
                            text = "$12,450.00",
                            style = MaterialTheme.typography.displayLarge,
                            color = AbyssalTextPrimary,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(AbyssalGreenBg)
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.TrendingUp,
                            contentDescription = null,
                            tint = AbyssalGreen,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "+12.4%",
                            style = MaterialTheme.typography.labelSmall,
                            color = AbyssalGreen
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Custom Sparkline
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp)
                ) {
                    val width = size.width
                    val height = size.height

                    val points = listOf(
                        Offset(0f, height * 0.8f),
                        Offset(width * 0.25f, height * 0.7f),
                        Offset(width * 0.5f, height * 0.85f),
                        Offset(width * 0.75f, height * 0.4f),
                        Offset(width * 0.9f, height * 0.6f),
                        Offset(width, height * 0.2f)
                    )

                    val path = Path().apply {
                        moveTo(points.first().x, points.first().y)
                        for (i in 1 until points.size) {
                            lineTo(points[i].x, points[i].y)
                        }
                    }

                    // Stroke Path
                    drawPath(
                        path = path,
                        color = AbyssalPrimaryLight,
                        style = Stroke(width = 3.dp.toPx())
                    )

                    // Fill Gradient
                    val fillPath = Path().apply {
                        addPath(path)
                        lineTo(width, height)
                        lineTo(0f, height)
                        close()
                    }
                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                AbyssalPrimaryLight.copy(alpha = 0.2f),
                                Color.Transparent
                            )
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Bento Stats Grid (2 columns)
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .aspectRatio(1.25f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Analytics, contentDescription = null, tint = AbyssalPrimaryLight)
                        Text("+8%", style = MaterialTheme.typography.labelSmall, color = AbyssalGreen)
                    }
                    Column {
                        Text("Ventas", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                        Text("$4.2M", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                    }
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .aspectRatio(1.25f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.ShoppingBag, contentDescription = null, tint = AbyssalYellow)
                        Text("-3%", style = MaterialTheme.typography.labelSmall, color = AbyssalRed)
                    }
                    Column {
                        Text("Compras", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                        Text("$2.8M", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .aspectRatio(1.25f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                    Icon(Icons.Default.Payments, contentDescription = null, tint = AbyssalGreen)
                    Column {
                        Text("Efectivo", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                        Text("$840k", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                    }
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .aspectRatio(1.25f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                    Icon(Icons.Default.AccountBalance, contentDescription = null, tint = AbyssalPrimaryLight)
                    Column {
                        Text("Transferencia", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                        Text("$3.3M", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .aspectRatio(1.25f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.PendingActions, contentDescription = null, tint = AbyssalYellow)
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(AbyssalYellow)
                        )
                    }
                    Column {
                        Text("Pendientes", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                        Text("14 Pedidos", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                    }
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .aspectRatio(1.25f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(verticalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxSize()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Inventory, contentDescription = null, tint = AbyssalRed)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(AbyssalRedBg)
                                .padding(horizontal = 4.dp, vertical = 2.dp)
                        ) {
                            Text(
                                "CRÍTICO",
                                style = MaterialTheme.typography.labelSmall,
                                color = AbyssalRed,
                                fontSize = 9.sp
                            )
                        }
                    }
                    Column {
                        Text("Stock Bajo", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                        Text("5 Especies", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Section: Últimos Pedidos
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Últimos Pedidos",
                style = MaterialTheme.typography.titleMedium,
                color = AbyssalTextPrimary
            )
            Text(
                text = "VER TODO",
                style = MaterialTheme.typography.labelSmall,
                color = AbyssalPrimaryLight,
                modifier = Modifier.clickable { onNavigateToOrders() }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            orders.take(3).forEach { order ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(16.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(AbyssalSurfaceHigh),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.SetMeal, contentDescription = null, tint = AbyssalPrimaryLight)
                        }
                        Column {
                            Text(order.clientName, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                            Text("${order.itemsCount} kg • ${order.orderNumber}", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        }
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                when (order.status) {
                                    "ENTREGADO" -> AbyssalGreenBg
                                    "PENDIENTE" -> AbyssalYellowBg
                                    else -> AbyssalRedBg
                                }
                            )
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = order.status,
                            style = MaterialTheme.typography.labelSmall,
                            color = when (order.status) {
                                "ENTREGADO" -> AbyssalGreen
                                "PENDIENTE" -> AbyssalYellow
                                else -> AbyssalRed
                            },
                            fontSize = 9.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onNavigateToNewOrder,
                modifier = Modifier
                    .weight(2f)
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
            ) {
                Icon(Icons.Default.AddShoppingCart, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Nueva Venta", style = MaterialTheme.typography.titleMedium, color = Color.White)
            }
            Button(
                onClick = {},
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalSurfaceHigh),
                border = BorderStroke(1.dp, AbyssalOutline)
            ) {
                Icon(Icons.Default.QrCodeScanner, contentDescription = "Scan", tint = AbyssalTextPrimary)
            }
        }
    }
}

// ----------------------------------------------------
// 3. COMPRAS SCREEN
// ----------------------------------------------------
@Composable
fun ComprasScreen(
    viewModel: ErpViewModel
) {
    var searchQuery by remember { mutableStateOf("") }
    val transactions by viewModel.transactions.collectAsState()

    val purchases = transactions.filter { it.type == "Gasto" || it.amount < 0 }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Compras",
                style = MaterialTheme.typography.displayLarge,
                color = AbyssalPrimaryLight
            )
            Button(
                onClick = { },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Nuevo", style = MaterialTheme.typography.bodyMedium, color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Grid Bento Section
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("TOTAL MES", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("$12,450.00", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary, modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null, tint = AbyssalGreen, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("+8.2%", style = MaterialTheme.typography.bodyMedium, color = AbyssalGreen)
                    }
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("PENDIENTES", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("04", style = MaterialTheme.typography.titleLarge, color = AbyssalYellow, modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Schedule, contentDescription = null, tint = AbyssalTextSecondary, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Por recibir", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Buscar proveedor o factura...", color = AbyssalTextSecondary.copy(alpha = 0.5f)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp)),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = AbyssalSurfaceHigh,
                unfocusedContainerColor = AbyssalSurfaceHigh,
                focusedBorderColor = AbyssalPrimary,
                unfocusedBorderColor = AbyssalOutline
            ),
            shape = RoundedCornerShape(16.dp),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "RECIENTES",
            style = MaterialTheme.typography.labelSmall,
            color = AbyssalTextSecondary,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Purchase Cards List
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Static examples to match screenshots
            val mockPurchases = listOf(
                Triple("Pescados del Norte S.A.", "320kg • Merluza, Congrio", "$2,450.00"),
                Triple("Mariscos del Pacífico", "85kg • Camarón, Jaiba", "$1,120.50"),
                Triple("Distribuidora Ocean", "120kg • Salmón Premium", "$4,800.00")
            )

            mockPurchases.forEachIndexed { index, (prov, desc, price) ->
                val status = if (index == 1) "PENDIENTE" else "RECIBIDO"
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (index == 1) AbyssalGreenBg else AbyssalPrimaryLight.copy(alpha = 0.1f)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (index == 1) Icons.Default.WaterDrop else Icons.Default.SetMeal,
                                    contentDescription = null,
                                    tint = if (index == 1) AbyssalGreen else AbyssalPrimaryLight
                                )
                            }
                            Column {
                                Text(prov, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                                Text("12 Oct 2023 • #FC-882${9-index}", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                            }
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (status == "RECIBIDO") AbyssalGreenBg else AbyssalYellowBg)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = status,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (status == "RECIBIDO") AbyssalGreen else AbyssalYellow,
                                fontSize = 9.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(AbyssalOutline.copy(alpha = 0.3f))
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(desc, style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        Text(price, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                    }
                }
            }

            // Optimization Banner Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f))
                        )
                    )
                    .drawBehind {
                        // Drawing decorative geometric lines representing the clean industrial space in dark theme
                        drawRect(
                            brush = Brush.radialGradient(
                                colors = listOf(AbyssalPrimary.copy(alpha = 0.15f), Color.Transparent),
                                center = Offset(size.width * 0.7f, size.height * 0.4f),
                                radius = size.width * 0.6f
                            )
                        )
                        drawLine(
                            color = AbyssalPrimary.copy(alpha = 0.3f),
                            start = Offset(0f, size.height * 0.8f),
                            end = Offset(size.width, size.height * 0.2f),
                            strokeWidth = 1.dp.toPx()
                        )
                    }
                    .padding(16.dp),
                contentAlignment = Alignment.BottomStart
            ) {
                Column {
                    Text(
                        text = "OPTIMIZACIÓN",
                        style = MaterialTheme.typography.labelSmall,
                        color = AbyssalPrimaryLight,
                        fontSize = 10.sp
                    )
                    Text(
                        text = "Analizar proveedores de confianza",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Another card
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(AbyssalPrimaryLight.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Kitchen, contentDescription = null, tint = AbyssalPrimaryLight)
                            }
                            Column {
                                Text("Insumos Congelados Corp", style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                                Text("05 Oct 2023 • #FC-8745", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                            }
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(AbyssalGreenBg)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("RECIBIDO", style = MaterialTheme.typography.labelSmall, color = AbyssalGreen, fontSize = 9.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(AbyssalOutline.copy(alpha = 0.3f))
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("45kg • Pulpo, Calamar", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        Text("$890.00", style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 4. PRODUCTOS SCREEN
// ----------------------------------------------------
@Composable
fun ProductosScreen(
    viewModel: ErpViewModel,
    onNavigateToDetail: (Int) -> Unit
) {
    val products by viewModel.products.collectAsState()
    var selectedCategory by remember { mutableStateOf("TODOS") }
    var searchQuery by remember { mutableStateOf("") }

    val categories = listOf("TODOS", "PESCADO BLANCO", "MARISCO", "CONGELADOS")

    val filteredProducts = products.filter {
        (selectedCategory == "TODOS" || it.category == selectedCategory) &&
                it.name.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(AbyssalSurfaceHigh),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.SetMeal, contentDescription = null, tint = AbyssalPrimaryLight)
                }
                Text(
                    text = "Productos",
                    style = MaterialTheme.typography.displayLarge,
                    color = AbyssalPrimaryLight
                )
            }
            Button(
                onClick = { },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Nuevo", style = MaterialTheme.typography.bodyMedium, color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Buscar mariscos o pescados...", color = AbyssalTextSecondary.copy(alpha = 0.5f)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp)),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = AbyssalSurfaceHigh,
                unfocusedContainerColor = AbyssalSurfaceHigh,
                focusedBorderColor = AbyssalPrimary,
                unfocusedBorderColor = AbyssalOutline
            ),
            shape = RoundedCornerShape(16.dp),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Filter chips horizontal scroll row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categories.forEach { cat ->
                val isSelected = selectedCategory == cat
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .background(if (isSelected) AbyssalPrimary else AbyssalSurfaceHigh)
                        .border(1.dp, if (isSelected) AbyssalPrimary else AbyssalOutline, RoundedCornerShape(24.dp))
                        .clickable { selectedCategory = cat }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = cat,
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isSelected) Color.White else AbyssalTextSecondaryVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Lazy Products List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredProducts) { product ->
                val isLowStock = product.stock <= product.lowStockThreshold
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                        .clickable { onNavigateToDetail(product.id) }
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Product image placeholder
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(AbyssalSurfaceHigh),
                            contentAlignment = Alignment.Center
                        ) {
                            if (product.imageUrl.isNotEmpty()) {
                                AsyncImage(
                                    model = product.imageUrl,
                                    contentDescription = product.name,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Icon(Icons.Default.SetMeal, contentDescription = null, tint = AbyssalPrimaryLight, modifier = Modifier.size(36.dp))
                            }
                        }
                        Column {
                            Text(product.name, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                            Text(product.category, style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        }
                    }

                    Column(
                        horizontalAlignment = Alignment.End,
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.End) {
                            Text("STOCK", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                            Text(
                                text = "${product.stock} ${product.unit}",
                                style = MaterialTheme.typography.titleMedium,
                                color = if (isLowStock) AbyssalRed else AbyssalTextPrimary
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("PRECIO", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                            Text("${product.price}€/${product.unit}", style = MaterialTheme.typography.bodyLarge, color = AbyssalGreen)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 5. PRODUCT DETAIL SCREEN
// ----------------------------------------------------
@Composable
fun ProductDetailScreen(
    productId: Int,
    viewModel: ErpViewModel,
    onNavigateBack: () -> Unit
) {
    val productFlow = remember(productId) { viewModel.getProductById(productId) }
    val product by productFlow.collectAsState(initial = null)

    var showAdjustStockDialog by remember { mutableStateOf(false) }
    var adjustStockValue by remember { mutableStateOf("") }

    if (product == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    val prod = product!!
    val isLowStock = prod.stock <= prod.lowStockThreshold

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = AbyssalPrimary)
            }
            Text(
                text = prod.name,
                style = MaterialTheme.typography.titleLarge,
                color = AbyssalTextPrimary,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center
            )
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(AbyssalSurfaceHigh)
            ) {
                Icon(Icons.Default.AccountCircle, contentDescription = null, tint = AbyssalTextPrimary, modifier = Modifier.fillMaxSize())
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Hero Image Aspect Square with Quality badge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.2f)
                .clip(RoundedCornerShape(24.dp))
                .background(AbyssalSurface)
                .border(1.dp, AbyssalOutline, RoundedCornerShape(24.dp))
        ) {
            if (prod.imageUrl.isNotEmpty()) {
                AsyncImage(
                    model = prod.imageUrl,
                    contentDescription = prod.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.SetMeal, contentDescription = null, tint = AbyssalPrimaryLight, modifier = Modifier.size(64.dp))
                }
            }

            if (prod.isExtraQuality) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(16.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(AbyssalPrimary)
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Verified, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Calidad Extra", style = MaterialTheme.typography.labelSmall, color = Color.White)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Grid (Stock and Price)
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("STOCK ACTUAL", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Row(
                        modifier = Modifier.padding(top = 4.dp),
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Text(
                            text = "${prod.stock}",
                            style = MaterialTheme.typography.displayLarge,
                            color = if (isLowStock) AbyssalRed else AbyssalPrimaryLight
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(prod.unit, style = MaterialTheme.typography.bodyLarge, color = AbyssalTextSecondary)
                    }
                    if (isLowStock) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.TrendingDown, contentDescription = null, tint = AbyssalRed, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Bajo Stock", style = MaterialTheme.typography.labelSmall, color = AbyssalRed)
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("PRECIO / KG", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Row(
                        modifier = Modifier.padding(top = 4.dp),
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Text(
                            text = "${prod.price}",
                            style = MaterialTheme.typography.displayLarge,
                            color = AbyssalGreen
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("€", style = MaterialTheme.typography.bodyLarge, color = AbyssalTextSecondary)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null, tint = AbyssalGreen, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("+2.4% hoy", style = MaterialTheme.typography.labelSmall, color = AbyssalGreen)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Price Trend Bar Chart
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(AbyssalSurface)
                .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("TENDENCIA DE PRECIO", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("Últimos 7 días", style = MaterialTheme.typography.bodyMedium, color = AbyssalPrimaryLight)
                }
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(96.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    val heights = listOf(0.6f, 0.75f, 0.65f, 0.85f, 0.95f, 1f, 1f)
                    heights.forEachIndexed { i, h ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight(h)
                                .padding(horizontal = 4.dp)
                                .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                                .background(if (i == heights.size - 1) AbyssalGreen else AbyssalSurfaceHighest)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Description
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(AbyssalSurface)
                .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Column {
                Text("DESCRIPCIÓN", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = prod.description,
                    style = MaterialTheme.typography.bodyLarge,
                    color = AbyssalTextSecondaryVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = {
                    adjustStockValue = prod.stock.toString()
                    showAdjustStockDialog = true
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
            ) {
                Icon(Icons.Default.Scale, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Ajustar Stock", style = MaterialTheme.typography.bodyLarge)
            }
            Button(
                onClick = { },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalSurfaceHigh),
                border = BorderStroke(1.dp, AbyssalOutline)
            ) {
                Icon(Icons.Default.Edit, contentDescription = null, tint = AbyssalTextPrimary)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Editar", style = MaterialTheme.typography.bodyLarge, color = AbyssalTextPrimary)
            }
        }

        Spacer(modifier = Modifier.height(48.dp))
    }

    // Adjust Stock Dialog
    if (showAdjustStockDialog) {
        AlertDialog(
            onDismissRequest = { showAdjustStockDialog = false },
            title = { Text("Ajustar Stock", color = AbyssalTextPrimary) },
            text = {
                Column {
                    Text("Ingresa el nuevo stock para ${prod.name}:", color = AbyssalTextSecondary)
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = adjustStockValue,
                        onValueChange = { adjustStockValue = it },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = AbyssalTextPrimary,
                            unfocusedTextColor = AbyssalTextPrimary
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val d = adjustStockValue.toDoubleOrNull()
                        if (d != null) {
                            viewModel.adjustProductStock(prod.id, d)
                        }
                        showAdjustStockDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
                ) {
                    Text("Guardar", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAdjustStockDialog = false }) {
                    Text("Cancelar", color = AbyssalTextSecondary)
                }
            },
            containerColor = AbyssalSurfaceHigh
        )
    }
}

// ----------------------------------------------------
// 6. PROVEEDORES SCREEN
// ----------------------------------------------------
@Composable
fun ProveedoresScreen(
    viewModel: ErpViewModel
) {
    val suppliers by viewModel.suppliers.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val filteredSuppliers = suppliers.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
                it.category.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Proveedores",
                style = MaterialTheme.typography.displayLarge,
                color = AbyssalPrimaryLight
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(onClick = {}) {
                    Icon(Icons.Default.IosShare, contentDescription = "Share", tint = AbyssalPrimary)
                }
                Button(
                    onClick = { },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
                ) {
                    Text("Nuevo", color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Quick Stats Bento (2 columns)
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("TOTAL PROVEEDORES", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("42", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary, modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("+3 este mes", style = MaterialTheme.typography.bodyMedium, color = AbyssalGreen)
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("PENDIENTE PAGO", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("€14.2k", style = MaterialTheme.typography.titleLarge, color = AbyssalYellow, modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("5 facturas vencidas", style = MaterialTheme.typography.bodyMedium, color = AbyssalRed)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Buscar por nombre o categoría...", color = AbyssalTextSecondary.copy(alpha = 0.5f)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp)),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = AbyssalSurfaceHigh,
                unfocusedContainerColor = AbyssalSurfaceHigh,
                focusedBorderColor = AbyssalPrimary,
                unfocusedBorderColor = AbyssalOutline
            ),
            shape = RoundedCornerShape(16.dp),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Supplier List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredSuppliers) { supplier ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Logo Circle
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(AbyssalSurfaceHigh),
                            contentAlignment = Alignment.Center
                        ) {
                            if (supplier.imageUrl.isNotEmpty()) {
                                AsyncImage(
                                    model = supplier.imageUrl,
                                    contentDescription = supplier.name,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Icon(Icons.Default.LocalShipping, contentDescription = null, tint = AbyssalPrimaryLight)
                            }
                        }
                        Column {
                            Text(supplier.name, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                            Text(supplier.category, style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        }
                    }

                    Column(
                        horizontalAlignment = Alignment.End,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (supplier.status == "AL DÍA") AbyssalGreenBg else AbyssalYellowBg)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = supplier.status,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (supplier.status == "AL DÍA") AbyssalGreen else AbyssalYellow,
                                fontSize = 9.sp
                            )
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = "Detail", tint = AbyssalTextSecondary)
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 7. PEDIDOS SCREEN
// ----------------------------------------------------
@Composable
fun PedidosScreen(
    viewModel: ErpViewModel
) {
    val orders by viewModel.orders.collectAsState()
    var selectedFilter by remember { mutableStateOf("Todos") }

    val filters = listOf("Todos", "Pendientes", "Entregados", "Anulados")

    val filteredOrders = orders.filter {
        when (selectedFilter) {
            "Pendientes" -> it.status == "PENDIENTE"
            "Entregados" -> it.status == "ENTREGADO"
            "Anulados" -> it.status == "ANULADO"
            else -> true
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Pedidos",
                style = MaterialTheme.typography.displayLarge,
                color = AbyssalPrimaryLight
            )
            Button(
                onClick = { },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Nuevo", style = MaterialTheme.typography.bodyMedium, color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Horizontal filter row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            filters.forEach { filter ->
                val isSelected = selectedFilter == filter
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .background(if (isSelected) AbyssalPrimary else AbyssalSurfaceHigh)
                        .border(1.dp, if (isSelected) AbyssalPrimary else AbyssalOutline, RoundedCornerShape(24.dp))
                        .clickable { selectedFilter = filter }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = filter,
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isSelected) Color.White else AbyssalTextSecondaryVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Orders List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredOrders) { order ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column {
                            Text(
                                text = "ORDEN #${order.orderNumber}",
                                style = MaterialTheme.typography.labelSmall,
                                color = AbyssalTextSecondary
                            )
                            Text(
                                text = order.clientName,
                                style = MaterialTheme.typography.titleMedium,
                                color = AbyssalTextPrimary,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    when (order.status) {
                                        "ENTREGADO" -> AbyssalGreenBg
                                        "PENDIENTE" -> AbyssalYellowBg
                                        else -> AbyssalRedBg
                                    }
                                )
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = order.status,
                                style = MaterialTheme.typography.labelSmall,
                                color = when (order.status) {
                                    "ENTREGADO" -> AbyssalGreen
                                    "PENDIENTE" -> AbyssalYellow
                                    else -> AbyssalRed
                                },
                                fontSize = 10.sp
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        Column {
                            Text("Entrega: ${order.deliveryDate}", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondaryVariant)
                            Row(
                                modifier = Modifier.padding(top = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Inventory, contentDescription = null, tint = AbyssalTextSecondary, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("${order.itemsCount} items", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                            }
                        }
                        Text(
                            text = "$${order.totalValue}",
                            style = MaterialTheme.typography.titleLarge,
                            color = AbyssalTextPrimary
                        )
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 8. NUEVO PEDIDO SCREEN
// ----------------------------------------------------
@Composable
fun NuevoPedidoScreen(
    viewModel: ErpViewModel,
    onNavigateBack: () -> Unit
) {
    val clients by viewModel.clients.collectAsState()
    val products by viewModel.products.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedClient by remember { mutableStateOf<Client?>(null) }
    val selectedProducts = remember { mutableStateMapOf<Product, Int>() }
    var paymentMethod by remember { mutableStateOf("Efectivo") } // "Efectivo", "Transferencia"
    var isConfirmed by remember { mutableStateOf(false) }

    val filteredClients = clients.filter {
        it.name.contains(searchQuery, ignoreCase = true)
    }

    if (isConfirmed) {
        // Success Overlay Screen
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(AbyssalBackground)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Success",
                    tint = AbyssalGreen,
                    modifier = Modifier.size(96.dp)
                )
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "¡Pedido Confirmado!",
                    style = MaterialTheme.typography.displayLarge,
                    color = AbyssalTextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "El inventario se ha actualizado y el reporte de entrega ha sido enviado.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = AbyssalTextSecondary,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(40.dp))
                Button(
                    onClick = {
                        isConfirmed = false
                        selectedClient = null
                        selectedProducts.clear()
                        onNavigateBack()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
                ) {
                    Text("Volver al Dashboard", style = MaterialTheme.typography.titleMedium, color = Color.White)
                }
            }
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = AbyssalPrimary)
                }
                Text(
                    text = "Nuevo Pedido",
                    style = MaterialTheme.typography.titleLarge,
                    color = AbyssalTextPrimary
                )
            }
            IconButton(onClick = {}) {
                Icon(Icons.Default.MoreHoriz, contentDescription = "More", tint = AbyssalPrimaryLight)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Client Selector
        Column {
            Text("CLIENTE", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, modifier = Modifier.padding(start = 8.dp, bottom = 8.dp))
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Buscar cliente...", color = AbyssalTextSecondary.copy(alpha = 0.5f)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp)),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = AbyssalSurface,
                    unfocusedContainerColor = AbyssalSurface,
                    focusedBorderColor = AbyssalPrimary,
                    unfocusedBorderColor = AbyssalOutline
                ),
                shape = RoundedCornerShape(16.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Quick picked clients flow
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filteredClients.forEach { cl ->
                    val isPicked = selectedClient?.id == cl.id
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(24.dp))
                            .background(if (isPicked) AbyssalPrimaryLight.copy(alpha = 0.2f) else AbyssalSurfaceHigh)
                            .border(1.dp, if (isPicked) AbyssalPrimary else AbyssalOutline, RoundedCornerShape(24.dp))
                            .clickable { selectedClient = cl }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(AbyssalPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(cl.initials, style = MaterialTheme.typography.labelSmall, color = Color.White, fontSize = 9.sp)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(cl.name, style = MaterialTheme.typography.bodyMedium, color = if (isPicked) AbyssalPrimaryLight else AbyssalTextPrimary)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Product Picker Grid
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("PRODUCTOS", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { }
                ) {
                    Icon(Icons.Default.AddCircle, contentDescription = null, tint = AbyssalPrimary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Añadir", style = MaterialTheme.typography.bodyMedium, color = AbyssalPrimary, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                products.forEach { product ->
                    val quantity = selectedProducts[product] ?: 0
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(20.dp))
                            .background(AbyssalSurface)
                            .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(AbyssalSurfaceHigh),
                                contentAlignment = Alignment.Center
                            ) {
                                if (product.imageUrl.isNotEmpty()) {
                                    AsyncImage(
                                        model = product.imageUrl,
                                        contentDescription = product.name,
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                } else {
                                    Icon(Icons.Default.SetMeal, contentDescription = null, tint = AbyssalPrimaryLight)
                                }
                            }
                            Column {
                                Text(product.name, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                                Text("${product.stock} kg x $${product.price}", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                            }
                        }

                        // Quantity Selector
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            IconButton(
                                onClick = {
                                    if (quantity > 0) {
                                        if (quantity == 1) selectedProducts.remove(product)
                                        else selectedProducts[product] = quantity - 1
                                    }
                                }
                            ) {
                                Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Sub", tint = AbyssalTextSecondary)
                            }
                            Text(
                                text = "$quantity",
                                style = MaterialTheme.typography.titleMedium,
                                color = AbyssalTextPrimary,
                                modifier = Modifier.width(20.dp),
                                textAlign = TextAlign.Center
                            )
                            IconButton(
                                onClick = {
                                    selectedProducts[product] = quantity + 1
                                }
                            ) {
                                Icon(Icons.Default.AddCircleOutline, contentDescription = "Add", tint = AbyssalPrimary)
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Payment Method Grid
        Column {
            Text("MÉTODO DE PAGO", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, modifier = Modifier.padding(bottom = 8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val isCashSelected = paymentMethod == "Efectivo"
                Button(
                    onClick = { paymentMethod = "Efectivo" },
                    modifier = Modifier
                        .weight(1f)
                        .height(64.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isCashSelected) AbyssalPrimary else AbyssalSurfaceHigh
                    ),
                    border = if (isCashSelected) null else BorderStroke(1.dp, AbyssalOutline)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Payments, contentDescription = null, tint = if (isCashSelected) Color.White else AbyssalTextPrimary)
                        Text("Efectivo", style = MaterialTheme.typography.labelSmall, color = if (isCashSelected) Color.White else AbyssalTextSecondaryVariant)
                    }
                }

                val isTransferSelected = paymentMethod == "Transferencia"
                Button(
                    onClick = { paymentMethod = "Transferencia" },
                    modifier = Modifier
                        .weight(1f)
                        .height(64.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isTransferSelected) AbyssalPrimary else AbyssalSurfaceHigh
                    ),
                    border = if (isTransferSelected) null else BorderStroke(1.dp, AbyssalOutline)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.CreditCard, contentDescription = null, tint = if (isTransferSelected) Color.White else AbyssalTextPrimary)
                        Text("Transferencia", style = MaterialTheme.typography.labelSmall, color = if (isTransferSelected) Color.White else AbyssalTextSecondaryVariant)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Checkout calculations
        val subtotal = selectedProducts.entries.sumOf { (prod, qty) -> prod.price * qty }
        val tax = subtotal * 0.1
        val total = subtotal + tax

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(AbyssalSurface)
                .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Subtotal", style = MaterialTheme.typography.bodyLarge, color = AbyssalTextSecondary)
                    Text("$${String.format(Locale.getDefault(), "%.2f", subtotal)}", style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Impuestos (10%)", style = MaterialTheme.typography.bodyLarge, color = AbyssalTextSecondary)
                    Text("$${String.format(Locale.getDefault(), "%.2f", tax)}", style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                }
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(AbyssalOutline.copy(alpha = 0.3f))
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Total", style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                    Text("$${String.format(Locale.getDefault(), "%.2f", total)}", style = MaterialTheme.typography.headlineMedium, color = AbyssalPrimaryLight)
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Large Submit Button
        Button(
            onClick = {
                val client = selectedClient ?: clients.firstOrNull()
                if (client != null && selectedProducts.isNotEmpty()) {
                    viewModel.createOrder(client, selectedProducts, paymentMethod)
                    isConfirmed = true
                }
            },
            enabled = selectedClient != null && selectedProducts.isNotEmpty(),
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AbyssalGreen)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Confirmar Pedido", style = MaterialTheme.typography.titleMedium, color = Color.White)
            }
        }

        Spacer(modifier = Modifier.height(48.dp))
    }
}

// ----------------------------------------------------
// 9. CLIENTES SCREEN
// ----------------------------------------------------
@Composable
fun ClientesScreen(
    viewModel: ErpViewModel
) {
    val clients by viewModel.clients.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val filteredClients = clients.filter {
        it.name.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Clientes",
                style = MaterialTheme.typography.displayLarge,
                color = AbyssalPrimaryLight
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(onClick = {}) {
                    Icon(Icons.Default.IosShare, contentDescription = "Share", tint = AbyssalPrimary)
                }
                Button(
                    onClick = { },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Nuevo", style = MaterialTheme.typography.bodyMedium, color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Buscar clientes...", color = AbyssalTextSecondary.copy(alpha = 0.5f)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp)),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = AbyssalSurfaceHigh,
                unfocusedContainerColor = AbyssalSurfaceHigh,
                focusedBorderColor = AbyssalPrimary,
                unfocusedBorderColor = AbyssalOutline
            ),
            shape = RoundedCornerShape(16.dp),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Grid metrics (Total Clients / Outstanding balance)
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("TOTAL CLIENTES", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("124", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary, modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null, tint = AbyssalGreen, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("+4 esta semana", style = MaterialTheme.typography.bodyMedium, color = AbyssalGreen)
                    }
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("SALDO TOTAL", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                    Text("€12k", style = MaterialTheme.typography.titleLarge, color = AbyssalPrimaryLight, modifier = Modifier.padding(top = 4.dp))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.PriorityHigh, contentDescription = null, tint = AbyssalRed, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("5 vencidos", style = MaterialTheme.typography.bodyMedium, color = AbyssalRed)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Clients List + Map Container at bottom
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredClients) { client ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(AbyssalPrimaryLight.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(client.initials, style = MaterialTheme.typography.titleMedium, color = AbyssalPrimaryLight)
                        }
                        Column {
                            Text(client.name, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                            Text(client.phone, style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        }
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("Saldo", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                        Text("€${client.outstandingBalance}", style = MaterialTheme.typography.titleMedium, color = AbyssalPrimaryLight)
                    }
                }
            }

            // Dark styled Map Section
            item {
                Spacer(modifier = Modifier.height(12.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(AbyssalSurfaceHigh)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(24.dp))
                        .drawBehind {
                            // Drawing abstract grid lines simulating a high-end GPS overlay dark map layout
                            drawRect(color = Color.Black.copy(alpha = 0.2f))
                            for (x in 0..size.width.toInt() step 60) {
                                drawLine(Color.White.copy(alpha = 0.05f), Offset(x.toFloat(), 0f), Offset(x.toFloat(), size.height))
                            }
                            for (y in 0..size.height.toInt() step 60) {
                                drawLine(Color.White.copy(alpha = 0.05f), Offset(0f, y.toFloat()), Offset(size.width, y.toFloat()))
                            }
                            // Glow lines representing delivery routes
                            drawPath(
                                path = Path().apply {
                                    moveTo(size.width * 0.1f, size.height * 0.9f)
                                    quadraticTo(size.width * 0.4f, size.height * 0.4f, size.width * 0.7f, size.height * 0.5f)
                                    lineTo(size.width * 0.9f, size.height * 0.2f)
                                },
                                color = AbyssalPrimary.copy(alpha = 0.4f),
                                style = Stroke(width = 4.dp.toPx())
                            )
                            drawCircle(
                                color = AbyssalPrimary,
                                radius = 6.dp.toPx(),
                                center = Offset(size.width * 0.7f, size.height * 0.5f)
                            )
                        }
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Operativa del Día", style = MaterialTheme.typography.titleMedium, color = Color.White)
                        Text("DISTRIBUCIÓN EN CURSO", style = MaterialTheme.typography.labelSmall, color = AbyssalPrimaryLight, modifier = Modifier.padding(top = 4.dp))
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(AbyssalSurface.copy(alpha = 0.9f))
                                .clickable { }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Navigation, contentDescription = null, tint = AbyssalPrimaryLight, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Ver en mapa", style = MaterialTheme.typography.bodyMedium, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 10. CIERRE DE CAJA SCREEN
// ----------------------------------------------------
@Composable
fun CierreDeCajaScreen(
    viewModel: ErpViewModel
) {
    val transactions by viewModel.transactions.collectAsState()
    var showPinModal by remember { mutableStateOf(false) }
    var pinValue by remember { mutableStateOf("") }
    var shiftClosed by remember { mutableStateOf(false) }

    val totalSales = transactions.filter { it.amount > 0 }.sumOf { it.amount }
    val totalExpenses = transactions.filter { it.amount < 0 }.sumOf { it.amount }
    val netTotal = totalSales + totalExpenses

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AbyssalBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(AbyssalSurfaceHigh),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.AccountCircle, contentDescription = null, tint = AbyssalPrimaryLight, modifier = Modifier.fillMaxSize())
                }
                Text(
                    text = "Cierre de Caja",
                    style = MaterialTheme.typography.displayLarge,
                    color = AbyssalPrimaryLight
                )
            }
            IconButton(onClick = {}) {
                Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = AbyssalTextPrimary)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Total day Header Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(AbyssalSurface)
                .border(1.dp, AbyssalOutline, RoundedCornerShape(24.dp))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("VENTAS TOTALES DEL DÍA", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary)
                Text(
                    text = "$${String.format(Locale.getDefault(), "%.2f", netTotal)}",
                    style = MaterialTheme.typography.displayLarge,
                    color = AbyssalTextPrimary,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(AbyssalGreenBg)
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.TrendingUp, contentDescription = null, tint = AbyssalGreen, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("+12.4% vs Ayer", style = MaterialTheme.typography.labelSmall, color = AbyssalGreen)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Grid Bento Stats (4 cells)
        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Payments, contentDescription = null, tint = AbyssalGreen)
                        Text("EFECTIVO", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("$2,120.00", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CreditCard, contentDescription = null, tint = AbyssalPrimaryLight)
                        Text("TARJETA", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("$2,732.50", style = MaterialTheme.typography.titleLarge, color = AbyssalTextPrimary)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalSurface)
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.ShoppingCartCheckout, contentDescription = null, tint = AbyssalRed)
                        Text("GASTOS", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("-$450.00", style = MaterialTheme.typography.titleLarge, color = AbyssalRed)
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(AbyssalPrimaryLight.copy(alpha = 0.05f))
                    .border(1.dp, AbyssalOutline, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Balance, contentDescription = null, tint = AbyssalYellow)
                        Text("DIFERENCIA", style = MaterialTheme.typography.labelSmall, color = AbyssalTextSecondary, fontSize = 9.sp)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("+$0.00", style = MaterialTheme.typography.titleLarge, color = AbyssalYellow)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Shift transaction logs
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Transacciones del Turno", style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
            Text("Ver todo", style = MaterialTheme.typography.bodyMedium, color = AbyssalPrimary)
        }

        Spacer(modifier = Modifier.height(12.dp))

        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            transactions.take(4).forEach { tx ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(AbyssalSurface)
                        .border(1.dp, AbyssalOutline, RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(AbyssalSurfaceHigh),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (tx.amount < 0) Icons.Default.LocalShipping else Icons.Default.Restaurant,
                                contentDescription = null,
                                tint = AbyssalTextSecondaryVariant
                            )
                        }
                        Column {
                            Text(tx.title, style = MaterialTheme.typography.titleMedium, color = AbyssalTextPrimary)
                            Text("${tx.time} • ${tx.type}", style = MaterialTheme.typography.bodyMedium, color = AbyssalTextSecondary)
                        }
                    }

                    Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = if (tx.amount >= 0) "+$${tx.amount}" else "-$${kotlin.math.abs(tx.amount)}",
                            style = MaterialTheme.typography.titleMedium,
                            color = if (tx.amount >= 0) AbyssalGreen else AbyssalRed
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (tx.status == "PAGADO") AbyssalGreenBg else AbyssalRedBg)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(tx.status, style = MaterialTheme.typography.labelSmall, color = if (tx.status == "PAGADO") AbyssalGreen else AbyssalRed, fontSize = 8.sp)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Main checkout action
        Button(
            onClick = {
                if (!shiftClosed) {
                    pinValue = ""
                    showPinModal = true
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (shiftClosed) AbyssalOutline else AbyssalPrimary
            )
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                Icon(
                    imageVector = if (shiftClosed) Icons.Default.CheckCircle else Icons.Default.LockReset,
                    contentDescription = null,
                    tint = Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (shiftClosed) "Caja Cerrada Exitosamente" else "Cerrar Caja y Exportar",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))
    }

    if (showPinModal) {
        AlertDialog(
            onDismissRequest = { showPinModal = false },
            title = {
                Text(
                    "Confirmar Cierre",
                    style = MaterialTheme.typography.titleLarge,
                    color = AbyssalTextPrimary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "Introduce el código de seguridad para finalizar el turno y generar el reporte PDF.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = AbyssalTextSecondary,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    OutlinedTextField(
                        value = pinValue,
                        onValueChange = { if (it.length <= 4) pinValue = it },
                        placeholder = { Text("PIN") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.width(120.dp),
                        textStyle = TextStyle(textAlign = TextAlign.Center, fontSize = 20.sp, letterSpacing = 4.sp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = AbyssalTextPrimary,
                            unfocusedTextColor = AbyssalTextPrimary
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (pinValue == "1234") {
                            shiftClosed = true
                        }
                        showPinModal = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AbyssalPrimary)
                ) {
                    Text("Confirmar y Exportar", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showPinModal = false }) {
                    Text("Cancelar", color = AbyssalTextSecondary)
                }
            },
            containerColor = AbyssalSurfaceHigh
        )
    }
}
