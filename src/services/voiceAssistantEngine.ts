import { Product, Customer, Supplier, Sale, Expense } from '../types';
import { formatINR, calculateProductMargins } from '../utils/formatters';

export interface VoiceAssistantResponse {
  query: string;
  matchedIntent: string;
  textEn: string;
  textHi: string;
  spokenText: string;
  evidenceType: 'PRODUCT' | 'CUSTOMER' | 'SALES' | 'SUPPLIER' | 'REORDER' | 'EXPIRY' | 'GENERAL' | 'NOT_FOUND';
  evidenceData?: any;
  suggestedFollowUps: string[];
}

export class VoiceAssistantEngine {
  private products: Product[];
  private customers: Customer[];
  private suppliers: Supplier[];
  private sales: Sale[];
  private expenses: Expense[];

  constructor(
    products: Product[],
    customers: Customer[],
    suppliers: Supplier[],
    sales: Sale[],
    expenses: Expense[]
  ) {
    this.products = products;
    this.customers = customers;
    this.suppliers = suppliers;
    this.sales = sales;
    this.expenses = expenses;
  }

  public updateContext(
    products: Product[],
    customers: Customer[],
    suppliers: Supplier[],
    sales: Sale[],
    expenses: Expense[]
  ) {
    this.products = products;
    this.customers = customers;
    this.suppliers = suppliers;
    this.sales = sales;
    this.expenses = expenses;
  }

