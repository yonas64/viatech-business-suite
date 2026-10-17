export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
};

export type Category = {
  _id: string;
  name: string;
  description?: string;
  specificationFields?: CategorySpecificationField[];
};

export type CategorySpecificationField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'dimensions';
  required?: boolean;
  unit?: string;
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
