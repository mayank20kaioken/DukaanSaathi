import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Upload, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react';
import { BillScannerService, SAMPLE_INVOICE_PRESETS } from '../../services/ocrService';
import { ScannedBill, ScannedBillItem, UnitType } from '../../types';
import { formatINR } from '../../utils/formatters';

interface BillScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillScannerModal: React.FC<BillScannerModalProps> = ({ isOpen, onClose }) => {
  const { recordExpense, adjustStock, products, addToast } = useApp();

  // 3-step workflow state: 1 (Upload), 2 (Review), 3 (Confirm)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Selected image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // OCR Execution State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const activeExtractionId = useRef<string>('');

  // Parsed / Editable Bill State
  const [bill, setBill] = useState<ScannedBill | null>(null);

  // Confirm state
  const [updateStockChecked, setUpdateStockChecked] = useState(false); // OFF by default
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraActive(false);
      setIsScanning(false);
      setSaveSuccess(false);
    } else {
      setCurrentStep(1);
      setSelectedImage(null);
      setFileName('');
      setBill(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setBill(null);
    setSaveSuccess(false);

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    
    setFileName(file.name);
    setFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      setCurrentStep(2);
      startOcrScan(file, dataUrl, file.name, sizeFormatted);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      alert("Unable to access camera. Please allow camera permissions or upload an image file.");
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraActive(false);

      setSelectedImage(dataUrl);
      setFileName('camera-capture.jpg');
      setFileSize('Direct Capture');
      setCurrentStep(2);
      startOcrScan(dataUrl, dataUrl, 'camera-capture.jpg', 'Direct Capture');
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const startOcrScan = async (source: File | string, previewUrl: string, name: string, size?: string) => {
    const extractionId = `ext-${Date.now()}`;
    activeExtractionId.current = extractionId;

    setIsScanning(true);
    setScanProgress(15);
    setScanStatus('Reading invoice layout with Tesseract OCR...');

    try {
      const parsed = await BillScannerService.processInvoiceImage(
        source,
        name,
        size,
        (status, prog) => {
          if (activeExtractionId.current === extractionId) {
            setScanStatus(status);
            setScanProgress(prog);
          }
        }
      );

      if (activeExtractionId.current === extractionId) {
        parsed.imageUrl = previewUrl;
        setBill(parsed);
      }
    } catch (err: any) {
      if (activeExtractionId.current === extractionId) {
        console.warn('OCR error in modal:', err);
        setBill({
          id: `bill-${Date.now()}`,
          imageUrl: previewUrl,
          fileName: name,
          fileSize: size,
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
          status: 'PENDING_REVIEW',
          warnings: ['Could not read text automatically. Please enter details manually.'],
          extractionStatus: 'FAILED',
          isSampleDemo: false
        });
      }
    } finally {
      if (activeExtractionId.current === extractionId) {
        setIsScanning(false);
      }
    }
  };

  const handleLoadSample = (presetId: string) => {
    const sample = BillScannerService.createSampleBill(presetId);
    setSelectedImage(sample.imageUrl || null);
    setFileName(sample.fileName || 'Sample_Invoice.svg');
    setFileSize(sample.fileSize || '48 KB');
    setBill(sample);
    setCurrentStep(2);
  };

  const handleClearImage = () => {
    activeExtractionId.current = '';
    setSelectedImage(null);
    setFileName('');
    setFileSize('');
    setBill(null);
    setSaveSuccess(false);
    setCurrentStep(1);
    handleCloseCamera();
  };

  const handleFieldChange = (field: keyof ScannedBill, value: any) => {
    if (!bill) return;
    setBill(BillScannerService.recalculateBill({ ...bill, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ScannedBillItem, value: any) => {
    if (!bill) return;
    const newItems = [...bill.items];
    const current = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'taxRate') {
      const q = field === 'quantity' ? Number(value) : current.quantity;
      const r = field === 'rate' ? Number(value) : current.rate;
      const t = field === 'taxRate' ? Number(value) : current.taxRate;
      current.amount = Number((q * r + (t || 0)).toFixed(2));
      current.printedAmount = current.amount;
      current.hasLineDiscrepancy = false;
    } else if (field === 'amount') {
      current.printedAmount = Number(value);
      const expected = current.quantity * current.rate + (current.taxRate || 0);
      current.hasLineDiscrepancy = Math.abs(current.printedAmount - expected) > 0.5;
    }

    newItems[index] = current;
    setBill(BillScannerService.recalculateBill({ ...bill, items: newItems }));
  };

  const handleAddItem = () => {
    if (!bill) return;
    const newItem: ScannedBillItem = {
      id: `item-${Date.now()}`,
      name: 'New Product Item',
      quantity: 1,
      unit: 'piece' as UnitType,
      rate: 100,
      taxRate: 0,
      amount: 100,
      printedAmount: 100
    };
    setBill(BillScannerService.recalculateBill({ ...bill, items: [...bill.items, newItem] }));
  };

  const handleDeleteItem = (index: number) => {
    if (!bill) return;
    const newItems = bill.items.filter((_, idx) => idx !== index);
    setBill(BillScannerService.recalculateBill({ ...bill, items: newItems }));
  };

  const handleSaveConfirmedExpense = async () => {
    if (!bill) return;
    if (!bill.supplierName.trim()) {
      alert("Please provide a supplier name before recording the expense.");
      return;
    }

    setIsSaving(true);

    try {
      const finalAmount = bill.printedTotal > 0 ? bill.printedTotal : bill.calculatedTotal;
      recordExpense({
        category: 'SUPPLIER_PURCHASE',
        categoryLabel: `Wholesale Purchase (${bill.supplierName})`,
        categoryLabelHi: `थोक सामान खरीद (${bill.supplierName})`,
        amount: finalAmount,
        supplierName: bill.supplierName,
        paymentMethod: 'UPI',
        invoiceNo: bill.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        notes: `Recorded via AI Bill Scanner. ${bill.warnings.length > 0 ? 'Discrepancy noted.' : 'Reconciled.'}`,
        verifiedFromBill: true
      });

      if (updateStockChecked && bill.items.length > 0) {
        bill.items.forEach(item => {
          const matched = products.find(p => 
            p.id === item.matchedProductId || 
            p.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 8))
          );
          if (matched) {
            adjustStock(matched.id, item.quantity, `Stock inward from Bill #${bill.invoiceNo || 'Scanned'}`);
          }
        });
      }

      setSaveSuccess(true);
      addToast('success', 'Invoice Saved', `Expense of ${formatINR(finalAmount)} recorded.`);
    } catch (err: any) {
      console.error('Save expense failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center border border-lime-accent/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">AI Invoice Scanner</h2>
              <p className="text-[11px] text-slate-400">Scan distributor bills, verify totals & inward stock</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Pill Bar */}
        <div className="p-3 bg-navy-950/80 border-b border-slate-800 flex items-center justify-center gap-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setCurrentStep(1)}
            className={`px-3 py-1 rounded-lg ${currentStep === 1 ? 'bg-lime-accent text-navy-950' : 'text-slate-400'}`}
          >
            1. Upload
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => selectedImage && setCurrentStep(2)}
            disabled={!selectedImage}
            className={`px-3 py-1 rounded-lg disabled:opacity-40 ${currentStep === 2 ? 'bg-lime-accent text-navy-950' : 'text-slate-400'}`}
          >
            2. Review
          </button>
          <span className="text-slate-600">→</span>
          <button
            onClick={() => bill && setCurrentStep(3)}
            disabled={!bill}
            className={`px-3 py-1 rounded-lg disabled:opacity-40 ${currentStep === 3 ? 'bg-lime-accent text-navy-950' : 'text-slate-400'}`}
          >
            3. Confirm
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 lg:p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* STEP 1: UPLOAD */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-xl mx-auto py-4">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-8 rounded-3xl border-2 border-dashed text-center transition-all ${
                  isDragOver ? 'border-lime-accent bg-lime-accent/5' : 'border-slate-700 bg-navy-950/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-lime-accent/15 text-lime-accent flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Select Distributor Bill Image</h4>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Drag & drop your invoice photo, or click below
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow cursor-pointer transition-all flex items-center justify-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    <span>Upload Bill</span>
                    <input type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
                  </label>

                  <button
                    onClick={handleStartCamera}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4 text-mint-accent" />
                    <span>Open Camera</span>
                  </button>
                </div>
              </div>

              {cameraActive && (
                <div className="p-4 rounded-2xl bg-black border border-slate-700 space-y-3">
                  <video ref={videoRef} autoPlay playsInline className="w-full aspect-video rounded-xl object-cover" />
                  <div className="flex justify-end gap-2">
                    <button onClick={handleCloseCamera} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                      Cancel
                    </button>
                    <button onClick={handleCapturePhoto} className="px-4 py-1.5 rounded-lg bg-lime-accent text-navy-950 text-xs font-bold">
                      Capture
                    </button>
                  </div>
                </div>
              )}

              {/* Sample testing presets */}
              <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 text-xs flex items-center justify-between gap-3">
                <span className="text-slate-400 font-medium">Try Sample Bill (DEMO):</span>
                <div className="flex items-center gap-2">
                  {SAMPLE_INVOICE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadSample(preset.id)}
                      className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-800 border border-slate-700 text-[11px] font-bold text-slate-200"
                    >
                      {preset.supplierName.split(' ')[0]} ({formatINR(preset.printedTotal)})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW */}
          {currentStep === 2 && bill && (
            <div className="space-y-5">
              
              {isScanning && (
                <div className="p-3 rounded-xl bg-navy-950 border border-mint-accent/50 text-xs flex items-center justify-between text-mint-accent">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-lime-accent" />
                    <span>{scanStatus}</span>
                  </span>
                  <span className="font-mono font-bold text-lime-accent">{scanProgress}%</span>
                </div>
              )}

              {bill.warnings.length > 0 && !isScanning && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Discrepancy / Attention Items:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90">
                    {bill.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Left Preview */}
                <div className="md:col-span-4 rounded-2xl border border-slate-800 bg-navy-950 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <span>Original Document</span>
                    <button onClick={handleClearImage} className="text-rose-400 hover:underline">
                      Replace
                    </button>
                  </div>
                  {selectedImage && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-72 overflow-y-auto">
                      <img src={selectedImage} alt="Bill" className="w-full h-auto object-contain" />
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 font-mono truncate">{fileName}</p>
                </div>

                {/* Right Form */}
                <div className="md:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Supplier Name</label>
                      <input
                        type="text"
                        value={bill.supplierName}
                        onChange={(e) => handleFieldChange('supplierName', e.target.value)}
                        placeholder="Supplier name"
                        className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Invoice No</label>
                      <input
                        type="text"
                        value={bill.invoiceNo}
                        onChange={(e) => handleFieldChange('invoiceNo', e.target.value)}
                        className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Printed Total (₹)</label>
                      <input
                        type="number"
                        value={bill.printedTotal}
                        onChange={(e) => handleFieldChange('printedTotal', parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-lime-accent"
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Line Items ({bill.items.length})</span>
                      <button
                        onClick={handleAddItem}
                        className="px-2 py-0.5 rounded-lg bg-lime-accent/20 text-lime-accent text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-navy-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-navy-900 text-slate-400 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2">Item</th>
                            <th className="p-2 w-14 text-center">Qty</th>
                            <th className="p-2 w-16 text-center">Unit</th>
                            <th className="p-2 w-16 text-right">Rate</th>
                            <th className="p-2 w-20 text-right">Amount</th>
                            <th className="p-2 w-8 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {bill.items.map((item, idx) => (
                            <tr key={item.id}>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                  className="w-full px-1.5 py-1 rounded bg-navy-900 border border-slate-700 text-xs text-white"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-full px-1 py-1 rounded bg-navy-900 border border-slate-700 text-xs text-white text-center font-mono"
                                />
                              </td>
                              <td className="p-1.5">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value as UnitType)}
                                  className="w-full px-1 py-1 rounded bg-navy-900 border border-slate-700 text-xs text-slate-300"
                                >
                                  <option value="kg">kg</option>
                                  <option value="packet">packet</option>
                                  <option value="piece">piece</option>
                                  <option value="litre">litre</option>
                                  <option value="box">box</option>
                                  <option value="bottle">bottle</option>
                                </select>
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-full px-1.5 py-1 rounded bg-navy-900 border border-slate-700 text-xs text-white text-right font-mono"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => handleItemChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-full px-1.5 py-1 rounded bg-navy-900 border border-slate-700 text-xs text-white text-right font-mono font-bold"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <button onClick={() => handleDeleteItem(idx)} className="text-slate-500 hover:text-rose-400">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Calculated Line Items Total:</span>
                      <span className="font-mono font-bold text-white">{formatINR(bill.calculatedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Printed Bill Total:</span>
                      <span className="font-mono font-bold text-lime-accent">{formatINR(bill.printedTotal)}</span>
                    </div>
                    {Math.abs(bill.difference) > 0.5 && (
                      <p className="text-[11px] text-amber-300 pt-1 border-t border-slate-800">
                        Discrepancy: Difference of {formatINR(Math.abs(bill.difference))} detected.
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2 rounded-xl bg-lime-accent text-navy-950 font-extrabold text-xs shadow-lime-glow flex items-center gap-1.5"
                >
                  <span>Proceed to Confirm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {currentStep === 3 && bill && (
            <div className="max-w-lg mx-auto space-y-5 py-2">
              {!saveSuccess ? (
                <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-extrabold text-white text-center">Confirm & Save Expense</h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Supplier:</span>
                      <strong className="text-white">{bill.supplierName}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Invoice Number:</span>
                      <span className="font-mono text-slate-200">#{bill.invoiceNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Date:</span>
                      <span className="text-slate-200">{bill.date}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Items Count:</span>
                      <span className="text-slate-200">{bill.items.length} items</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                      <span className="font-bold text-white">Expense Amount:</span>
                      <span className="font-mono font-black text-lime-accent">
                        {formatINR(bill.printedTotal || bill.calculatedTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Update Stock (OFF by default) */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-900 border border-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={updateStockChecked}
                      onChange={(e) => setUpdateStockChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-lime-accent accent-lime-accent cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white block">Update Stock (Inward)</span>
                      <span className="text-[10px] text-slate-400 block">Increase inventory for matched products</span>
                    </div>
                  </label>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={handleSaveConfirmedExpense}
                      disabled={isSaving}
                      className="px-6 py-2 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-xs shadow-lime-glow disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Save Expense</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-navy-950 border border-emerald-800/60 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Invoice Recorded Successfully!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Recorded expense of {formatINR(bill.printedTotal || bill.calculatedTotal)} under {bill.supplierName}.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleClearImage}
                      className="px-5 py-2 rounded-xl bg-lime-accent text-navy-950 text-xs font-bold shadow-lime-glow"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
