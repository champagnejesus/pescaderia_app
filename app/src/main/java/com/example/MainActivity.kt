package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.ui.*
import com.example.ui.theme.*

class MainActivity : ComponentActivity() {
    private val viewModel: ErpViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isDarkMode by viewModel.isDarkMode.collectAsState()
            MyApplicationTheme(isDarkTheme = isDarkMode) {
                val navController = rememberNavController()
                val isLoggedIn by viewModel.isLoggedIn.collectAsState()

                // Automatic session gating
                LaunchedEffect(isLoggedIn) {
                    if (isLoggedIn) {
                        navController.navigate("dashboard") {
                            popUpTo("login") { inclusive = true }
                        }
                    } else {
                        navController.navigate("login") {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                }

                val currentBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = currentBackStackEntry?.destination?.route ?: "login"

                val showBottomBar = currentRoute in listOf(
                    "dashboard", "pedidos", "productos", "proveedores", "clientes", "cierre_caja"
                )

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = AbyssalBackground,
                    bottomBar = {
                        if (showBottomBar) {
                            NavigationBar(
                                modifier = Modifier
                                    .navigationBarsPadding()
                                    .fillMaxWidth()
                                    .height(72.dp)
                                    .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
                                    .border(1.dp, AbyssalOutline, RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)),
                                containerColor = AbyssalSurface.copy(alpha = 0.95f),
                                tonalElevation = 0.dp
                            ) {
                                val tabs = listOf(
                                    Triple("Inicio", "dashboard", Icons.Default.Dashboard),
                                    Triple("Pedidos", "pedidos", Icons.Default.ShoppingCart),
                                    Triple("Stock", "productos", Icons.Default.Inventory2),
                                    Triple("Prov", "proveedores", Icons.Default.LocalShipping),
                                    Triple("Clientes", "clientes", Icons.Default.Group),
                                    Triple("Caja", "cierre_caja", Icons.Default.Payments)
                                )

                                tabs.forEach { (label, route, icon) ->
                                    val isSelected = currentRoute == route
                                    NavigationBarItem(
                                        selected = isSelected,
                                        onClick = {
                                            if (currentRoute != route) {
                                                navController.navigate(route) {
                                                    popUpTo("dashboard") { saveState = true }
                                                    launchSingleTop = true
                                                    restoreState = true
                                                }
                                            }
                                        },
                                        icon = {
                                            Icon(
                                                imageVector = icon,
                                                contentDescription = label,
                                                tint = if (isSelected) AbyssalPrimaryLight else AbyssalTextSecondary,
                                                modifier = Modifier.size(24.dp)
                                            )
                                        },
                                        label = {
                                            Text(
                                                text = label,
                                                style = MaterialTheme.typography.labelSmall,
                                                color = if (isSelected) AbyssalPrimaryLight else AbyssalTextSecondary,
                                                fontSize = 9.sp
                                            )
                                        },
                                        colors = NavigationBarItemDefaults.colors(
                                            indicatorColor = AbyssalPrimary.copy(alpha = 0.2f)
                                        )
                                    )
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "login",
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(
                                bottom = if (showBottomBar) innerPadding.calculateBottomPadding() else 0.dp,
                                top = innerPadding.calculateTopPadding()
                            )
                    ) {
                        composable("login") {
                            LoginScreen(
                                viewModel = viewModel,
                                onLoginSuccess = {
                                    navController.navigate("dashboard") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                }
                            )
                        }

                        composable("dashboard") {
                            DashboardScreen(
                                viewModel = viewModel,
                                onNavigateToNewOrder = { navController.navigate("nuevo_pedido") },
                                onNavigateToOrders = { navController.navigate("pedidos") }
                            )
                        }

                        composable("pedidos") {
                            PedidosScreen(viewModel = viewModel)
                        }

                        composable("productos") {
                            ProductosScreen(
                                viewModel = viewModel,
                                onNavigateToDetail = { id -> navController.navigate("product_detail/$id") }
                            )
                        }

                        composable(
                            route = "product_detail/{id}",
                            arguments = listOf(navArgument("id") { type = NavType.IntType })
                        ) { backStackEntry ->
                            val id = backStackEntry.arguments?.getInt("id") ?: 0
                            ProductDetailScreen(
                                productId = id,
                                viewModel = viewModel,
                                onNavigateBack = { navController.navigateUp() }
                            )
                        }

                        composable("proveedores") {
                            ProveedoresScreen(viewModel = viewModel)
                        }

                        composable("clientes") {
                            ClientesScreen(viewModel = viewModel)
                        }

                        composable("cierre_caja") {
                            CierreDeCajaScreen(viewModel = viewModel)
                        }

                        composable("nuevo_pedido") {
                            NuevoPedidoScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.navigateUp() }
                            )
                        }
                    }
                }
            }
        }
    }
}
