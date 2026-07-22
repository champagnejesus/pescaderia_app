export interface Product {
  id: number
  name: string
  category: string
  stock: number
  unit: string
  price_compra: number
  price_venta: number
  image_url: string
  description: string
  is_extra_quality: boolean
  low_stock_threshold: number
}

export interface Client {
  id: number
  name: string
  initials: string
  phone: string
  email: string
  address: string
  outstanding_balance: number
  credit_limit: number
}

export interface Supplier {
  id: number
  name: string
  category: string
  pending_payment: number
  status: string
  image_url: string
}

export interface DailySummary {
  total_sales: number
  total_expenses: number
  net_total: number
  cash_total: number
  card_total: number
  transaction_count: number
}

export interface Transaction {
  id: number
  title: string
  time: string
  type: string
  amount: number
  status: string
}

export interface Order {
  id: number
  order_number: string
  client_id: number
  client_name: string
  delivery_date: string
  items_count: number
  status: string
  total_value: number
  created_at: string
  payment_status: string
}

export interface OrderItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface OrderDetail extends Order {
  items: OrderItem[]
  payment_method: string
  delivered_at: string | null
}

export interface SelectedOrderItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
}

export interface Purchase {
  id: number
  purchase_number: string
  supplier_id: number
  supplier_name: string
  items_count: number
  total_value: number
  payment_status: string
  created_at: string
}

export interface PurchaseItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface PurchaseDetail extends Purchase {
  items: PurchaseItem[]
}

export interface SelectedPurchaseItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
}

export interface InventoryItem {
  product_id: number
  product_name: string
  category: string
  stock: number
  unit: string
  price_compra: number
  price_venta: number
  status: string
  low_stock_threshold: number
}

export interface InventoryMovement {
  id: number
  product_id: number
  product_name: string
  type: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  reference: string
  created_at: string
}

export interface AccountEntry {
  id: number
  reference_id: number
  reference_number: string
  reference_type: string
  amount: number
  pending_amount: number
  status: string
  date: string
}

export interface AccountDebtor {
  id: number
  name: string
  total_pending: number
  entries: AccountEntry[]
}
