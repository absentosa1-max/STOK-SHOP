export interface ProductVariant {
  id: string;
  sku: string;
  size: string; // e.g., "M", "L", "XL", "—"
  color: string; // e.g., "Hitam", "Putih", "Pale Gray"
  colorHex?: string; // e.g., "#191c1e"
  stock: number;
  price: number;
}

export interface Product {
  id: string; // 3-digit formatted string, e.g. "001"
  name: string;
  description: string;
  sku: string;
  category: string;
  size: string; // e.g. "—" or "M"
  color: string; // e.g. "—" or "Hitam"
  colorHex?: string;
  stock: number;
  price: number;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  lastUpdated?: string;
  minThreshold?: number; // default e.g. 10
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  delta: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  user: string;
  note?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
}

export type UserRole = 'primary_admin' | 'staff';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  password: string;
  isPrimaryAdmin: boolean;
  status: 'active' | 'inactive';
  department: string;
  createdAt: string;
}

export interface IncomingStockRecord {
  id: string;
  dateAdded: string; // YYYY-MM-DD format
  productId: string;
  productName: string;
  sku: string;
  category: string;
  size: string; // e.g., "M", "L", "XL", "42", "—"
  color: string; // e.g., "Hitam", "Putih", "Navy", "—"
  colorHex?: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  poNumber: string;
  note?: string;
  receivedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OutgoingStockRecord {
  id: string;
  dateOut: string; // YYYY-MM-DD format
  productId: string;
  productName: string;
  sku: string;
  category: string;
  size: string; // e.g., "M", "L", "XL", "42", "—"
  color: string; // e.g., "Hitam", "Putih", "Navy", "—"
  colorHex?: string;
  quantity: number;
  unitPrice: number;
  customerOrDestination: string; // Pelanggan / Tujuan Cabang / Devisi
  soNumber: string; // No. Surat Jalan / SO / Invoice Outbound
  shippingCarrier?: string; // JNE, J&T, Internal Delivery, dll.
  reason?: string; // Penjualan, Transfer, Sample, Retur Supplier
  note?: string;
  processedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type NavigationTab = 'dashboard' | 'inventory' | 'incoming_stock' | 'outgoing_stock' | 'reports' | 'users' | 'settings';
