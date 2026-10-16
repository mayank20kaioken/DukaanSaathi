import { createWorker } from 'tesseract.js';
import { ScannedBill, ScannedBillItem, UnitType } from '../types';

export interface OcrProgressCallback {
  (status: string, progress: number): void;
}

// Visual SVG generator for sample invoices
function createSampleInvoiceSvg(supplier: string, invNo: string, date: string, items: Array<{ name: string; qty: number; unit: string; rate: number; tax: number; amount: number }>, discount: number, total: number, received: number, due: number): string {
  const itemRows = items.map((it, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 6px 8px; font-size: 11px;">${idx + 1}. ${it.name}</td>
      <td style="padding: 6px 8px; font-size: 11px; text-align: center;">${it.qty} ${it.unit}</td>
      <td style="padding: 6px 8px; font-size: 11px; text-align: right;">₹${it.rate.toFixed(2)}</td>
      <td style="padding: 6px 8px; font-size: 11px; text-align: right;">₹${it.tax.toFixed(2)}</td>
      <td style="padding: 6px 8px; font-size: 11px; text-align: right; font-weight: bold;">₹${it.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
      <defs>
        <style>
          .bg { fill: #ffffff; }
          .title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 800; fill: #0f172a; }
          .subtitle { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; fill: #64748b; }
          .badge { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: 700; fill: #0284c7; }
          .table-header { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: 700; fill: #475569; }
          .bold { font-weight: 700; }
        </style>
      </defs>
      <rect width="600" height="760" fill="#f8fafc" rx="8"/>
      <rect x="20" y="20" width="560" height="720" class="bg" stroke="#cbd5e1" stroke-width="1.5" rx="6"/>
      
      <!-- Top banner -->
      <path d="M 20 26 C 20 22 24 20 28 20 L 572 20 C 576 20 580 22 580 26 L 580 80 L 20 80 Z" fill="#f1f5f9"/>
      <text x="40" y="52" class="title">${supplier.toUpperCase()}</text>
      <text x="40" y="70" class="subtitle">TAX INVOICE / CASH MEMO • WHOLESALE SUPPLY</text>
      <rect x="470" y="38" width="90" height="24" rx="12" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
      <text x="515" y="54" class="badge" text-anchor="middle">DEMO BILL</text>

      <!-- Meta info -->
      <line x1="20" y1="80" x2="580" y2="80" stroke="#cbd5e1" stroke-width="1"/>
      <text x="40" y="110" font-family="Arial" font-size="12" fill="#334155"><tspan class="bold">Invoice No:</tspan> ${invNo}</text>
      <text x="40" y="130" font-family="Arial" font-size="12" fill="#334155"><tspan class="bold">Date:</tspan> ${date}</text>
      <text x="40" y="150" font-family="Arial" font-size="12" fill="#334155"><tspan class="bold">Payment Mode:</tspan> Part Cash / Balance Due</text>

      <text x="360" y="110" font-family="Arial" font-size="12" fill="#334155"><tspan class="bold">Customer:</tspan> Gupta General Store</text>
      <text x="360" y="130" font-family="Arial" font-size="12" fill="#334155"><tspan class="bold">Location:</tspan> Main Bazaar, Delhi</text>
      <text x="360" y="150" font-family="Arial" font-size="12" fill="#334155"><tspan class="bold">Status:</tspan> Verified Physical Copy</text>

      <!-- Table header -->
      <rect x="35" y="175" width="530" height="28" fill="#e2e8f0" rx="4"/>
      <text x="45" y="193" class="table-header">ITEM DESCRIPTION</text>
      <text x="280" y="193" class="table-header" text-anchor="middle">QTY</text>
      <text x="360" y="193" class="table-header" text-anchor="end">RATE</text>
      <text x="440" y="193" class="table-header" text-anchor="end">TAX</text>
      <text x="550" y="193" class="table-header" text-anchor="end">AMOUNT</text>

      <!-- Embedded HTML Table for Items -->
      <foreignObject x="35" y="205" width="530" height="340">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
            ${itemRows}
          </table>
        </div>
      </foreignObject>

      <!-- Totals Box -->
      <rect x="320" y="520" width="245" height="180" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" rx="6"/>
      <text x="335" y="545" font-family="Arial" font-size="12" fill="#475569">Item Total (Sum):</text>
      <text x="550" y="545" font-family="Arial" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">₹${items.reduce((s, it) => s + it.amount, 0).toFixed(2)}</text>

      <text x="335" y="570" font-family="Arial" font-size="12" fill="#ef4444">Less: Discount:</text>
      <text x="550" y="570" font-family="Arial" font-size="12" font-weight="bold" fill="#ef4444" text-anchor="end">-₹${discount.toFixed(2)}</text>

      <line x1="330" y1="585" x2="555" y2="585" stroke="#cbd5e1" stroke-width="1"/>
      <text x="335" y="608" font-family="Arial" font-size="14" font-weight="bold" fill="#0f172a">Printed Bill Total:</text>
      <text x="550" y="608" font-family="Arial" font-size="16" font-weight="800" fill="#0284c7" text-anchor="end">₹${total.toFixed(2)}</text>

      <line x1="330" y1="622" x2="555" y2="622" stroke="#cbd5e1" stroke-width="1"/>
      <text x="335" y="645" font-family="Arial" font-size="12" fill="#059669">Amount Received:</text>
      <text x="550" y="645" font-family="Arial" font-size="12" font-weight="bold" fill="#059669" text-anchor="end">₹${received.toFixed(2)}</text>

      <text x="335" y="672" font-family="Arial" font-size="12" font-weight="bold" fill="#b45309">Balance Due:</text>
      <text x="550" y="672" font-family="Arial" font-size="14" font-weight="bold" fill="#b45309" text-anchor="end">₹${due.toFixed(2)}</text>

      <!-- Signature & Footer note -->
      <text x="40" y="660" font-family="Arial" font-size="11" fill="#64748b">Authorized Signatory</text>
      <text x="40" y="680" font-family="'Brush Script MT', cursive, sans-serif" font-size="20" fill="#0369a1">AkashEnt</text>
      <text x="40" y="720" font-family="Arial" font-size="10" fill="#94a3b8">Subject to Delhi jurisdiction. Discrepancy in itemized print intentional for audit testing.</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

// Built-in sample invoice presets for the explicit "Try Sample Bill" testing option
export const SAMPLE_INVOICE_PRESETS = [
  {
    id: 'preset-akash-fruits',
    title: 'Akash Enterprises (Fruit Merchant Invoice)',
    supplierName: 'Akash Enterprises',
    invoiceNo: 'S01',
    date: '2023-08-11',
    printedTotal: 1055.00,
    discount: 100.00,
    receivedAmount: 500.00,
    dueBalance: 555.00,
    imageUrl: createSampleInvoiceSvg(
      'Akash Enterprises',
      'S01',
      '11 August 2023',
      [
        { name: 'Apple normal', qty: 5, unit: 'kg', rate: 100, tax: 5, amount: 525 },
        { name: 'Orange', qty: 10, unit: 'kg', rate: 40, tax: 2, amount: 525 },
        { name: 'Orange', qty: 5, unit: 'kg', rate: 40, tax: 2, amount: 210 }
      ],
      100,
      1055,
      500,
      555
    ),
    items: [
      { id: 'bi-akash-1', name: 'Apple normal', quantity: 5, unit: 'kg' as UnitType, rate: 100.00, taxRate: 5.00, amount: 525.00, printedAmount: 525.00 },
      { id: 'bi-akash-2', name: 'Orange', quantity: 10, unit: 'kg' as UnitType, rate: 40.00, taxRate: 2.00, amount: 525.00, printedAmount: 525.00 },
      { id: 'bi-akash-3', name: 'Orange', quantity: 5, unit: 'kg' as UnitType, rate: 40.00, taxRate: 2.00, amount: 210.00, printedAmount: 210.00 }
    ]
  },
  {
    id: 'preset-sharma-groceries',
    title: 'Sharma Traders Wholesale Tax Invoice',
    supplierName: 'Sharma Traders (Wholesale Groceries)',
    invoiceNo: 'ST-2026-8942',
    date: '2026-10-14',
    printedTotal: 12450.00,
    discount: 0,
    receivedAmount: 12450.00,
    dueBalance: 0,
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c079ae885?auto=format&fit=crop&w=800&q=80',
    items: [
      { id: 'bi-1', name: 'Aashirvaad Shudh Chakki Atta 10kg', quantity: 20, unit: 'packet' as UnitType, rate: 382.00, taxRate: 0, amount: 7640.00, printedAmount: 7640.00, matchedProductId: 'prod-03' },
      { id: 'bi-2', name: 'Fortune Refined Sunflower Oil 1L Pouch', quantity: 24, unit: 'packet' as UnitType, rate: 132.00, taxRate: 5, amount: 3326.40, printedAmount: 3326.40, matchedProductId: 'prod-02' },
      { id: 'bi-3', name: 'Tata Salt Vacuum Evaporated 1kg', quantity: 50, unit: 'packet' as UnitType, rate: 22.50, taxRate: 0, amount: 1125.00, printedAmount: 1125.00, matchedProductId: 'prod-04' },
      { id: 'bi-4', name: 'Catch Super Garam Masala 100g Box', quantity: 4, unit: 'packet' as UnitType, rate: 76.00, taxRate: 12, amount: 340.48, printedAmount: 340.48, matchedProductId: 'prod-09' }
    ]
  }
];

export class BillScannerService {
  /**
   * Run real OCR on the selected image using Tesseract.js.
   * Never falls back to hardcoded demo data when OCR fails.
   */
  public static async processInvoiceImage(
    imageSource: string | File | Blob,
    fileName?: string,
    fileSize?: string,
    onProgress?: OcrProgressCallback
  ): Promise<ScannedBill> {
    try {
      if (onProgress) onProgress('Initializing Tesseract OCR worker...', 15);

      const worker = await createWorker('eng');

      if (onProgress) onProgress('Analyzing invoice image text & layout...', 45);

      const result = await worker.recognize(imageSource);

      if (onProgress) onProgress('Extracting fields, items and prices...', 80);

      const rawText = result.data.text || '';
      const parsed = this.parseExtractedText(rawText, imageSource, fileName, fileSize);

      await worker.terminate();
      if (onProgress) onProgress('OCR analysis complete.', 100);

      return parsed;
    } catch (err: any) {
      console.warn('OCR processing error:', err);
      // Return a clean, blank structure preserving the user's uploaded image for manual entry
      const imageUrl = typeof imageSource === 'string' 
        ? imageSource 
        : imageSource instanceof Blob 
          ? URL.createObjectURL(imageSource) 
          : undefined;

      return {
        id: `bill-${Date.now()}`,
        imageUrl,
        fileName: fileName || (imageSource instanceof File ? imageSource.name : 'uploaded-bill.jpg'),
        fileSize,
        supplierName: '',
        invoiceNo: '',
        date: new Date().toISOString().split('T')[0],
        items: [],
        calculatedSubtotal: 0,
        taxAmount: 0,
        discount: 0,
        calculatedTotal: 0,
        printedTotal: 0,
        difference: 0,
        confidence: 0,
        status: 'PENDING_REVIEW',
        warnings: ['OCR could not extract readable text from this image. Please enter the supplier details and line items manually.'],
        extractionStatus: 'FAILED',
        isSampleDemo: false
      };
    }
  }

  /**
   * Intelligently parses raw text from Indian wholesale bills.
   * Extracts supplier name, invoice number, date, line items, taxes, discounts, and totals.
   */
  public static parseExtractedText(
    rawText: string,
    imageSource?: string | File | Blob,
    fileName?: string,
    fileSize?: string
  ): ScannedBill {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    let supplierName = '';
    let invoiceNo = '';
    let date = '';
    let printedTotal = 0;
    let discount = 0;
    let receivedAmount: number | undefined = undefined;
    let dueBalance: number | undefined = undefined;
    const items: ScannedBillItem[] = [];

    // 1. Supplier Name: Scan lines 0 to 5 for title-like name, excluding generic headers
    const ignoredHeaderKeywords = [
      'tax invoice', 'bill of supply', 'retail invoice', 'cash memo', 
      'original for recipient', 'duplicate', 'invoice', 'gstin', 'phone', 
      'tel', 'mobile', 'address', 'particulars', 'cash receipt', 'estimate'
    ];

    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      if (ignoredHeaderKeywords.some(kw => lower === kw || lower.startsWith(kw + ' ') || lower.startsWith(kw + ':') || lower.startsWith(kw + ' /'))) continue;
      if (lower.includes('invoice no') || lower.includes('bill no') || lower.includes('date:') || lower.includes('date :')) continue;
      if (line.length >= 3 && /[A-Za-z]/.test(line)) {
        supplierName = line.replace(/^[#*.\s-]+|[#*.\s-]+$/g, '');
        break;
      }
    }

    // 2. Metadata: Invoice No, Date, Discount, Received, Due Balance, Printed Total
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Invoice Number
      if (!invoiceNo) {
        const invMatch = line.match(/(?:invoice\s*(?:no|#|num)?|inv\s*no|bill\s*(?:no|#)|order\s*no)[:.\s-]*([A-Za-z0-9\/-]+)/i);
        if (invMatch && invMatch[1]) {
          invoiceNo = invMatch[1].trim();
        }
      }

      // Date
      if (!date) {
        // Text format: "11 August 2023" or "11 Aug 2023"
        const textDateMatch = line.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i);
        if (textDateMatch) {
          const d = textDateMatch[1].padStart(2, '0');
          const m = monthMap[textDateMatch[2].slice(0, 3).toLowerCase()] || '01';
          const y = textDateMatch[3];
          date = `${y}-${m}-${d}`;
        } else {
          // Numeric format: "11/08/2023" or "11-08-2023"
          const numDateMatch = line.match(/(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{2,4})/);
          if (numDateMatch) {
            const d = numDateMatch[1].padStart(2, '0');
            const m = numDateMatch[2].padStart(2, '0');
            let y = numDateMatch[3];
            if (y.length === 2) y = `20${y}`;
            date = `${y}-${m}-${d}`;
          }
        }
      }

      // Discount
      if (lower.includes('discount') || lower.includes('less')) {
        const discMatch = line.match(/(?:discount|disc|less(?:\s*discount)?)[:.\s-]*₹?\s*([0-9,]+(?:\.\d+)?)/i);
        if (discMatch) {
          discount = parseFloat(discMatch[1].replace(/,/g, '')) || 0;
        }
      }

      // Received / Paid
      if (lower.includes('received') || lower.includes('paid') || lower.includes('advance')) {
        if (!lower.includes('total') && !lower.includes('recipient')) {
          const recMatch = line.match(/(?:received|cash\s*received|paid|amount\s*received|advance)[:.\s-]*₹?\s*([0-9,]+(?:\.\d+)?)/i);
          if (recMatch) {
            receivedAmount = parseFloat(recMatch[1].replace(/,/g, '')) || 0;
          }
        }
      }

      // Balance Due
      if (lower.includes('due') || lower.includes('balance') || lower.includes('outstanding')) {
        if (!lower.includes('date') && !lower.includes('credit')) {
          const dueMatch = line.match(/(?:due\s*balance|balance\s*due|due\s*amount|balance|due)[:.\s-]*₹?\s*([0-9,]+(?:\.\d+)?)/i);
          if (dueMatch) {
            dueBalance = parseFloat(dueMatch[1].replace(/,/g, '')) || 0;
          }
        }
      }

      // Printed Total
      if (lower.includes('total') || lower.includes('amount payable') || lower.includes('net amount')) {
        if (!lower.includes('qty') && !lower.includes('item') && !lower.includes('sub') && !lower.includes('taxable')) {
          const totalMatch = line.match(/(?:grand\s*total|net\s*total|total\s*amount|printed\s*total|total\s*payable|net\s*amount|total)[:.\s-]*₹?\s*([0-9,]+(?:\.\d+)?)/i);
          if (totalMatch) {
            const val = parseFloat(totalMatch[1].replace(/,/g, ''));
            if (!isNaN(val) && val > 0) {
              printedTotal = val;
            }
          }
        }
      }
    }

    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    // 3. Line Items parsing
    const tableHeaderKeywords = ['item', 'description', 'particular', 'qty', 'rate', 'price', 'amount', 'tax', 'unit', 'hsn'];
    const summaryKeywords = ['total', 'subtotal', 'sub total', 'discount', 'received', 'balance', 'due', 'paid', 'gstin', 'terms', 'signatory'];

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Skip headers, totals, and metadata
      const headerHits = tableHeaderKeywords.filter(k => lower.includes(k)).length;
      if (headerHits >= 2) continue;
      if (summaryKeywords.some(k => lower.startsWith(k) || lower.includes(k + ':') || lower.includes(k + ' :'))) continue;
      if (line === supplierName || lower.includes('invoice no') || lower.includes('date:')) continue;

      // Detect units
      const unitMatch = line.match(/\b(kg|k\.g\.|packet|pkt|piece|pcs|pc|litre|ltr|l|box|bottle|bag|tin|carton)\b/i);
      let unit: UnitType = 'piece';
      if (unitMatch) {
        const u = unitMatch[1].toLowerCase();
        if (u.startsWith('k')) unit = 'kg';
        else if (u.startsWith('l')) unit = 'litre';
        else if (u.includes('pkt') || u.includes('pack')) unit = 'packet';
        else if (u.includes('box')) unit = 'box';
        else if (u.includes('bott')) unit = 'bottle';
        else unit = 'piece';
      }

      // Extract all numbers
      const numMatches = [...line.matchAll(/(?:\b|₹|Rs\.?)\s*([0-9]+(?:\.[0-9]+)?)\b/g)].map(m => parseFloat(m[1]));

      if (numMatches.length >= 2) {
        const firstNumIdx = line.search(/[0-9]/);
        let itemName = firstNumIdx > 0 ? line.slice(0, firstNumIdx).trim() : '';
        itemName = itemName.replace(/^[0-9.\-\s*]+/, '').replace(/[\-:@]+$/, '').trim();

        if (itemName.length >= 2) {
          let qty = 1;
          let rate = 0;
          let taxRate = 0;
          let printedAmount = 0;

          if (numMatches.length === 2) {
            qty = numMatches[0];
            rate = numMatches[1];
            printedAmount = qty * rate;
          } else if (numMatches.length === 3) {
            qty = numMatches[0];
            rate = numMatches[1];
            printedAmount = numMatches[2];
          } else if (numMatches.length >= 4) {
            qty = numMatches[0];
            rate = numMatches[1];
            taxRate = numMatches[2];
            printedAmount = numMatches[3];
          }

          const hasLineDiscrepancy = Math.abs(printedAmount - (qty * rate + taxRate)) > 0.01;

          items.push({
            id: `item-${Date.now()}-${items.length + 1}`,
            name: itemName,
            quantity: qty,
            unit,
            rate,
            taxRate,
            amount: printedAmount,
            printedAmount,
            hasLineDiscrepancy
          });
        }
      }
    }

    // 4. Calculate totals and check discrepancies
    const subtotal = items.reduce((s, it) => s + (it.quantity * it.rate), 0);
    const taxAmount = items.reduce((s, it) => s + it.taxRate, 0);
    const lineAmountsSum = items.reduce((s, it) => s + it.amount, 0);
    
    // If lines have individual printed amounts with tax/discount built in:
    const calculatedTotal = Number((lineAmountsSum - discount).toFixed(2));
    const difference = printedTotal > 0 ? Number((calculatedTotal - printedTotal).toFixed(2)) : 0;

    const warnings: string[] = [];

    // Flag printed total mismatch
    if (printedTotal > 0 && Math.abs(difference) > 0.5) {
      warnings.push(`The total on the bill (₹${printedTotal.toFixed(2)}) doesn't match the calculated amount (₹${calculatedTotal.toFixed(2)}). Difference: ₹${Math.abs(difference).toFixed(2)}.`);
    }

    // Flag item-level discrepancies
    items.forEach(it => {
      const expected = it.quantity * it.rate + it.taxRate;
      if (it.printedAmount && Math.abs(it.printedAmount - expected) > 0.5) {
        warnings.push(`Line item '${it.name}' (${it.quantity} ${it.unit}): Printed amount ₹${it.printedAmount.toFixed(2)} does not match rate × quantity (₹${expected.toFixed(2)}).`);
      }
    });

    if (!supplierName) {
      warnings.push('Supplier name was not detected automatically. Please review and enter.');
    }
    if (items.length === 0) {
      warnings.push('No line items were detected. You can add items manually.');
    }

    const imageUrl = typeof imageSource === 'string'
      ? imageSource
      : imageSource instanceof Blob
        ? URL.createObjectURL(imageSource)
        : undefined;

    return {
      id: `bill-${Date.now()}`,
      imageUrl,
      fileName: fileName || (imageSource instanceof File ? imageSource.name : 'scanned-bill.jpg'),
      fileSize,
      supplierName,
      invoiceNo,
      date,
      items,
      calculatedSubtotal: subtotal,
      taxAmount,
      discount,
      calculatedTotal,
      printedTotal: printedTotal || calculatedTotal,
      receivedAmount,
      dueBalance,
      difference,
      confidence: warnings.length === 0 ? 95 : Math.max(50, 95 - warnings.length * 15),
      status: 'PENDING_REVIEW',
      warnings,
      extractionStatus: items.length > 0 ? (warnings.length === 0 ? 'SUCCESS' : 'PARTIAL') : 'FAILED',
      isSampleDemo: false,
      rawText
    };
  }

  /**
   * Recalculates all arithmetic for an edited bill
   */
  public static recalculateBill(bill: ScannedBill): ScannedBill {
    const subtotal = bill.items.reduce((s, it) => s + (it.quantity * it.rate), 0);
    const taxAmount = bill.items.reduce((s, it) => s + it.taxRate, 0);
    const lineAmountsSum = bill.items.reduce((s, it) => s + it.amount, 0);
    const calculatedTotal = Number((lineAmountsSum - (bill.discount || 0)).toFixed(2));
    const difference = bill.printedTotal > 0 ? Number((calculatedTotal - bill.printedTotal).toFixed(2)) : 0;

    const warnings: string[] = [];
    if (bill.printedTotal > 0 && Math.abs(difference) > 0.5) {
      warnings.push(`The total on the bill (₹${bill.printedTotal.toFixed(2)}) doesn't match the calculated amount (₹${calculatedTotal.toFixed(2)}). Difference: ₹${Math.abs(difference).toFixed(2)}.`);
    }

    bill.items.forEach(it => {
      const expected = it.quantity * it.rate + it.taxRate;
      if (it.printedAmount && Math.abs(it.printedAmount - expected) > 0.5) {
        warnings.push(`Line item '${it.name}': Printed amount ₹${it.printedAmount.toFixed(2)} differs from rate × quantity (₹${expected.toFixed(2)}).`);
      }
    });

    if (!bill.supplierName.trim()) {
      warnings.push('Supplier name is required before saving.');
    }

    return {
      ...bill,
      calculatedSubtotal: subtotal,
      taxAmount,
      calculatedTotal,
      difference,
      warnings
    };
  }

  /**
   * Create an explicit sample bill from presets with isSampleDemo: true
   */
  public static createSampleBill(presetId: string = 'preset-akash-fruits'): ScannedBill {
    const preset = SAMPLE_INVOICE_PRESETS.find(p => p.id === presetId) || SAMPLE_INVOICE_PRESETS[0];
    const items = preset.items.map(it => ({ ...it, id: `item-${Date.now()}-${Math.random().toString().slice(2, 6)}` }));
    
    const subtotal = items.reduce((s, it) => s + (it.quantity * it.rate), 0);
    const taxAmount = items.reduce((s, it) => s + it.taxRate, 0);
    const lineAmountsSum = items.reduce((s, it) => s + it.amount, 0);
    const discount = preset.discount || 0;
    const calculatedTotal = Number((lineAmountsSum - discount).toFixed(2));
    const difference = Number((calculatedTotal - preset.printedTotal).toFixed(2));

    const warnings: string[] = [];
    if (Math.abs(difference) > 0.5) {
      warnings.push(`The total on the bill (₹${preset.printedTotal.toFixed(2)}) doesn't match the calculated amount (₹${calculatedTotal.toFixed(2)}). Difference: ₹${Math.abs(difference).toFixed(2)}.`);
    }

    items.forEach(it => {
      const expected = it.quantity * it.rate + it.taxRate;
      if (it.printedAmount && Math.abs(it.printedAmount - expected) > 0.5) {
        warnings.push(`Line item '${it.name}' (${it.quantity} ${it.unit}): Printed amount ₹${it.printedAmount.toFixed(2)} does not match rate × quantity (₹${expected.toFixed(2)}).`);
      }
    });

    return {
      id: `sample-bill-${Date.now()}`,
      imageUrl: preset.imageUrl,
      fileName: `${preset.supplierName.replace(/\s+/g, '_')}_Sample.svg`,
      fileSize: '48 KB',
      supplierName: preset.supplierName,
      invoiceNo: preset.invoiceNo,
      date: preset.date,
      items,
      calculatedSubtotal: subtotal,
      taxAmount,
      discount,
      calculatedTotal,
      printedTotal: preset.printedTotal,
      receivedAmount: preset.receivedAmount,
      dueBalance: preset.dueBalance,
      difference,
      confidence: 90,
      status: 'PENDING_REVIEW',
      warnings,
      extractionStatus: 'SUCCESS',
      isSampleDemo: true
    };
  }
}
