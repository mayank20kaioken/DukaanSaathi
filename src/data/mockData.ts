import { 
  Shop, 
  Product, 
  Customer, 
  Sale, 
  Expense, 
  Supplier, 
  MarketScoutTask,
  FestivalCampaign 
} from '../types';

export const DEMO_SHOPS: Shop[] = [
  {
    id: 'shop-01',
    name: 'Gupta General Store & Kirana',
    nameHi: 'गुप्ता जनरल स्टोर एवं किराना',
    ownerName: 'Radhe Shyam Gupta',
    phone: '+91 98112 90123',
    gstin: '07AAAAA0000A1Z5',
    address: 'Shop No. 14, Main Bazaar, Chandni Chowk',
    city: 'Old Delhi',
    pincode: '110006',
    category: 'Kirana & FMCG Retail',
    establishedYear: 1998,
  },
  {
    id: 'shop-02',
    name: 'Gupta Supermart — Sector 14 Branch',
    nameHi: 'गुप्ता सुपरमार्ट — सेक्टर 14 शाखा',
    ownerName: 'Amit Gupta',
    phone: '+91 98765 11223',
    gstin: '06AAAAA1111B2Z8',
    address: 'SCF 42, Huda Market, Sector 14',
    city: 'Gurugram',
    pincode: '122001',
    category: 'Modern Retail Mini-Mart',
    establishedYear: 2021,
  }
];

