// Domain Types for DukaanSaathi

export type Language = 'en' | 'hi';

export interface Shop {
  id: string;
  name: string;
  nameHi: string;
  ownerName: string;
  phone: string;
  gstin: string;
  address: string;
  city: string;
  pincode: string;
  category: string;
  establishedYear: number;
}

export type UnitType = 'packet' | 'kg' | 'litre' | 'piece' | 'box' | 'bottle';

export interface StockMovement {
  id: string;
  date: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  reason: string;
  referenceId?: string;
}

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  sku: string;
  category: 'Groceries' | 'Snacks & Beverages' | 'Dairy & Bakery' | 'Personal Care' | 'Home Care' | 'Spices & Staples';
  costPrice: number; // Buying price in ₹
  sellingPrice: number; // MRP/Selling price in ₹
  stock: number;
  unit: UnitType;
  minStockThreshold: number;
  supplierId: string;
  supplierName: string;
  expiryDate?: string;
  lastSaleDate?: string;
  shelfLocation?: string;
  stockMovements: StockMovement[];
  demandLevel?: 'High' | 'Medium' | 'Low' | 'Slow-Moving';
}

export type LedgerEntryType = 'CREDIT_GIVEN' | 'PAYMENT_RECEIVED' | 'ADJUSTMENT' | 'DISCOUNT';

export interface KhataLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  description: string;
  billRef?: string;
  paymentMethod?: 'CASH' | 'UPI' | 'BANK_TRANSFER';
}

export interface Customer {
  id: string;
  name: string;
  nameHi?: string;
  phone: string;
  address?: string;
  creditLimit: number;
  trustScore: 'Excellent' | 'Good' | 'Average' | 'Risky';
  lastTransactionDate: string;
  overdueDays: number;
  ledger: KhataLedgerEntry[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  productNameHi?: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: 'CASH' | 'UPI' | 'UDHAAR' | 'CARD';
  cogs: number; // Cost of goods sold
  grossProfit: number;
}

export type ExpenseCategory = 
  | 'RENT'
  | 'ELECTRICITY'
  | 'SALARIES'
  | 'SUPPLIER_PURCHASE'
  | 'TRANSPORT'
  | 'PACKAGING'
  | 'MAINTENANCE'
  | 'TAXES_FEES'
  | 'OTHER';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  categoryLabel: string;
  categoryLabelHi: string;
  amount: number;
  supplierId?: string;
  supplierName?: string;
  paymentMethod: 'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD';
  invoiceNo?: string;
  attachmentUrl?: string;
  notes: string;
  verifiedFromBill?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  categories: string[];
  address: string;
  paymentTerms: string;
  rating: number;
  pendingPayment: number;
}

export interface TinyFishListing {
  id: string;
  supplierName: string;
  platform: string;
  productMatch: string;
  packSize: string;
  packSizeMatch: boolean;
  listedPrice: number;
  minOrderQty: number;
  deliveryDays: number;
  sourceUrl: string;
  retrievedAt: string;
  notes: string;
  isLive?: boolean;
  dataSource?: 'TINYFISH_LIVE' | 'DEMO_FIXTURE';
  confidenceScore?: number;
  matchWarning?: string;
  reviewed?: boolean;
}

export interface MarketScoutTask {
  id: string;
  productQuery: string;
  category: string;
  targetMarket: string;
  status: 'IDLE' | 'RESEARCHING' | 'COMPLETED' | 'FAILED' | 'CREDENTIALS_REQUIRED';
  startedAt?: string;
  completedAt?: string;
  ourCostPrice: number;
  bestExternalPrice?: number;
  potentialSavingPercent?: number;
  results: TinyFishListing[];
  isLive?: boolean;
  dataSource?: 'TINYFISH_LIVE' | 'DEMO_FIXTURE';
  apiMessage?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ReviewedComparison {
  id: string;
  taskId: string;
  productId?: string;
  productName: string;
  savedCostPrice: number;
  bestExternalPrice: number;
  supplierName: string;
  sourceUrl: string;
  packSize: string;
  potentialSavings: number;
  reviewedAt: string;
  notes?: string;
}

export interface ScannedBillItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  rate: number;
  taxRate: number;
  amount: number;
  printedAmount?: number;
  matchedProductId?: string;
  hasLineDiscrepancy?: boolean;
}

export interface ScannedBill {
  id: string;
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
  supplierName: string;
  invoiceNo: string;
  date: string;
  items: ScannedBillItem[];
  calculatedSubtotal: number;
  taxAmount: number;
  discount: number;
  calculatedTotal: number;
  printedTotal: number;
  receivedAmount?: number;
  dueBalance?: number;
  difference: number;
  confidence?: number;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  warnings: string[];
  extractionStatus?: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'MANUAL';
  isSampleDemo?: boolean;
  rawText?: string;
}

export interface BusinessHealthBreakdown {
  score: number; // 0-100
  rating: 'Exceptional' | 'Healthy' | 'Moderate' | 'Needs Attention';
  pillars: {
    profitability: { score: number; max: number; label: string; desc: string };
    inventoryHealth: { score: number; max: number; label: string; desc: string };
    creditUdhaarRisk: { score: number; max: number; label: string; desc: string };
    cashFlowStability: { score: number; max: number; label: string; desc: string };
  };
}

export interface DailyActionItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: 'STOCK' | 'UDHAAR' | 'EXPIRY' | 'SUPPLIER';
  actionLabel: string;
  actionRoute: string;
  impact: string;
}

export interface FestivalCampaign {
  id: string;
  name: string;
  nameHi: string;
  dates: string;
  daysRemaining: number;
  projectedSalesGrowth: number;
  recommendedPrepStock: Array<{
    productName: string;
    normalStock: number;
    recommendedStock: number;
    estimatedRevenue: number;
  }>;
  checklist: string[];
}
