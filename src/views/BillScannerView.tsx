import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ScanLine, 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Info,
  ShieldCheck,
  Calculator,
  ArrowRight,
  PackageCheck,
  Receipt
} from 'lucide-react';
import { BillScannerService, SAMPLE_INVOICE_PRESETS } from '../services/ocrService';
import { ScannedBill, ScannedBillItem } from '../types';
import { formatINR } from '../utils/formatters';

export const BillScannerView: React.FC = () => {
  const { recordExpense, adjustStock, products, addToast, language, theme } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_INVOICE_PRESETS[0].imageUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  
  const [parsedBill, setParsedBill] = useState<ScannedBill>(() => {
    const preset = SAMPLE_INVOICE_PRESETS[0];
    const b = BillScannerService.createMockParsedBill(
      preset.supplierName,
      preset.invoiceNo,
      preset.items,
      preset.printedTotal
    );
    b.imageUrl = preset.imageUrl;
    b.date = preset.date;
    return b;
  });

  const [verifiedByUser, setVerifiedByUser] = useState(false);
  const [updateStockChecked, setUpdateStockChecked] = useState(true);

  const handleLoadPreset = (preset: typeof SAMPLE_INVOICE_PRESETS[0]) => {
    setSelectedImage(preset.imageUrl);
    const mock = BillScannerService.createMockParsedBill(
      preset.supplierName,
      preset.invoiceNo,
      preset.items,
      preset.printedTotal
    );
    mock.imageUrl = preset.imageUrl;
    mock.date = preset.date;
    setParsedBill(mock);
    setVerifiedByUser(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSelectedImage(url);
        runOcr(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const runOcr = async (source: string | File) => {
    setIsScanning(true);
    setScanProgress(20);
    setScanStatus('Running OCR text extraction...');

    try {
      const bill = await BillScannerService.processInvoiceImage(source, (status, prog) => {
        setScanStatus(status);
        setScanProgress(prog);
      });
      setParsedBill(bill);
      setVerifiedByUser(false);
      addToast('info', 'OCR Analysis Ready', 'Review extracted items and cross-check totals.');
    } catch {
      addToast('error', 'OCR Error', 'Could not read receipt clearly. You can edit line items manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleItemChange = (index: number, field: keyof ScannedBillItem, value: any) => {
    const items = [...parsedBill.items];
    items[index] = { ...items[index], [field]: value };
    items[index].amount = Number((items[index].quantity * items[index].rate).toFixed(2));
    
    const subtotal = items.reduce((s, i) => s + (i.quantity * i.rate), 0);
    const tax = items.reduce((s, i) => s + ((i.quantity * i.rate) * (i.taxRate / 100)), 0);
    const calculatedTotal = Number((subtotal + tax).toFixed(2));
    const difference = Number((calculatedTotal - parsedBill.printedTotal).toFixed(2));

    const warnings: string[] = [];
    if (Math.abs(difference) > 1.0) {
      warnings.push(`Mathematical discrepancy detected: Sum of line items (${calculatedTotal}) differs from printed total (${parsedBill.printedTotal}) by ${Math.abs(difference)}.`);
    }

    setParsedBill({
      ...parsedBill,
      items,
      calculatedSubtotal: subtotal,
      taxAmount: Number(tax.toFixed(2)),
      calculatedTotal,
      difference,
      warnings
    });
  };

  const handleAddItem = () => {
    const newItem: ScannedBillItem = {
      id: `item-${Date.now()}`,
      name: 'New Product Item',
      quantity: 1,
      unit: 'piece',
      rate: 100,
      taxRate: 5,
      amount: 100
    };
    const items = [...parsedBill.items, newItem];
    const subtotal = items.reduce((s, i) => s + (i.quantity * i.rate), 0);
    const tax = items.reduce((s, i) => s + ((i.quantity * i.rate) * (i.taxRate / 100)), 0);
    const calculatedTotal = Number((subtotal + tax).toFixed(2));
    
    setParsedBill({
      ...parsedBill,
      items,
      calculatedSubtotal: subtotal,
      taxAmount: Number(tax.toFixed(2)),
      calculatedTotal,
      difference: Number((calculatedTotal - parsedBill.printedTotal).toFixed(2))
    });
  };

  const handleDeleteItem = (index: number) => {
    if (parsedBill.items.length <= 1) return;
    const items = parsedBill.items.filter((_, idx) => idx !== index);
    const subtotal = items.reduce((s, i) => s + (i.quantity * i.rate), 0);
    const tax = items.reduce((s, i) => s + ((i.quantity * i.rate) * (i.taxRate / 100)), 0);
    const calculatedTotal = Number((subtotal + tax).toFixed(2));

    setParsedBill({
      ...parsedBill,
      items,
      calculatedSubtotal: subtotal,
      taxAmount: Number(tax.toFixed(2)),
      calculatedTotal,
      difference: Number((calculatedTotal - parsedBill.printedTotal).toFixed(2))
    });
  };

  const handleSaveVerifiedBill = () => {
    if (!verifiedByUser) {
      alert("Please confirm the verification checkbox before saving.");
      return;
    }

    recordExpense({
      category: 'SUPPLIER_PURCHASE',
      categoryLabel: `Wholesale Purchase (${parsedBill.supplierName})`,
      categoryLabelHi: `थोक सामान खरीद (${parsedBill.supplierName})`,
      amount: parsedBill.printedTotal || parsedBill.calculatedTotal,
      supplierName: parsedBill.supplierName,
      paymentMethod: 'UPI',
      invoiceNo: parsedBill.invoiceNo,
      notes: `Verified from OCR scanned invoice #${parsedBill.invoiceNo}.`,
      verifiedFromBill: true
    });

    if (updateStockChecked) {
      parsedBill.items.forEach(item => {
        const match = products.find(p => p.id === item.matchedProductId || p.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 8)));
        if (match) {
          adjustStock(match.id, item.quantity, `Stock inward from Bill #${parsedBill.invoiceNo}`);
        }
      });
      addToast('success', 'Stock Inward Completed', 'Inventory updated for matched products.');
    }

    addToast('success', 'Bill Recorded', `Expense of ${formatINR(parsedBill.printedTotal)} saved.`);
  };

  const isDiscrepant = Math.abs(parsedBill.difference) > 1.0;

  return (
    <div className={`p-4 lg:p-7 space-y-6 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b ${
        isDark ? 'border-navy-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mint-accent/20 to-lime-accent/20 text-mint-accent flex items-center justify-center border border-mint-accent/40 shadow-mint-glow">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  {isHi ? 'एआई थोक बिल स्कैनर — सत्यापन वर्कस्पेस' : 'AI Invoice Scanner — Audit & Inward'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint-accent/20 text-mint-accent border border-mint-accent/30">
                  Tesseract OCR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan wholesale distributor bills, verify arithmetic totals, flag discrepancies and inward stock in 1 click.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Selector & Upload Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {SAMPLE_INVOICE_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  parsedBill.invoiceNo === p.invoiceNo
                    ? 'bg-lime-accent text-navy-950 font-bold border-lime-accent shadow-xs'
                    : isDark 
                      ? 'bg-navy-800 hover:bg-navy-700 text-slate-300 border-slate-700' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                }`}
              >
                Demo {idx + 1}: {p.supplierName.split(' ')[0]}
              </button>
            ))}
          </div>

          <label className="px-3.5 py-2 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-extrabold text-xs cursor-pointer shadow-lime-glow flex items-center gap-1.5 transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Upload Invoice Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Split-Screen Invoice Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl border overflow-hidden shadow-surface-dark ${
        isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Left Side: Invoice Preview with Laser Beam Animation */}
        <div className={`lg:col-span-5 p-5 border-r flex flex-col justify-between space-y-4 ${
          isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Eye className="w-4 h-4 text-lime-accent" />
                <span>Invoice Paper Document</span>
              </span>
              <button
                onClick={() => selectedImage && runOcr(selectedImage)}
                disabled={isScanning}
                className="text-mint-accent hover:underline text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>Re-run OCR Analysis</span>
              </button>
            </div>

            {/* Document Frame with Scanning Laser */}
            {selectedImage && (
              <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-black relative group shadow-md">
                <img
                  src={selectedImage}
                  alt="Scanned Bill"
                  className="w-full h-auto max-h-[440px] object-cover transition-opacity group-hover:opacity-90"
                />

                {/* Animated Laser Scanning Line */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-lime-accent shadow-lime-glow animate-scan-beam pointer-events-none" />
                )}

                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md text-[10px] text-lime-accent font-mono border border-lime-accent/30">
                  {parsedBill.supplierName} • #{parsedBill.invoiceNo}
                </div>
              </div>
            )}

            {/* OCR Progress State Bar */}
            {isScanning && (
              <div className="p-3.5 rounded-2xl bg-navy-900 border border-slate-800 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{scanStatus}</span>
                  <span className="font-mono text-lime-accent font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-navy-950 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-mint-accent to-lime-accent transition-all duration-300" 
                    style={{ width: `${scanProgress}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            <strong className="block font-bold mb-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auditing Safety Protocol:</span>
            </strong>
            Always cross-check printed line totals against your physical wholesale delivery receipt before saving.
          </div>
        </div>

        {/* Right Side: Extracted Editable Table & Reconciliation */}
        <div className="lg:col-span-7 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Wholesale Supplier
                </label>
                <input
                  type="text"
                  value={parsedBill.supplierName}
                  onChange={(e) => setParsedBill({ ...parsedBill, supplierName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none ${
                    isDark 
                      ? 'bg-navy-950 border-slate-700 text-white focus:border-lime-accent' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Invoice No.
                </label>
                <input
                  type="text"
                  value={parsedBill.invoiceNo}
                  onChange={(e) => setParsedBill({ ...parsedBill, invoiceNo: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border focus:outline-none ${
                    isDark 
                      ? 'bg-navy-950 border-slate-700 text-white focus:border-lime-accent' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={parsedBill.date}
                  onChange={(e) => setParsedBill({ ...parsedBill, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark 
                      ? 'bg-navy-950 border-slate-700 text-white focus:border-lime-accent' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Warning Alert if Discrepancy Exists */}
            {isDiscrepant && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-200">Mathematical Discrepancy Flagged</h4>
                  <p className="mt-0.5 leading-snug">
                    Calculated line items total ({formatINR(parsedBill.calculatedTotal)}) differs from printed total on bill ({formatINR(parsedBill.printedTotal)}) by <strong>{formatINR(Math.abs(parsedBill.difference))}</strong>. Please check individual item quantities or tax rates.
                  </p>
                </div>
              </div>
            )}

            {/* Editable Line Items Table */}
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between p-3 border-b border-slate-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-lime-accent" />
                  <span>Extracted Line Items ({parsedBill.items.length})</span>
                </span>
                <button
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-lime-accent/15 hover:bg-lime-accent/25 text-lime-accent text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Row</span>
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`text-[10px] uppercase sticky top-0 ${
                    isDark ? 'bg-navy-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2 text-right">Qty</th>
                      <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {parsedBill.items.map((item, idx) => (
                      <tr key={item.id} className={isDark ? 'hover:bg-navy-900/50' : 'hover:bg-slate-100/70'}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            className={`w-full bg-transparent font-medium border-b border-transparent focus:border-lime-accent focus:outline-none ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className={`w-14 bg-transparent text-right font-mono font-bold focus:outline-none border-b border-transparent focus:border-lime-accent ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                            className={`w-16 bg-transparent text-right font-mono font-bold focus:outline-none border-b border-transparent focus:border-lime-accent ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-black text-lime-accent font-mono">
                          {formatINR(item.amount)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mathematical Reconciliation Summary */}
            <div className={`p-4 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
              isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Sum of Items</span>
                <p className={`font-bold text-sm font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatINR(parsedBill.calculatedSubtotal)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Calculated Tax / GST</span>
                <p className={`font-bold text-sm font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatINR(parsedBill.taxAmount)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Printed Invoice Total</span>
                <p className="font-black text-lime-accent text-base font-mono mt-0.5">
                  {formatINR(parsedBill.printedTotal)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Audit Status</span>
                <p className={`font-bold text-xs mt-1 ${isDiscrepant ? 'text-rose-400' : 'text-mint-accent'}`}>
                  {isDiscrepant ? `Diff: ${formatINR(parsedBill.difference)}` : 'Exact Match (100%)'}
                </p>
              </div>
            </div>

            {/* Checkboxes & Protocol */}
            <div className="space-y-2.5 pt-1 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedByUser}
                  onChange={(e) => setVerifiedByUser(e.target.checked)}
                  className="w-4 h-4 rounded text-lime-accent bg-navy-900 border-slate-700 mt-0.5 cursor-pointer"
                />
                <span className={`font-semibold ${isDark ? 'text-lime-accent' : 'text-emerald-800'}`}>
                  I have physically verified these invoice numbers and line items against the physical paper bill.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateStockChecked}
                  onChange={(e) => setUpdateStockChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-mint-accent bg-navy-900 border-slate-700 mt-0.5 cursor-pointer"
                />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  Also update inventory stock levels automatically for matched products (Stock-Inward).
                </span>
              </label>
            </div>
          </div>

          {/* Confirm & Save Button */}
          <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className="text-xs text-slate-400">
              Approved invoice total: <strong className="text-lime-accent font-mono text-sm">{formatINR(parsedBill.printedTotal)}</strong>
            </span>

            <button
              onClick={handleSaveVerifiedBill}
              disabled={!verifiedByUser}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-xs shadow-lime-glow disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Record Wholesale Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