export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    name: 'Sharma Traders (Wholesale Groceries)',
    contactPerson: 'Rajesh Sharma',
    phone: '+91 98112 34567',
    categories: ['Spices & Staples', 'Groceries'],
    address: 'Gali Batashan, Khari Baoli, Delhi 110006',
    paymentTerms: 'Net 15 Days',
    rating: 4.8,
    pendingPayment: 18450,
  },
  {
    id: 'sup-02',
    name: 'Agarwal FMCG Distributors',
    contactPerson: 'Suresh Agarwal',
    phone: '+91 98234 56789',
    categories: ['Snacks & Beverages', 'Personal Care', 'Home Care'],
    address: 'Godown 12, Naya Bans, Delhi 110006',
    paymentTerms: 'Immediate / UPI',
    rating: 4.6,
    pendingPayment: 6200,
  },
  {
    id: 'sup-03',
    name: 'Amul & Mother Dairy Agency',
    contactPerson: 'Anil Verma',
    phone: '+91 98765 43210',
    categories: ['Dairy & Bakery'],
    address: 'Kashmere Gate Depot, Delhi 110006',
    paymentTerms: 'Daily Cash / UPI',
    rating: 4.9,
    pendingPayment: 2100,
  },
  {
    id: 'sup-04',
    name: 'Patanjali & Organic Depot',
    contactPerson: 'Ramesh Shastri',
    phone: '+91 98980 12345',
    categories: ['Groceries', 'Personal Care'],
    address: 'Daryaganj Wholesale Complex, Delhi 110002',
    paymentTerms: 'Net 7 Days',
    rating: 4.5,
    pendingPayment: 0,
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Maggi 2-Minute Masala Noodles 70g',
    nameHi: 'मैगी 2-मिनट नूडल्स 70 ग्राम',
    sku: 'MAG-MAS-70',
    category: 'Snacks & Beverages',
    costPrice: 11.20,
    sellingPrice: 14.00,
    stock: 142,
    unit: 'packet',
    minStockThreshold: 40,
    supplierId: 'sup-02',
    supplierName: 'Agarwal FMCG Distributors',
    expiryDate: '2026-12-15',
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Aisle 1 - Shelf B',
    demandLevel: 'High',
    stockMovements: [
      { id: 'sm-1', date: '2026-10-10', type: 'IN', quantity: 150, reason: 'Weekly replenishment' },
      { id: 'sm-2', date: '2026-10-15', type: 'OUT', quantity: 8, reason: 'Counter sales' }
    ]
  },
  {
    id: 'prod-02',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    nameHi: 'फॉर्च्यून सनलाइट रिफाइंड तेल 1 लीटर',
    sku: 'FOR-OIL-1L',
    category: 'Groceries',
    costPrice: 132.00,
    sellingPrice: 155.00,
    stock: 18,
    unit: 'packet',
    minStockThreshold: 25,
    supplierId: 'sup-01',
    supplierName: 'Sharma Traders (Wholesale Groceries)',
    expiryDate: '2027-04-10',
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Aisle 2 - Shelf A',
    demandLevel: 'High',
    stockMovements: [
      { id: 'sm-3', date: '2026-10-08', type: 'IN', quantity: 40, reason: 'Stock inward' },
      { id: 'sm-4', date: '2026-10-15', type: 'OUT', quantity: 22, reason: 'Sales' }
    ]
  },
  {
    id: 'prod-03',
    name: 'Aashirvaad Shudh Chakki Atta 10kg',
    nameHi: 'आशीर्वाद शुद्ध चक्की आटा 10 किलो',
    sku: 'AAS-ATT-10K',
    category: 'Spices & Staples',
    costPrice: 382.00,
    sellingPrice: 435.00,
    stock: 7,
    unit: 'packet',
    minStockThreshold: 15, // LOW STOCK
    supplierId: 'sup-01',
    supplierName: 'Sharma Traders (Wholesale Groceries)',
    expiryDate: '2027-01-20',
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Floor Pallet 3',
    demandLevel: 'High',
    stockMovements: [
      { id: 'sm-5', date: '2026-10-05', type: 'IN', quantity: 30, reason: 'Monthly bulk purchase' },
      { id: 'sm-6', date: '2026-10-15', type: 'OUT', quantity: 23, reason: 'Customer purchase' }
    ]
  },
  {
    id: 'prod-04',
    name: 'Tata Salt Vaccum Evaporated 1kg',
    nameHi: 'टाटा नमक 1 किलो',
    sku: 'TAT-SLT-1K',
    category: 'Spices & Staples',
    costPrice: 22.50,
    sellingPrice: 28.00,
    stock: 85,
    unit: 'packet',
    minStockThreshold: 30,
    supplierId: 'sup-01',
    supplierName: 'Sharma Traders (Wholesale Groceries)',
    expiryDate: '2027-08-30',
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Aisle 2 - Shelf D',
    demandLevel: 'High',
    stockMovements: []
  },
  {
    id: 'prod-05',
    name: 'Amul Butter Pasteurised 500g',
    nameHi: 'अमूल मक्खन 500 ग्राम',
    sku: 'AMU-BUT-500',
    category: 'Dairy & Bakery',
    costPrice: 252.00,
    sellingPrice: 285.00,
    stock: 12,
    unit: 'packet',
    minStockThreshold: 10,
    supplierId: 'sup-03',
    supplierName: 'Amul & Mother Dairy Agency',
    expiryDate: '2026-10-28', // EXPIRING IN 13 DAYS
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Chiller Fridge 1',
    demandLevel: 'High',
    stockMovements: []
  },
  {
    id: 'prod-06',
    name: 'Surf Excel Easy Wash Detergent Powder 1kg',
    nameHi: 'सर्फ एक्सेल ईज़ी वॉश डिटर्जेंट 1 किलो',
    sku: 'SRF-DET-1K',
    category: 'Home Care',
    costPrice: 128.00,
    sellingPrice: 154.00,
    stock: 32,
    unit: 'packet',
    minStockThreshold: 15,
    supplierId: 'sup-02',
    supplierName: 'Agarwal FMCG Distributors',
    expiryDate: '2028-02-14',
    lastSaleDate: '2026-10-14',
    shelfLocation: 'Aisle 3 - Shelf A',
    demandLevel: 'Medium',
    stockMovements: []
  },
  {
    id: 'prod-07',
    name: 'Dettol Antiseptic Liquid 250ml',
    nameHi: 'डेटॉल एंटीसेप्टिक लिक्विड 250 मि.ली.',
    sku: 'DET-ANT-250',
    category: 'Personal Care',
    costPrice: 148.00,
    sellingPrice: 180.00,
    stock: 4,
    unit: 'bottle',
    minStockThreshold: 12, // CRITICAL LOW STOCK
    supplierId: 'sup-02',
    supplierName: 'Agarwal FMCG Distributors',
    expiryDate: '2027-11-01',
    lastSaleDate: '2026-10-13',
    shelfLocation: 'Counter Glass Shelf',
    demandLevel: 'Medium',
    stockMovements: []
  },
  {
    id: 'prod-08',
    name: 'Parle-G Original Gluco Biscuits 800g Family Pack',
    nameHi: 'पारले-जी बिस्कुट 800 ग्राम फैमिली पैक',
    sku: 'PAR-GLU-800',
    category: 'Snacks & Beverages',
    costPrice: 68.00,
    sellingPrice: 82.00,
    stock: 64,
    unit: 'packet',
    minStockThreshold: 20,
    supplierId: 'sup-02',
    supplierName: 'Agarwal FMCG Distributors',
    expiryDate: '2027-03-15',
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Aisle 1 - Front Basket',
    demandLevel: 'High',
    stockMovements: []
  },
  {
    id: 'prod-09',
    name: 'Catch Super Garam Masala 100g',
    nameHi: 'कैच गरम मसाला 100 ग्राम',
    sku: 'CAT-MAS-100',
    category: 'Spices & Staples',
    costPrice: 76.00,
    sellingPrice: 98.00,
    stock: 24,
    unit: 'packet',
    minStockThreshold: 10,
    supplierId: 'sup-01',
    supplierName: 'Sharma Traders (Wholesale Groceries)',
    expiryDate: '2027-06-20',
    lastSaleDate: '2026-10-12',
    shelfLocation: 'Spice Rack 4',
    demandLevel: 'Medium',
    stockMovements: []
  },
  {
    id: 'prod-10',
    name: 'Everest Kasoori Methi 100g Box',
    nameHi: 'एवरेस्ट कसूरी मेथी 100 ग्राम',
    sku: 'EVE-MET-100',
    category: 'Spices & Staples',
    costPrice: 48.00,
    sellingPrice: 65.00,
    stock: 19,
    unit: 'box',
    minStockThreshold: 5,
    supplierId: 'sup-01',
    supplierName: 'Sharma Traders (Wholesale Groceries)',
    expiryDate: '2026-10-24', // EXPIRING IN 9 DAYS!
    lastSaleDate: '2026-08-20', // SLOW MOVING / DEAD STOCK CANDIDATE
    shelfLocation: 'Spice Rack 5',
    demandLevel: 'Slow-Moving',
    stockMovements: []
  },
  {
    id: 'prod-11',
    name: 'Haldiram All in One Mixture 400g',
    nameHi: 'हल्दीराम ऑल इन वन मिक्सचर 400 ग्राम',
    sku: 'HAL-ALL-400',
    category: 'Snacks & Beverages',
    costPrice: 85.00,
    sellingPrice: 105.00,
    stock: 3,
    unit: 'packet',
    minStockThreshold: 15, // LOW STOCK
    supplierId: 'sup-02',
    supplierName: 'Agarwal FMCG Distributors',
    expiryDate: '2027-02-10',
    lastSaleDate: '2026-10-15',
    shelfLocation: 'Aisle 1 - Top Shelf',
    demandLevel: 'High',
    stockMovements: []
  },
  {
    id: 'prod-12',
    name: 'Dabur Honey 100% Pure 500g',
    nameHi: 'डाबर शहद 500 ग्राम',
    sku: 'DAB-HON-500',
    category: 'Groceries',
    costPrice: 185.00,
    sellingPrice: 235.00,
    stock: 15,
    unit: 'bottle',
    minStockThreshold: 8,
    supplierId: 'sup-04',
    supplierName: 'Patanjali & Organic Depot',
    expiryDate: '2027-10-01',
    lastSaleDate: '2026-10-14',
    shelfLocation: 'Counter Glass Shelf',
    demandLevel: 'Medium',
    stockMovements: []
  }
];

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    name: 'Ramesh Kumar (Master Tailor)',
    nameHi: 'रमेश कुमार (मास्टर दर्जी)',
    phone: '+91 98711 02938',
    address: 'Near Old Post Office, Gali 3',
    creditLimit: 10000,
    trustScore: 'Good',
    lastTransactionDate: '2026-10-14',
    overdueDays: 22,
    ledger: [
      {
        id: 'led-1',
        customerId: 'cust-01',
        date: '2026-09-22',
        type: 'CREDIT_GIVEN',
        amount: 2450,
        balanceAfter: 2450,
        description: 'Monthly grocery udhaar (Atta, Oil, Sugar)',
        billRef: 'INV-2026-0922'
      },
      {
        id: 'led-2',
        customerId: 'cust-01',
        date: '2026-10-02',
        type: 'PAYMENT_RECEIVED',
        amount: 1000,
        balanceAfter: 1450,
        description: 'Partial cash payment received at counter',
        paymentMethod: 'CASH'
      },
      {
        id: 'led-3',
        customerId: 'cust-01',
        date: '2026-10-14',
        type: 'CREDIT_GIVEN',
        amount: 1850,
        balanceAfter: 3300,
        description: 'Dal, ghee and spices udhaar',
        billRef: 'INV-2026-1014'
      }
    ]
  },
  {
    id: 'cust-02',
    name: 'Sunita Devi (Govt School Teacher)',
    nameHi: 'सुनीता देवी (शिक्षिका)',
    phone: '+91 98103 44921',
    address: 'Quarter 24-B, Railway Colony',
    creditLimit: 15000,
    trustScore: 'Excellent',
    lastTransactionDate: '2026-10-11',
    overdueDays: 4,
    ledger: [
      {
        id: 'led-4',
        customerId: 'cust-02',
        date: '2026-09-28',
        type: 'CREDIT_GIVEN',
        amount: 4100,
        balanceAfter: 4100,
        description: 'Kitchen monthly staples ration',
        billRef: 'INV-2026-0928'
      },
      {
        id: 'led-5',
        customerId: 'cust-02',
        date: '2026-10-05',
        type: 'PAYMENT_RECEIVED',
        amount: 4100,
        balanceAfter: 0,
        description: 'Full monthly salary clearance via GPay',
        paymentMethod: 'UPI'
      },
      {
        id: 'led-6',
        customerId: 'cust-02',
        date: '2026-10-11',
        type: 'CREDIT_GIVEN',
        amount: 1250,
        balanceAfter: 1250,
        description: 'Snacks, biscuits, butter & tea leaves',
        billRef: 'INV-2026-1011'
      }
    ]
  },
  {
    id: 'cust-03',
    name: 'Vikas Sharma (Plumbing Contractor)',
    nameHi: 'विकास शर्मा (प्लम्बर)',
    phone: '+91 99201 88321',
    address: 'House 55, Nai Basti',
    creditLimit: 8000,
    trustScore: 'Risky',
    lastTransactionDate: '2026-09-12',
    overdueDays: 48, // HIGH OVERDUE
    ledger: [
      {
        id: 'led-7',
        customerId: 'cust-03',
        date: '2026-08-28',
        type: 'CREDIT_GIVEN',
        amount: 3200,
        balanceAfter: 3200,
        description: 'Ration & cleaning supplies',
        billRef: 'INV-2026-0828'
      },
      {
        id: 'led-8',
        customerId: 'cust-03',
        date: '2026-09-12',
        type: 'CREDIT_GIVEN',
        amount: 1550,
        balanceAfter: 4750,
        description: 'Dry fruits and ghee',
        billRef: 'INV-2026-0912'
      }
    ]
  },
  {
    id: 'cust-04',
    name: 'Mohammad Imran (Auto Driver)',
    nameHi: 'मोहम्मद इमरान (ऑटो चालक)',
    phone: '+91 97182 34501',
    address: 'Near Jama Masjid Gate 2',
    creditLimit: 5000,
    trustScore: 'Good',
    lastTransactionDate: '2026-10-13',
    overdueDays: 12,
    ledger: [
      {
        id: 'led-9',
        customerId: 'cust-04',
        date: '2026-10-01',
        type: 'CREDIT_GIVEN',
        amount: 1400,
        balanceAfter: 1400,
        description: 'Daily ration (Atta, Sugar, Tea)',
        billRef: 'INV-2026-1001'
      },
      {
        id: 'led-10',
        customerId: 'cust-04',
        date: '2026-10-08',
        type: 'PAYMENT_RECEIVED',
        amount: 700,
        balanceAfter: 700,
        description: 'Weekly cash settlement',
        paymentMethod: 'CASH'
      },
      {
        id: 'led-11',
        customerId: 'cust-04',
        date: '2026-10-13',
        type: 'CREDIT_GIVEN',
        amount: 450,
        balanceAfter: 1150,
        description: 'Milk & bread weekly credit',
        billRef: 'INV-2026-1013'
      }
    ]
  },
  {
    id: 'cust-05',
    name: 'Anjali Verma (SBI Bank Assistant)',
    nameHi: 'अंजलि वर्मा (बैंक कर्मी)',
    phone: '+91 98450 12903',
    address: 'Flat 302, Royal Apartments',
    creditLimit: 12000,
    trustScore: 'Excellent',
    lastTransactionDate: '2026-10-09',
    overdueDays: 6,
    ledger: [
      {
        id: 'led-12',
        customerId: 'cust-05',
        date: '2026-09-30',
        type: 'CREDIT_GIVEN',
        amount: 2800,
        balanceAfter: 2800,
        description: 'Personal care & kitchen staples',
        billRef: 'INV-2026-0930'
      },
      {
        id: 'led-13',
        customerId: 'cust-05',
        date: '2026-10-04',
        type: 'PAYMENT_RECEIVED',
        amount: 2800,
        balanceAfter: 0,
        description: 'Full settlement through Paytm UPI',
        paymentMethod: 'UPI'
      },
      {
        id: 'led-14',
        customerId: 'cust-05',
        date: '2026-10-09',
        type: 'CREDIT_GIVEN',
        amount: 980,
        balanceAfter: 980,
        description: 'Gourmet biscuits and butter',
        billRef: 'INV-2026-1009'
      }
    ]
  }
];

