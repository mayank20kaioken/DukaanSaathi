// Utility formatters with strict adherence to Indian currency standards and Hindi/English support

export const formatINR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  // Custom Indian numbering system formatting
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  
  const str = absAmount.toString();
  let result = '';
  
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = withCommas + ',' + lastThree;
  }
  
  return (isNegative ? '-₹' : '₹') + result;
};

export const formatPercent = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
};

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

// Calculate financial margins
export const calculateProductMargins = (sellingPrice: number, costPrice: number) => {
  const margin = Math.max(0, sellingPrice - costPrice);
  const marginPercent = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;
  return {
    margin,
    marginPercent: Number(marginPercent.toFixed(1)),
    markupPercent: costPrice > 0 ? Number(((margin / costPrice) * 100).toFixed(1)) : 0,
  };
};

// Hindi translations for key financial metrics
export const METRIC_TRANSLATIONS = {
  todaySales: { en: "Today's Sales", hi: "आज की कुल बिक्री" },
  grossProfit: { en: "Gross Profit", hi: "सकल लाभ (मार्जिन)" },
  netProfit: { en: "Net Operating Profit", hi: "शुद्ध लाभ" },
  totalUdhaar: { en: "Outstanding Credit (Udhaar)", hi: "कुल बकाया उधारी" },
  inventoryValue: { en: "Current Inventory Value", hi: "वर्तमान स्टॉक मूल्य" },
  lowStockItems: { en: "Low Stock Alert", hi: "कम स्टॉक वाले सामान" },
  cogs: { en: "Cost of Goods Sold (COGS)", hi: "बिके माल की लागत" },
  operatingExpenses: { en: "Operating Expenses", hi: "दुकान के खर्चे" },
};
