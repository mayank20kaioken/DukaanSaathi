import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Shop, 
  Product, 
  Customer, 
  Sale, 
  Expense, 
  Supplier, 
  Language, 
  BusinessHealthBreakdown,
  DailyActionItem
} from '../types';
import { 
  DEMO_SHOPS, 
  DEMO_PRODUCTS, 
  DEMO_CUSTOMERS, 
  DEMO_SALES, 
  DEMO_EXPENSES, 
  DEMO_SUPPLIERS 
} from '../data/mockData';
import { VoiceAssistantEngine } from '../services/voiceAssistantEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeShop: Shop;
  shops: Shop[];
  setActiveShopId: (id: string) => void;
  workspaceMode: 'dark' | 'light';
  setWorkspaceMode: (mode: 'dark' | 'light') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Data State
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  suppliers: Supplier[];

  // Data Actions
  addProduct: (product: Omit<Product, 'id' | 'stockMovements'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  adjustStock: (productId: string, quantityDelta: number, reason: string) => void;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'ledger' | 'lastTransactionDate' | 'overdueDays'>) => void;
  addKhataCredit: (customerId: string, amount: number, description: string, billRef?: string) => void;
  recordKhataPayment: (customerId: string, amount: number, method: 'CASH' | 'UPI' | 'BANK_TRANSFER', notes?: string) => void;
  
  recordSale: (sale: Omit<Sale, 'id' | 'invoiceNo' | 'date'>) => void;
  recordExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  
  // Reactive Analytics
  metrics: {
    todaySales: number;
    todayCogs: number;
    todayGrossProfit: number;
    todayExpenses: number;
    todayNetProfit: number;
    totalOutstandingUdhaar: number;
    totalInventoryValue: number;
    lowStockCount: number;
    expiringSoonCount: number;
  };
  healthScore: BusinessHealthBreakdown;
  dailyActions: DailyActionItem[];

  // Helper calculation
  getCustomerBalance: (customer: Customer) => number;

  // AI & Voice Assistant Instance
  voiceEngine: VoiceAssistantEngine;

  // Modals & Toasts
  activeModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Reset
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dukaansaathi_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [workspaceMode, setWorkspaceMode] = useState<'dark' | 'light'>('dark');
  const [shops] = useState<Shop[]>(DEMO_SHOPS);
  const [activeShopId, setActiveShopId] = useState<string>(DEMO_SHOPS[0].id);

  // Load initial state from LocalStorage or fall back to demo data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : DEMO_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : DEMO_CUSTOMERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sales`);
    return saved ? JSON.parse(saved) : DEMO_SALES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : DEMO_EXPENSES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : DEMO_SUPPLIERS;
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist state updates locally
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  // Voice engine instance
  const voiceEngine = useMemo(() => {
    return new VoiceAssistantEngine(products, customers, suppliers, sales, expenses);
  }, [products, customers, suppliers, sales, expenses]);

  const activeShop = useMemo(() => {
    return shops.find(s => s.id === activeShopId) || shops[0];
  }, [shops, activeShopId]);

  // Calculate customer balance strictly from ledger entries
  const getCustomerBalance = (customer: Customer): number => {
    return customer.ledger.reduce((acc, entry) => {
      if (entry.type === 'CREDIT_GIVEN') return acc + entry.amount;
      if (entry.type === 'PAYMENT_RECEIVED' || entry.type === 'DISCOUNT') return acc - entry.amount;
      return acc;
    }, 0);
  };

  // Toast Helpers
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // Data Actions
  const addProduct = (newProd: Omit<Product, 'id' | 'stockMovements'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      stockMovements: [
        {
          id: `sm-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'IN',
          quantity: newProd.stock,
          reason: 'Initial Inventory Entry'
        }
      ]
    };
    setProducts(prev => [product, ...prev]);
    addToast('success', 'Product Added', `${product.name} is now available in your catalogue.`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addToast('info', 'Product Updated', 'Catalogue records saved.');
  };

  const adjustStock = (productId: string, quantityDelta: number, reason: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const newStock = Math.max(0, p.stock + quantityDelta);
      const movement = {
        id: `sm-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: (quantityDelta >= 0 ? 'IN' : 'OUT') as 'IN' | 'OUT',
        quantity: Math.abs(quantityDelta),
        reason
      };
      return {
        ...p,
        stock: newStock,
        stockMovements: [movement, ...p.stockMovements]
      };
    }));
    addToast('success', 'Stock Adjusted', `Stock quantity updated with reason: "${reason}".`);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'ledger' | 'lastTransactionDate' | 'overdueDays'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      lastTransactionDate: new Date().toISOString().split('T')[0],
      overdueDays: 0,
      ledger: []
    };
    setCustomers(prev => [newCust, ...prev]);
    addToast('success', 'Customer Added', `${newCust.name} added to Digital Khata.`);
  };

  const addKhataCredit = (customerId: string, amount: number, description: string, billRef?: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const currentBalance = getCustomerBalance(c);
      const newBalance = currentBalance + amount;
      const newEntry = {
        id: `led-${Date.now()}`,
        customerId,
        date: new Date().toISOString().split('T')[0],
        type: 'CREDIT_GIVEN' as const,
        amount,
        balanceAfter: newBalance,
        description,
        billRef
      };
      return {
        ...c,
        lastTransactionDate: new Date().toISOString().split('T')[0],
        ledger: [...c.ledger, newEntry]
      };
    }));
    addToast('warning', 'Udhaar Recorded', `Added ₹${amount} credit to customer ledger.`);
  };

  const recordKhataPayment = (customerId: string, amount: number, method: 'CASH' | 'UPI' | 'BANK_TRANSFER', notes?: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const currentBalance = getCustomerBalance(c);
      const newBalance = Math.max(0, currentBalance - amount);
      const newEntry = {
        id: `led-${Date.now()}`,
        customerId,
        date: new Date().toISOString().split('T')[0],
        type: 'PAYMENT_RECEIVED' as const,
        amount,
        balanceAfter: newBalance,
        description: notes || `Payment received via ${method}`,
        paymentMethod: method
      };
      return {
        ...c,
        lastTransactionDate: new Date().toISOString().split('T')[0],
        overdueDays: newBalance === 0 ? 0 : c.overdueDays,
        ledger: [...c.ledger, newEntry]
      };
    }));
    addToast('success', 'Payment Received', `Recorded payment of ₹${amount} in customer Khata.`);
  };

  const recordSale = (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date'>) => {
    const invoiceNo = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString()
    };

    // 1. Save sale
    setSales(prev => [newSale, ...prev]);

    // 2. Reduce product inventory
    newSale.items.forEach(item => {
      adjustStock(item.productId, -item.quantity, `Sold on Invoice #${invoiceNo}`);
    });

    // 3. If Udhaar, record Khata ledger entry
    if (newSale.paymentMode === 'UDHAAR' && newSale.customerId) {
      addKhataCredit(
        newSale.customerId, 
        newSale.total, 
        `Sale on Invoice ${invoiceNo}: ${newSale.items.map(i => i.productName.split(' ')[0]).join(', ')}`,
        invoiceNo
      );
    }

    addToast('success', 'Sale Recorded', `Invoice #${invoiceNo} for ₹${newSale.total} completed.`);
  };

  const recordExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [newExpense, ...prev]);
    addToast('info', 'Expense Saved', `Recorded expense of ₹${newExpense.amount} under ${newExpense.categoryLabel}.`);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_products`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_customers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_sales`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_expenses`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_suppliers`);
    setProducts(DEMO_PRODUCTS);
    setCustomers(DEMO_CUSTOMERS);
    setSales(DEMO_SALES);
    setExpenses(DEMO_EXPENSES);
    setSuppliers(DEMO_SUPPLIERS);
    addToast('info', 'Reset Complete', 'Demo data successfully restored to factory defaults.');
  };

  // Comprehensive, internally consistent Reactive Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Today's sales
    const todaySalesList = sales.filter(s => s.date.startsWith(todayStr) || s.date.startsWith('2026-10-15'));
    const todaySales = todaySalesList.reduce((sum, s) => sum + s.total, 0);
    const todayCogs = todaySalesList.reduce((sum, s) => sum + s.cogs, 0);
    const todayGrossProfit = todaySales - todayCogs;

    // Today's operating expenses (excluding supplier stock purchases to avoid double counting with COGS)
    const todayExpenses = expenses
      .filter(e => e.date === todayStr || e.date === '2026-10-15')
      .reduce((sum, e) => sum + e.amount, 0);

    const todayNetProfit = todayGrossProfit - todayExpenses;

    // Total outstanding customer udhaar (computed from ledger)
    const totalOutstandingUdhaar = customers.reduce((sum, c) => sum + getCustomerBalance(c), 0);

    // Current inventory valuation
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

    // Low stock count
    const lowStockCount = products.filter(p => p.stock <= p.minStockThreshold).length;

    // Expiring soon (within 30 days)
    const expiringSoonCount = products.filter(p => {
      if (!p.expiryDate) return false;
      const diff = Math.ceil((new Date(p.expiryDate).getTime() - new Date('2026-10-15').getTime()) / (1000 * 3600 * 24));
      return diff <= 30;
    }).length;

    return {
      todaySales,
      todayCogs,
      todayGrossProfit,
      todayExpenses,
      todayNetProfit,
      totalOutstandingUdhaar,
      totalInventoryValue,
      lowStockCount,
      expiringSoonCount
    };
  }, [sales, expenses, customers, products]);

  // Business Health Score Calculation (Transparent algorithm)
  const healthScore = useMemo<BusinessHealthBreakdown>(() => {
    // 1. Profitability Pillar (25 pts): Gross margin % >= 15% gets full points
    const avgMarginPercent = products.length > 0
      ? products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) / p.sellingPrice * 100), 0) / products.length
      : 18;
    const profitScore = Math.min(25, Math.max(10, Math.round((avgMarginPercent / 20) * 25)));

    // 2. Inventory Health (25 pts): Deduct for out of stock / low stock items
    const lowStockRatio = products.length > 0 ? (metrics.lowStockCount / products.length) : 0;
    const invScore = Math.min(25, Math.max(5, Math.round((1 - lowStockRatio) * 25)));

    // 3. Credit Risk (25 pts): High overdue udhaar deducts points
    const highOverdueCount = customers.filter(c => c.overdueDays > 30 && getCustomerBalance(c) > 0).length;
    const creditScore = Math.max(8, 25 - (highOverdueCount * 6));

    // 4. Cash Flow Stability (25 pts): Today's gross profit vs expenses
    const cashScore = metrics.todayGrossProfit >= metrics.todayExpenses ? 22 : 14;

    const total = profitScore + invScore + creditScore + cashScore;

    return {
      score: total,
      rating: total >= 85 ? 'Exceptional' : total >= 70 ? 'Healthy' : total >= 50 ? 'Moderate' : 'Needs Attention',
      pillars: {
        profitability: {
          score: profitScore,
          max: 25,
          label: 'Profit Margins',
          desc: `Average product margin is ${avgMarginPercent.toFixed(1)}%. Consistent healthy retail markup.`
        },
        inventoryHealth: {
          score: invScore,
          max: 25,
          label: 'Stock Availability',
          desc: `${metrics.lowStockCount} items below safety thresholds need restocking.`
        },
        creditUdhaarRisk: {
          score: creditScore,
          max: 25,
          label: 'Udhaar Recovery',
          desc: `${highOverdueCount} customer(s) have credit overdue for more than 30 days.`
        },
        cashFlowStability: {
          score: cashScore,
          max: 25,
          label: 'Daily Cash Flow',
          desc: `Gross margin of ₹${metrics.todayGrossProfit} covers daily operating expenses.`
        }
      }
    };
  }, [products, metrics, customers]);

  // Dynamic Daily Action Plan
  const dailyActions = useMemo<DailyActionItem[]>(() => {
    const list: DailyActionItem[] = [];

    // Check critical low stock
    const criticalProducts = products.filter(p => p.stock <= 5);
    if (criticalProducts.length > 0) {
      list.push({
        id: 'act-1',
        priority: 'CRITICAL',
        title: `Reorder Critical Stock: ${criticalProducts.map(p => p.name.split(' ')[0]).join(', ')}`,
        titleHi: `महत्वपूर्ण सामान का तुरंत ऑर्डर दें: ${criticalProducts.map(p => p.nameHi ? p.nameHi.split(' ')[0] : p.name.split(' ')[0]).join(', ')}`,
        description: `${criticalProducts.length} high-demand product(s) have under 5 units left. Out-of-stock risk is high today.`,
        descriptionHi: `${criticalProducts.length} ज़रूरी सामान 5 यूनिट से कम हैं। आज स्टॉक खत्म होने का बड़ा जोखिम है।`,
        category: 'STOCK',
        actionLabel: 'Open Reorder List',
        actionRoute: 'inventory',
        impact: 'Avoid lost daily sales of ~₹1,200+'
      });
    }

    // Check overdue udhaar
    const riskyCustomers = customers.filter(c => c.overdueDays > 20 && getCustomerBalance(c) > 1000);
    if (riskyCustomers.length > 0) {
      list.push({
        id: 'act-2',
        priority: 'HIGH',
        title: `Send WhatsApp Payment Reminders to ${riskyCustomers.length} Overdue Accounts`,
        titleHi: `${riskyCustomers.length} बकाया खाताधारकों को व्हाट्सएप तकादा भेजें`,
        description: `${riskyCustomers[0].name} has ₹${getCustomerBalance(riskyCustomers[0])} outstanding for ${riskyCustomers[0].overdueDays} days.`,
        descriptionHi: `${riskyCustomers[0].name} का ₹${getCustomerBalance(riskyCustomers[0])} बकाया ${riskyCustomers[0].overdueDays} दिनों से पेंडिंग है।`,
        category: 'UDHAAR',
        actionLabel: 'Draft Polite WhatsApp',
        actionRoute: 'khata',
        impact: `Recover up to ₹${riskyCustomers.reduce((s, c) => s + getCustomerBalance(c), 0)} working capital`
      });
    }

    // Check expiry
    const expiring = products.filter(p => {
      if (!p.expiryDate) return false;
      const diff = Math.ceil((new Date(p.expiryDate).getTime() - new Date('2026-10-15').getTime()) / (1000 * 3600 * 24));
      return diff <= 15;
    });
    if (expiring.length > 0) {
      list.push({
        id: 'act-3',
        priority: 'MEDIUM',
        title: `Clear Stock Expiring in < 15 Days: ${expiring[0].name.split(' ')[0]}`,
        titleHi: `15 दिनों में एक्सपायर होने वाला सामान बेचें: ${expiring[0].name.split(' ')[0]}`,
        description: `${expiring[0].name} expires on ${expiring[0].expiryDate}. Offer 10% counter discount or return to supplier.`,
        descriptionHi: `${expiring[0].name} की एक्सपायरी ${expiring[0].expiryDate} को है। तुरंत काउंटर डिस्काउंट लगाएं।`,
        category: 'EXPIRY',
        actionLabel: 'View Expiry List',
        actionRoute: 'inventory',
        impact: `Save ₹${expiring[0].stock * expiring[0].costPrice} tied-up inventory`
      });
    }

    // TinyFish Market Scout suggestion
    list.push({
      id: 'act-4',
      priority: 'MEDIUM',
      title: 'Scout B2B Wholesale Oil Prices via TinyFish',
      titleHi: 'TinyFish से तेल के थोक बाजार भाव चेक करें',
      description: 'Recent market listings show edible oils selling 5.6% cheaper on B2B wholesale platforms.',
      descriptionHi: 'हालिया थोक लिस्टिंग में खाने का तेल 5.6% सस्ते दर पर उपलब्ध है।',
      category: 'SUPPLIER',
      actionLabel: 'Launch Market Scout',
      actionRoute: 'market-scout',
      impact: 'Save up to ₹850 on next wholesale replenishment'
    });

    return list;
  }, [products, customers]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeShop,
        shops,
        setActiveShopId,
        workspaceMode,
        setWorkspaceMode,
        theme: workspaceMode,
        toggleTheme: () => setWorkspaceMode(workspaceMode === 'dark' ? 'light' : 'dark'),
        products,
        customers,
        sales,
        expenses,
        suppliers,
        addProduct,
        updateProduct,
        adjustStock,
        addCustomer,
        addKhataCredit,
        recordKhataPayment,
        recordSale,
        recordExpense,
        metrics,
        healthScore,
        dailyActions,
        getCustomerBalance,
        voiceEngine,
        activeModal,
        openModal,
        closeModal,
        toasts,
        addToast,
        removeToast,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
