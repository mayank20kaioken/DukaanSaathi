import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  X, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { BillScannerService, SAMPLE_INVOICE_PRESETS } from '../../services/ocrService';
import { ScannedBill, ScannedBillItem } from '../../types';
import { formatINR } from '../../utils/formatters';

interface BillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillScannerModal: React.FC<BillScannerModalProps> = ({ isOpen, onClose }) => {
  const { recordExpense, adjustStock, products, addToast, language } = useApp();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets'>('presets');
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_INVOICE_PRESETS[0].imageUrl);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Parsed / Editable Bill State
  const [parsedBill, setParsedBill] = useState<ScannedBill | null>(null);
  const [verifiedByUser, setVerifiedByUser] = useState(false);
  const [updateStockChecked, setUpdateStockChecked] = useState(true);

  // Initialize with the first sample invoice pre-parsed for instant review
  useEffect(() => {
    if (isOpen && !parsedBill) {
      handleLoadPreset(SAMPLE_INVOICE_PRESETS[0]);
    }
  }, [isOpen]);

  // Clean up camera stream on close
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      setActiveTab('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      alert("Unable to access camera. Please ensure permissions are granted or use file upload / presets.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraActive(false);
      runOcr(dataUrl);
    }
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

  const runOcr = async (source: string | File) => {
    setIsScanning(true);
    setScanProgress(15);
    setScanStatus('Loading OCR Engine & analyzing receipt...');

    try {
      const bill = await BillScannerService.processInvoiceImage(source, (status, prog) => {
        setScanStatus(status);
        setScanProgress(prog);
      });
      setParsedBill(bill);
      setVerifiedByUser(false);
      addToast('info', 'OCR Analysis Ready', 'Please review all extracted line items and mathematical checks.');
    } catch (err) {
      addToast('error', 'OCR Processing Failed', 'Could not read text clearly. You can still input details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  // Field edits
  const handleItemChange = (index: number, field: keyof ScannedBillItem, value: any) => {
    if (!parsedBill) return;
    const items = [...parsedBill.items];
    items[index] = { ...items[index], [field]: value };
    // Recalculate item amount
    items[index].amount = Number((items[index].quantity * items[index].rate).toFixed(2));
    
    // Recalculate bill totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = items.reduce((sum, item) => sum + ((item.quantity * item.rate) * (item.taxRate / 100)), 0);
    const calculatedTotal = Number((subtotal + taxAmount).toFixed(2));
    const difference = Number((calculatedTotal - parsedBill.printedTotal).toFixed(2));

    const warnings: string[] = [];
    if (Math.abs(difference) > 1.0) {
      warnings.push(`Mathematical discrepancy detected: Sum of items (${calculatedTotal}) differs from printed invoice total (${parsedBill.printedTotal}) by ${Math.abs(difference)}.`);
    }

    setParsedBill({
      ...parsedBill,
      items,
      calculatedSubtotal: subtotal,
      taxAmount: Number(taxAmount.toFixed(2)),
      calculatedTotal,
      difference,
      warnings
    });
  };

  const handleAddItem = () => {
    if (!parsedBill) return;
    const newItem: ScannedBillItem = {
      id: `bi-${Date.now()}`,
      name: 'New Item (Manual entry)',
      quantity: 1,
      unit: 'packet',
      rate: 100,
      taxRate: 5,
      amount: 100
    };
    const items = [...parsedBill.items, newItem];
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    setParsedBill({
      ...parsedBill,
      items,
      calculatedSubtotal: subtotal,
      calculatedTotal: subtotal
    });
  };

  const handleDeleteItem = (index: number) => {
    if (!parsedBill) return;
    const items = parsedBill.items.filter((_, i) => i !== index);
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    setParsedBill({
      ...parsedBill,
      items,
      calculatedSubtotal: subtotal,
      calculatedTotal: subtotal
    });
  };

  const handleSaveVerifiedBill = () => {
    if (!parsedBill) return;
    if (!verifiedByUser) {
      alert("Please confirm the verification checkbox to verify you have reviewed the numbers.");
      return;
    }

    // 1. Record expense
    recordExpense({
      category: 'SUPPLIER_PURCHASE',
      categoryLabel: `Wholesale Stock Purchase (${parsedBill.supplierName})`,
      categoryLabelHi: `थोक सामान खरीद (${parsedBill.supplierName})`,
      amount: parsedBill.printedTotal || parsedBill.calculatedTotal,
      supplierName: parsedBill.supplierName,
      paymentMethod: 'UPI',
      invoiceNo: parsedBill.invoiceNo,
      notes: `Verified from OCR scanned invoice #${parsedBill.invoiceNo}. Total items: ${parsedBill.items.length}.`,
      verifiedFromBill: true
    });

    // 2. Optionally update inventory stock if user approved
    if (updateStockChecked) {
      parsedBill.items.forEach(item => {
        // match by productId or name
        const match = products.find(p => p.id === item.matchedProductId || p.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 8)));
        if (match) {
          adjustStock(match.id, item.quantity, `Stock inward from Bill #${parsedBill.invoiceNo}`);
        }
      });
      addToast('success', 'Stock Inward Completed', 'Inventory quantities updated for matched products.');
    }

    addToast('success', 'Bill Verified & Saved', `Expense of ${formatINR(parsedBill.printedTotal)} recorded under Supplier Purchases.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-6xl bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mint-accent/20 to-lime-accent/20 border border-mint-accent/40 flex items-center justify-center text-mint-accent shadow-mint-glow">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {isHi ? 'एआई थोक बिल एवं पर्ची स्कैनर' : 'AI Invoice Scanner & Stock Reconciliation'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint-accent/20 text-mint-accent border border-mint-accent/30">
                  OCR Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Extract line items, cross-check mathematical totals, and reconcile inventory stock.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 py-2.5 bg-navy-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'presets' 
                  ? 'bg-navy-700 text-lime-accent border border-lime-accent/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Sample Bills
            </button>
            <label className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'upload' 
                ? 'bg-navy-700 text-lime-accent border border-lime-accent/30' 
                : 'text-slate-400 hover:text-white'
            }`}>
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Invoice</span>
              </span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={startCamera}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'camera' 
                  ? 'bg-navy-700 text-lime-accent border border-lime-accent/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
          </div>

          {/* Preset Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Presets:</span>
            {SAMPLE_INVOICE_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-navy-800 hover:bg-navy-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Sample {idx + 1}: {p.supplierName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT SIDE: Invoice Image Preview & Camera Controls */}
          <div className="lg:col-span-5 bg-navy-950 p-4 border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-lime-accent" />
                  <span>Invoice Image Source</span>
                </span>
                {selectedImage && (
                  <button
                    onClick={() => runOcr(selectedImage)}
                    disabled={isScanning}
                    className="text-[11px] text-mint-accent hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Re-run OCR</span>
                  </button>
                )}
              </div>

              {/* Camera Live Feed if Active */}
              {cameraActive ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-lime-accent bg-black aspect-[4/3] flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-lime-accent/60 pointer-events-none m-4 rounded-xl flex items-center justify-center">
                    <span className="bg-black/60 px-2.5 py-1 rounded text-[11px] text-lime-accent font-mono">
                      Align bill inside box
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={capturePhoto}
                      className="px-5 py-2 rounded-xl bg-lime-accent text-navy-950 font-bold text-xs shadow-lime-glow hover:bg-lime-hover"
                    >
                      📸 Snap & Run OCR
                    </button>
                  </div>
                </div>
              ) : selectedImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-navy-900 group">
                  <img
                    src={selectedImage}
                    alt="Invoice Preview"
                    className="w-full h-auto max-h-[380px] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-lime-accent shadow-lime-glow animate-scan-beam pointer-events-none" />
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-slate-300 font-mono">
                    High Resolution Sample Document
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">No invoice image loaded</p>
                  <p className="text-[11px] text-slate-500 mt-1">Upload a photo, snap using camera, or pick a demo bill preset</p>
                </div>
              )}

              {/* OCR Progress Indicator */}
              {isScanning && (
                <div className="mt-3 p-3 rounded-xl bg-navy-900 border border-slate-800 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{scanStatus}</span>
                    <span className="font-mono text-lime-accent font-bold">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-navy-950 overflow-hidden">
                    <div 
                      className="h-full bg-lime-accent transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Verification Disclaimer */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
              <strong className="block font-semibold mb-0.5">⚠️ OCR Auditing Safeguard:</strong>
              Never treat raw OCR output as authentic verification. Always check the calculated items total against the printed bill before confirming.
            </div>
          </div>

          {/* RIGHT SIDE: Extracted & Editable Fields */}
          <div className="lg:col-span-7 bg-navy-900 p-5 overflow-y-auto flex flex-col justify-between space-y-4">
            {parsedBill ? (
              <div className="space-y-4">
                {/* Meta details (Supplier, Invoice #, Date) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supplier Name</label>
                    <input
                      type="text"
                      value={parsedBill.supplierName}
                      onChange={(e) => setParsedBill({ ...parsedBill, supplierName: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Number</label>
                    <input
                      type="text"
                      value={parsedBill.invoiceNo}
                      onChange={(e) => setParsedBill({ ...parsedBill, invoiceNo: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Date</label>
                    <input
                      type="date"
                      value={parsedBill.date}
                      onChange={(e) => setParsedBill({ ...parsedBill, date: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                    />
                  </div>
                </div>

                {/* Mathematical Check Warning if discrepancy exists */}
                {parsedBill.warnings && parsedBill.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-bold">Discrepancy Flagged by Verification Engine</p>
                      <p className="text-[11px] text-rose-200 mt-0.5">{parsedBill.warnings[0]}</p>
                    </div>
                  </div>
                )}

                {/* Line Items Table */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Extracted Line Items ({parsedBill.items.length})
                    </span>
                    <button
                      onClick={handleAddItem}
                      className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-lime-accent text-xs font-semibold border border-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-navy-950/80">
                    <div className="max-h-52 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-navy-900 text-slate-400 sticky top-0 text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="py-2 px-3">Item Description</th>
                            <th className="py-2 px-2 text-right">Qty</th>
                            <th className="py-2 px-2 text-right">Rate (₹)</th>
                            <th className="py-2 px-2 text-right">Amount (₹)</th>
                            <th className="py-2 px-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {parsedBill.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-navy-900/50">
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                  className="w-full bg-transparent text-white border-b border-transparent hover:border-slate-700 focus:border-lime-accent focus:outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-right">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-14 bg-transparent text-right text-white border-b border-transparent hover:border-slate-700 focus:border-lime-accent focus:outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-right">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-16 bg-transparent text-right text-white border-b border-transparent hover:border-slate-700 focus:border-lime-accent focus:outline-none font-mono"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-right font-bold text-slate-200 font-mono">
                                {formatINR(item.amount)}
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <button
                                  onClick={() => handleDeleteItem(idx)}
                                  className="text-slate-500 hover:text-rose-400 p-1"
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
                </div>

                {/* Mathematical Reconciliation Summary */}
                <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sum of Items</span>
                    <p className="font-bold text-white text-sm font-mono">{formatINR(parsedBill.calculatedSubtotal)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Tax</span>
                    <p className="font-bold text-white text-sm font-mono">{formatINR(parsedBill.taxAmount)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Printed Total</span>
                    <p className="font-extrabold text-lime-accent text-base font-mono">
                      {formatINR(parsedBill.printedTotal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Confidence Score</span>
                    <p className="font-bold text-mint-accent text-sm">
                      {parsedBill.confidence}% Verified
                    </p>
                  </div>
                </div>

                {/* Review & Inventory Checkboxes */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={verifiedByUser}
                      onChange={(e) => setVerifiedByUser(e.target.checked)}
                      className="w-4 h-4 rounded text-lime-accent focus:ring-0 bg-navy-800 border-slate-700"
                    />
                    <span className="font-semibold text-lime-accent">
                      I have physically reviewed and verified these invoice values and line items.
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={updateStockChecked}
                      onChange={(e) => setUpdateStockChecked(e.target.checked)}
                      className="w-4 h-4 rounded text-mint-accent focus:ring-0 bg-navy-800 border-slate-700"
                    />
                    <span>
                      Also update inventory stock for matched products (Stock-Inward transaction)
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm font-semibold">Select or capture an invoice to view extracted fields</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel / रद्द करें
              </button>

              <button
                onClick={handleSaveVerifiedBill}
                disabled={!parsedBill || !verifiedByUser}
                className="px-5 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Record Expense ({formatINR(parsedBill?.printedTotal || 0)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
