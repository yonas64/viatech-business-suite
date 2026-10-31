export type User = {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt?: string;
};

export type SpecificationField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'dimensions';
  required?: boolean;
  unit?: string;
};

export type Category = {
  _id: string;
  name: string;
  description?: string;
  specificationFields?: SpecificationField[];
};

export type Variant = {
  _id: string;
  sku: string;
  specification?: string;
  specifications?: Record<string, unknown>;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit?: string;
  lowStockThreshold?: number;
  vatRate?: number;
};

export type Product = {
  _id: string;
  name: string;
  description?: string;
  category: Category | string;
  variants: Variant[];
  active: boolean;
};

export type Sale = {
  _id: string;
  saleReference: string;
  saleDate: string;
  items: {
    productName: string;
    variantName: string;
    sku?: string;
    quantity: number;
    total: number;
  }[];
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  cashier?: { name?: string };
};

export type Expense = {
  _id: string;
  category: string;
  amount: number;
  description: string;
  expenseDate: string;
  reference?: string;
  receiptUrl?: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  amount?: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StockItem = {
  productId: string;
  productName: string;
  category: Category | string;
  variantId: string;
  sku: string;
  specification?: string;
  specifications?: Record<string, unknown>;
  quantity: number;
  unit?: string;
  lowStockThreshold: number;
  isLowStock: boolean;
};

export type Movement = {
  _id: string;
  product?: Product | string;
  variantId: string;
  movementType: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  reason: string;
  createdAt: string;
  createdBy?: { name?: string };
};

export type FinanceSummary = {
  currentInventoryCost: number;
  expectedProfit: number;
  totalSales: number;
  salesSubtotal: number;
  totalVat: number;
  totalCollected: number;
  totalDue: number;
  costOfGoodsSold: number;
  expenses: number;
  expenseCount: number;
  grossProfit: number;
  estimatedProfit: number;
  transactionCount: number;
  productsTracked: number;
};

export type Report = {
  period: { from: string; to: string };
  salesCount: number;
  productsSold: number;
  salesSubtotal: number;
  vat: number;
  total: number;
  totalCollected: number;
  totalDue: number;
  costOfGoodsSold: number;
  expenses: number;
  grossProfit: number;
  estimatedProfit: number;
  currentStock: number;
  bestSellingProducts: { productId: string; productName: string; quantity: number }[];
  lowStockProducts: { productId: string; productName: string; sku: string; quantity: number; lowStockThreshold: number }[];
  recentSales: { id: string; saleReference: string; saleDate: string; total: number; paymentStatus: string }[];
  recentStockMovements: Movement[];
};