export const DEMO_SALES: Sale[] = [
  {
    id: 'sale-01',
    invoiceNo: 'INV-2026-1015-01',
    date: '2026-10-15T09:30:00',
    customerId: 'cust-02',
    customerName: 'Sunita Devi (Govt School Teacher)',
    items: [
      { productId: 'prod-01', productName: 'Maggi 2-Minute Masala Noodles 70g', quantity: 4, unit: 'packet', unitPrice: 14, unitCost: 11.20, subtotal: 56 },
      { productId: 'prod-05', productName: 'Amul Butter Pasteurised 500g', quantity: 1, unit: 'packet', unitPrice: 285, unitCost: 252, subtotal: 285 },
      { productId: 'prod-04', productName: 'Tata Salt Vaccum Evaporated 1kg', quantity: 2, unit: 'packet', unitPrice: 28, unitCost: 22.50, subtotal: 56 }
    ],
    subtotal: 397,
    discount: 0,
    tax: 0,
    total: 397,
    paymentMode: 'UPI',
    cogs: 341.80,
    grossProfit: 55.20
  },
  {
    id: 'sale-02',
    invoiceNo: 'INV-2026-1015-02',
    date: '2026-10-15T11:15:00',
    customerName: 'Cash Walk-in Customer',
    items: [
      { productId: 'prod-02', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', quantity: 2, unit: 'packet', unitPrice: 155, unitCost: 132, subtotal: 310 },
      { productId: 'prod-03', productName: 'Aashirvaad Shudh Chakki Atta 10kg', quantity: 1, unit: 'packet', unitPrice: 435, unitCost: 382, subtotal: 435 }
    ],
    subtotal: 745,
    discount: 10,
    tax: 0,
    total: 735,
    paymentMode: 'CASH',
    cogs: 646.00,
    grossProfit: 89.00
  },
  {
    id: 'sale-03',
    invoiceNo: 'INV-2026-1015-03',
    date: '2026-10-15T13:40:00',
    customerName: 'UPI Customer (Rahul)',
    items: [
      { productId: 'prod-08', productName: 'Parle-G Original Gluco Biscuits 800g Family Pack', quantity: 2, unit: 'packet', unitPrice: 82, unitCost: 68, subtotal: 164 },
      { productId: 'prod-01', productName: 'Maggi 2-Minute Masala Noodles 70g', quantity: 6, unit: 'packet', unitPrice: 14, unitCost: 11.20, subtotal: 84 },
      { productId: 'prod-11', productName: 'Haldiram All in One Mixture 400g', quantity: 1, unit: 'packet', unitPrice: 105, unitCost: 85, subtotal: 105 }
    ],
    subtotal: 353,
    discount: 0,
    tax: 0,
    total: 353,
    paymentMode: 'UPI',
    cogs: 288.20,
    grossProfit: 64.80
  },
  {
    id: 'sale-04',
    invoiceNo: 'INV-2026-1015-04',
    date: '2026-10-15T15:20:00',
    customerId: 'cust-01',
    customerName: 'Ramesh Kumar (Master Tailor)',
    items: [
      { productId: 'prod-03', productName: 'Aashirvaad Shudh Chakki Atta 10kg', quantity: 1, unit: 'packet', unitPrice: 435, unitCost: 382, subtotal: 435 },
      { productId: 'prod-02', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', quantity: 1, unit: 'packet', unitPrice: 155, unitCost: 132, subtotal: 155 }
    ],
    subtotal: 590,
    discount: 0,
    tax: 0,
    total: 590,
    paymentMode: 'UDHAAR',
    cogs: 514.00,
    grossProfit: 76.00
  }
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    date: '2026-10-15',
    category: 'ELECTRICITY',
    categoryLabel: 'Shop Electricity & Refrigerator Power',
    categoryLabelHi: 'दुकान का बिजली बिल एवं फ्रिज पावर',
    amount: 1450,
    paymentMethod: 'UPI',
    invoiceNo: 'BSES-OCT-2026',
    notes: 'Commercial meter monthly power bill paid through PayTM',
    verifiedFromBill: true
  },
  {
    id: 'exp-02',
    date: '2026-10-14',
    category: 'TRANSPORT',
    categoryLabel: 'Cartage & Auto Loading from Khari Baoli',
    categoryLabelHi: 'खारी बावली से टेम्पो किराया व लोडिंग',
    amount: 650,
    paymentMethod: 'CASH',
    notes: 'Bulk flour & oil transport from wholesale market',
    verifiedFromBill: false
  },
  {
    id: 'exp-03',
    date: '2026-10-10',
    category: 'PACKAGING',
    categoryLabel: 'Paper Carry Bags & Biodegradable Pouches',
    categoryLabelHi: 'कागज़ के थैले व पैकेजिंग सामान',
    amount: 980,
    paymentMethod: 'UPI',
    invoiceNo: 'PKG-449',
    notes: '500 medium eco-friendly carry bags for retail packing',
    verifiedFromBill: true
  },
  {
    id: 'exp-04',
    date: '2026-10-01',
    category: 'RENT',
    categoryLabel: 'Main Bazaar Shop Monthly Rent',
    categoryLabelHi: 'दुकान का मासिक किराया (अक्टूबर)',
    amount: 18000,
    paymentMethod: 'BANK_TRANSFER',
    invoiceNo: 'RENT-OCT-26',
    notes: 'Paid to Landlord Sardar Harjit Singh via NEFT',
    verifiedFromBill: true
  },
  {
    id: 'exp-05',
    date: '2026-10-05',
    category: 'SALARIES',
    categoryLabel: 'Shop Helper & Boy Salary (Chhotu)',
    categoryLabelHi: 'दुकान सहायक का मासिक वेतन',
    amount: 9500,
    paymentMethod: 'CASH',
    notes: 'Monthly salary for store assistance and home delivery',
    verifiedFromBill: false
  }
];

export const DEMO_FESTIVALS: FestivalCampaign[] = [
  {
    id: 'fest-01',
    name: 'Diwali Maha Bachat Utsav (Deepavali)',
    nameHi: 'दीपावली महा बचत उत्सव',
    dates: 'Nov 1 - Nov 6, 2026',
    daysRemaining: 17,
    projectedSalesGrowth: 42,
    recommendedPrepStock: [
      { productName: 'Fortune Refined & Mustard Oil 1L / 5L', normalStock: 40, recommendedStock: 120, estimatedRevenue: 18600 },
      { productName: 'Catch & Everest Pure Spices Combo', normalStock: 30, recommendedStock: 80, estimatedRevenue: 7840 },
      { productName: 'Haldiram & Bikaji Namkeen Gift Packs', normalStock: 25, recommendedStock: 90, estimatedRevenue: 12150 },
      { productName: 'Dry Fruits (Almonds, Cashews, Raisins 500g)', normalStock: 10, recommendedStock: 50, estimatedRevenue: 24500 }
    ],
    checklist: [
      'Order special Diwali gift boxes from Agarwal Distributors before 22 Oct',
      'Stock extra Pure Ghee (Amul / Patanjali) for festive sweet preparation',
      'Prepare polite WhatsApp Khata balance reminders to collect udhaar before Dhanteras',
      'Set up decorative festive display near shop entrance'
    ]
  },
  {
    id: 'fest-02',
    name: 'Chhath Puja Holy Fast & Arghya',
    nameHi: 'छठ पूजा महापर्व',
    dates: 'Nov 14 - Nov 17, 2026',
    daysRemaining: 30,
    projectedSalesGrowth: 28,
    recommendedPrepStock: [
      { productName: 'Aashirvaad Atta & Maida 10kg', normalStock: 20, recommendedStock: 60, estimatedRevenue: 26100 },
      { productName: 'Pure Jaggery (Gur) & Sugar 5kg', normalStock: 25, recommendedStock: 75, estimatedRevenue: 9800 },
      { productName: 'Pooja Coconut, Camphor & Supari Kits', normalStock: 15, recommendedStock: 50, estimatedRevenue: 6500 }
    ],
    checklist: [
      'Confirm direct sugar & jaggery truck from Khari Baoli',
      'Reserve clean storage area for pure satvik ingredients'
    ]
  }
];

export const DEMO_MARKET_SCOUT_SAMPLE: MarketScoutTask = {
  id: 'task-mst-01',
  productQuery: 'Fortune Sunlite Refined Sunflower Oil 1L',
  category: 'Groceries & Edible Oils',
  targetMarket: 'Delhi NCR Wholesale / B2B Listings',
  status: 'COMPLETED',
  startedAt: '2026-10-15T14:10:00Z',
  completedAt: '2026-10-15T14:10:04Z',
  ourCostPrice: 132.00,
  bestExternalPrice: 124.50,
  potentialSavingPercent: 5.68,
  results: [
    {
      id: 'tf-1',
      supplierName: 'Udaan B2B Trade Depot',
      platform: 'Udaan Wholesale',
      productMatch: 'Fortune Sunlite Refined Sunflower Oil (Pouch)',
      packSize: '1 Litre x 12 Pouches Case',
      packSizeMatch: true,
      listedPrice: 124.50,
      minOrderQty: 12,
      deliveryDays: 1,
      sourceUrl: 'https://udaan.com/groceries/edible-oils/fortune-1l',
      retrievedAt: '2026-10-15T14:10:02Z',
      notes: 'Lowest wholesale carton rate for verified retail GSTIN holders.'
    },
    {
      id: 'tf-2',
      supplierName: 'Jumbotail Marketplace Partner',
      platform: 'Jumbotail Retailer App',
      productMatch: 'Fortune Refined Sunflower Oil 1L Pouch',
      packSize: '1 Litre x 16 Pouches Box',
      packSizeMatch: true,
      listedPrice: 126.20,
      minOrderQty: 16,
      deliveryDays: 2,
      sourceUrl: 'https://jumbotail.com/listings/fortune-oil',
      retrievedAt: '2026-10-15T14:10:03Z',
      notes: 'Free store doorstep delivery on orders above ₹5,000.'
    },
    {
      id: 'tf-3',
      supplierName: 'Metro Cash & Carry (Shahdara Store)',
      platform: 'Metro Wholesale B2B',
      productMatch: 'Fortune Sunflower Oil Bottle 1L',
      packSize: '1 Litre Bottle (Not Pouch)',
      packSizeMatch: false, // FLAG PACK SIZE MISMATCH!
      listedPrice: 138.00,
      minOrderQty: 6,
      deliveryDays: 1,
      sourceUrl: 'https://metro.co.in/groceries/fortune-1l-bottle',
      retrievedAt: '2026-10-15T14:10:04Z',
      notes: 'Pack size mismatch: Bottle packaging costs higher than pouch.'
    },
    {
      id: 'tf-4',
      supplierName: 'IndiaMART Verified Merchant — Khemka Oils',
      platform: 'IndiaMART Marketplace',
      productMatch: 'Fortune Sunlite Sunflower Oil 1L Pouch',
      packSize: '1 Litre Pouch (MOQ 100 units)',
      packSizeMatch: true,
      listedPrice: 122.80,
      minOrderQty: 100,
      deliveryDays: 4,
      sourceUrl: 'https://dir.indiamart.com/delhi/fortune-edible-oil',
      retrievedAt: '2026-10-15T14:10:04Z',
      notes: 'Requires high Minimum Order Quantity (100 units) and advance payment.'
    }
  ]
};