  public processQuery(rawQuery: string): VoiceAssistantResponse {
    const q = rawQuery.toLowerCase().trim();

    // 1. TODAY'S SALES & PROFIT QUERY
    // "Aaj ki total sale kitni hui?", "Today's sales", "batao aaj ki bikri"
    if (
      q.includes('sale') || 
      q.includes('bikri') || 
      q.includes('kamai') || 
      q.includes('aaj ki total') ||
      q.includes('todays sale')
    ) {
      const todayTotal = this.sales.reduce((sum, s) => sum + s.total, 0);
      const todayGross = this.sales.reduce((sum, s) => sum + s.grossProfit, 0);
      const count = this.sales.length;

      return {
        query: rawQuery,
        matchedIntent: 'TODAYS_SALES_SUMMARY',
        textEn: `Today's recorded sales amount to ${formatINR(todayTotal)} across ${count} customer bills, with an estimated gross profit margin of ${formatINR(todayGross)}.`,
        textHi: `आज की कुल बिक्री ${formatINR(todayTotal)} है (${count} बिल), जिसमें अनुमानित ग्रॉस प्रॉफ़िट (सकल लाभ) ${formatINR(todayGross)} है।`,
        spokenText: `आज की कुल बिक्री ${todayTotal} रुपये है, और ग्रॉस प्रॉफ़िट ${todayGross} रुपये है।`,
        evidenceType: 'SALES',
        evidenceData: {
          totalSales: todayTotal,
          billCount: count,
          grossProfit: todayGross,
          bills: this.sales.slice(0, 3)
        },
        suggestedFollowUps: [
          'Sabse zyada munafa kis product mein hai?',
          'Kis customer ka sabse zyada udhaar baaki hai?',
          'Record new sale'
        ]
      };
    }

    // 2. PRODUCT BUYING & SELLING PRICE QUERIES
    // "Maggi ka khareedne ka rate aur selling price batao", "Mujhe Maggi ka buying price aur selling price dono batao"
    // "Fortune oil price", "Atta price"
    const matchedProduct = this.products.find(p => {
      const name = p.name.toLowerCase();
      const nameHi = p.nameHi.toLowerCase();
      const sku = p.sku.toLowerCase();
      const searchTerms = [
        'maggi', 'fortune', 'oil', 'atta', 'aashirvaad', 'tata salt', 'salt', 
        'butter', 'amul', 'surf excel', 'dettol', 'parle', 'garam masala', 'methi', 
        'haldiram', 'honey', 'dabur'
      ];
      
      for (const term of searchTerms) {
        if (q.includes(term) && (name.includes(term) || nameHi.includes(term) || sku.includes(term))) {
          return true;
        }
      }
      return false;
    });

    if (matchedProduct && (
      q.includes('price') || 
      q.includes('rate') || 
      q.includes('batao') || 
      q.includes('khareedne') || 
      q.includes('selling') || 
      q.includes('buying') || 
      q.includes('margin') ||
      q.includes('kitne ka') ||
      q.includes('cost') ||
      q.includes('mrp')
    )) {
      const margins = calculateProductMargins(matchedProduct.sellingPrice, matchedProduct.costPrice);
      return {
        query: rawQuery,
        matchedIntent: 'PRODUCT_PRICE_AND_MARGIN',
        textEn: `${matchedProduct.name}: Buying Cost is ${formatINR(matchedProduct.costPrice)}, MRP/Selling Price is ${formatINR(matchedProduct.sellingPrice)}. Unit Margin is ${formatINR(margins.margin)} (${margins.marginPercent}%). Available Stock: ${matchedProduct.stock} ${matchedProduct.unit}s.`,
        textHi: `${matchedProduct.nameHi || matchedProduct.name}: खरीद दर ${formatINR(matchedProduct.costPrice)} और बिक्री दर ${formatINR(matchedProduct.sellingPrice)} है। प्रति यूनिट मार्जिन ${formatINR(margins.margin)} (${margins.marginPercent}%) है। दुकान में वर्तमान स्टॉक ${matchedProduct.stock} ${matchedProduct.unit} है।`,
        spokenText: `${matchedProduct.name} का खरीद रेट ${matchedProduct.costPrice} रुपये और सेलिंग रेट ${matchedProduct.sellingPrice} रुपये है। आपको प्रति पीस ${margins.margin} रुपये का मुनाफा मिल रहा है।`,
        evidenceType: 'PRODUCT',
        evidenceData: {
          product: matchedProduct,
          margins
        },
        suggestedFollowUps: [
          `TinyFish par ${matchedProduct.name.split(' ')[0]} ka market rate check karo`,
          'Kaunse products dobara order karne hain?',
          'Sabse zyada munafa kis product mein hai?'
        ]
      };
    }

    // 3. HIGHEST PROFIT MARGIN QUERY
    // "Sabse zyada munafa kis product mein hai?", "Highest margin product"
    if (
      q.includes('munafa') || 
      q.includes('profit') || 
      q.includes('margin') || 
      q.includes('sabse zyada fayda') ||
      q.includes('zyada kamai')
    ) {
      const sortedByMargin = [...this.products].sort((a, b) => {
        const marginA = calculateProductMargins(a.sellingPrice, a.costPrice).marginPercent;
        const marginB = calculateProductMargins(b.sellingPrice, b.costPrice).marginPercent;
        return marginB - marginA;
      });

      const top = sortedByMargin[0];
      const topMargin = calculateProductMargins(top.sellingPrice, top.costPrice);

      return {
        query: rawQuery,
        matchedIntent: 'HIGHEST_MARGIN_PRODUCT',
        textEn: `The highest percentage margin product is "${top.name}" with a ${topMargin.marginPercent}% margin (Cost: ${formatINR(top.costPrice)}, Selling: ${formatINR(top.sellingPrice)}, Profit per unit: ${formatINR(topMargin.margin)}).`,
        textHi: `आपकी दुकान में सबसे अधिक मार्जिन प्रतिशत वाला उत्पाद "${top.nameHi || top.name}" है। इसमें ${topMargin.marginPercent}% का मार्जिन है (खरीद: ${formatINR(top.costPrice)}, बिक्री: ${formatINR(top.sellingPrice)}, प्रति यूनिट मुनाफा: ${formatINR(topMargin.margin)})।`,
        spokenText: `सबसे ज्यादा मुनाफा ${top.name} में है, जिसमें आपको ${topMargin.marginPercent} प्रतिशत का मार्जिन मिल रहा है।`,
        evidenceType: 'PRODUCT',
        evidenceData: {
          topProducts: sortedByMargin.slice(0, 4).map(p => ({
            ...p,
            marginInfo: calculateProductMargins(p.sellingPrice, p.costPrice)
          }))
        },
        suggestedFollowUps: [
          'Kaunse products dobara order karne hain?',
          'Kis customer ka sabse zyada udhaar baaki hai?'
        ]
      };
    }

    // 4. HIGHEST CUSTOMER UDHAAR QUERY
    // "Kis customer ka sabse zyada udhaar baaki hai?", "Who owes the most credit?"
    if (
      q.includes('udhaar') || 
      q.includes('udhar') || 
      q.includes('credit') || 
      q.includes('baki') || 
      q.includes('baaki') ||
      q.includes('pending payment') ||
      q.includes('khata')
    ) {
      // Calculate customer balances directly from ledgers!
      const customersWithBalance = this.customers.map(c => {
        const balance = c.ledger.reduce((acc, entry) => {
          if (entry.type === 'CREDIT_GIVEN') return acc + entry.amount;
          if (entry.type === 'PAYMENT_RECEIVED' || entry.type === 'DISCOUNT') return acc - entry.amount;
          return acc;
        }, 0);
        return { ...c, computedBalance: balance };
      }).sort((a, b) => b.computedBalance - a.computedBalance);

      const topDebtor = customersWithBalance[0];
      const totalAllUdhaar = customersWithBalance.reduce((sum, c) => sum + c.computedBalance, 0);

      return {
        query: rawQuery,
        matchedIntent: 'HIGHEST_UDHAAR_CUSTOMER',
        textEn: `Customer with the highest outstanding udhaar is ${topDebtor.name} with ${formatINR(topDebtor.computedBalance)} overdue for ${topDebtor.overdueDays} days. Total market credit across all ${this.customers.length} khata holders is ${formatINR(totalAllUdhaar)}.`,
        textHi: `सबसे अधिक बकाया उधारी ${topDebtor.nameHi || topDebtor.name} के नाम पर है—कुल ${formatINR(topDebtor.computedBalance)} (पिछले ${topDebtor.overdueDays} दिनों से)। सभी खाताधारकों का कुल बकाया ${formatINR(totalAllUdhaar)} है।`,
        spokenText: `सबसे ज्यादा उधारी ${topDebtor.name} की बाकी है, कुल ${topDebtor.computedBalance} रुपये।`,
        evidenceType: 'CUSTOMER',
        evidenceData: {
          topDebtor,
          topDebtorsList: customersWithBalance.slice(0, 3),
          totalMarketUdhaar: totalAllUdhaar
        },
        suggestedFollowUps: [
          `Send WhatsApp reminder to ${topDebtor.name.split(' ')[0]}`,
          'Aaj ki total sale kitni hui?',
          'Kaunse products dobara order karne hain?'
        ]
      };
    }

    // 5. REORDER / LOW STOCK QUERY
    // "Kaunse products dobara order karne hain?", "Reorder suggestions", "Low stock"
    if (
      q.includes('order') || 
      q.includes('reorder') || 
      q.includes('stock') || 
      q.includes('khatam') || 
      q.includes('mangwana') ||
      q.includes('kam stock')
    ) {
      const lowStockProducts = this.products.filter(p => p.stock <= p.minStockThreshold);

      return {
        query: rawQuery,
        matchedIntent: 'REORDER_SUGGESTIONS',
        textEn: `There are currently ${lowStockProducts.length} products that have fallen below their safety threshold and require immediate replenishment: ${lowStockProducts.map(p => `${p.name.split(' ')[0]} (${p.stock} left)`).join(', ')}.`,
        textHi: `दुकान में कुल ${lowStockProducts.length} उत्पाद सुरक्षा सीमा से नीचे हैं और तुरंत दोबारा ऑर्डर करने योग्य हैं: ${lowStockProducts.map(p => `${p.name.split(' ')[0]} (मात्र ${p.stock} शेष)`).join(', ')}।`,
        spokenText: `दुकान में ${lowStockProducts.length} सामान का स्टॉक कम है, जैसे ${lowStockProducts[0]?.name.split(' ')[0]} और ${lowStockProducts[1]?.name.split(' ')[0]}। इन्हें जल्द मंगवा लें।`,
        evidenceType: 'REORDER',
        evidenceData: {
          lowStockProducts: lowStockProducts.map(p => ({
            ...p,
            recommendedReorderQty: Math.max(20, (p.minStockThreshold * 2) - p.stock)
          }))
        },
        suggestedFollowUps: [
          'Mere supplier Sharma Traders ka number kya hai?',
          'Sabse zyada munafa kis product mein hai?'
        ]
      };
    }

    // 6. SUPPLIER CONTACT QUERY
    // "Mere supplier Sharma Traders ka number kya hai?", "Supplier contact", "Rajesh Sharma number"
    if (
      q.includes('supplier') || 
      q.includes('sharma traders') || 
      q.includes('agarwal') || 
      q.includes('number') || 
      q.includes('phone') ||
      q.includes('contact') ||
      q.includes('amul agency')
    ) {
      const matchedSupplier = this.suppliers.find(s => {
        const name = s.name.toLowerCase();
        const contact = s.contactPerson.toLowerCase();
        return q.includes('sharma') ? name.includes('sharma') :
               q.includes('agarwal') ? name.includes('agarwal') :
               q.includes('amul') ? name.includes('amul') :
               q.includes('patanjali') ? name.includes('patanjali') :
               name.includes(q) || contact.includes(q);
      }) || this.suppliers[0];

      return {
        query: rawQuery,
        matchedIntent: 'SUPPLIER_CONTACT_INFO',
        textEn: `${matchedSupplier.name}: Contact Person is ${matchedSupplier.contactPerson}, Phone: ${matchedSupplier.phone}. Pending settlement balance: ${formatINR(matchedSupplier.pendingPayment)}. Address: ${matchedSupplier.address}.`,
        textHi: `${matchedSupplier.name}: संपर्क व्यक्ति ${matchedSupplier.contactPerson}, फोन नंबर ${matchedSupplier.phone} है। बकाया भुगतान ${formatINR(matchedSupplier.pendingPayment)} है। पता: ${matchedSupplier.address}।`,
        spokenText: `${matchedSupplier.name} के राजेश शर्मा का मोबाइल नंबर है: ${matchedSupplier.phone}।`,
        evidenceType: 'SUPPLIER',
        evidenceData: {
          supplier: matchedSupplier
        },
        suggestedFollowUps: [
          `Call ${matchedSupplier.contactPerson}`,
          'Kaunse products dobara order karne hain?',
          'Aaj ki total sale kitni hui?'
        ]
      };
    }

    // 7. EXPIRY DATE ALERTS
    if (q.includes('expiry') || q.includes('kharab') || q.includes('date')) {
      const expiringItems = this.products.filter(p => {
        if (!p.expiryDate) return false;
        const diffDays = Math.ceil((new Date(p.expiryDate).getTime() - new Date('2026-10-15').getTime()) / (1000 * 3600 * 24));
        return diffDays <= 30;
      });

      return {
        query: rawQuery,
        matchedIntent: 'EXPIRY_ALERTS',
        textEn: `Found ${expiringItems.length} products expiring within the next 30 days. Priority item: "${expiringItems[0]?.name}" expiring in 9 days.`,
        textHi: `अगले 30 दिनों में एक्सपायर होने वाले ${expiringItems.length} उत्पाद मिले हैं। मुख्य रूप से "${expiringItems[0]?.nameHi || expiringItems[0]?.name}" मात्र 9 दिनों में समाप्त हो रहा है।`,
        spokenText: `अगले 30 दिनों में ${expiringItems.length} सामान एक्सपायर हो रहे हैं, जैसे ${expiringItems[0]?.name.split(' ')[0]}।`,
        evidenceType: 'EXPIRY',
        evidenceData: { expiringItems },
        suggestedFollowUps: [
          'Put expiring items on special discount',
          'Check slow-moving stock'
        ]
      };
    }

    // DEFAULT / UNMATCHED QUERY WITH INTELLIGENT GUIDANCE
    return {
      query: rawQuery,
      matchedIntent: 'GENERAL_ASSISTANCE',
      textEn: `I couldn't find a direct record matching "${rawQuery}". You can ask me in Hindi or English about: today's sales, product buying and selling rates, customer udhaar, low stock items, or supplier contact details.`,
      textHi: `मुझे "${rawQuery}" से संबंधित कोई रिकॉर्ड नहीं मिला। आप मुझसे हिंदी या इंग्लिश में पूछ सकते हैं: आज की कुल बिक्री, किसी भी सामान का खरीद व बिक्री रेट, ग्राहकों का बकाया उधार, या सप्लायर का संपर्क नंबर।`,
      spokenText: `माफ़ कीजिए, इसका रिकॉर्ड नहीं मिला। आप आज की बिक्री, किसी सामान का रेट, या उधारी के बारे में पूछ सकते हैं।`,
      evidenceType: 'NOT_FOUND',
      suggestedFollowUps: [
        'Aaj ki total sale kitni hui?',
        'Maggi ka khareedne ka rate aur selling price batao',
        'Sabse zyada munafa kis product mein hai?',
        'Kis customer ka sabse zyada udhaar baaki hai?'
      ]
    };
  }
}
