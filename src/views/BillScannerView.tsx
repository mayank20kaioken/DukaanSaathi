import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ScanLine, 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Eye, 
  ArrowRight, 
  ArrowLeft,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { BillScannerService, SAMPLE_INVOICE_PRESETS } from '../services/ocrService';
import { ScannedBill, ScannedBillItem, UnitType } from '../types';
import { formatINR } from '../utils/formatters';

export const BillScannerView: React.FC = () => {
  const { recordExpense, adjustStock, products, addToast, language, theme } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

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

  // Parsed / Editable Bill State (strictly bound to the current image)
  const [bill, setBill] = useState<ScannedBill | null>(null);

  // Review UI state
  const [showImagePreview, setShowImagePreview] = useState(true);

  // Confirm state
  const [updateStockChecked, setUpdateStockChecked] = useState(false); // OFF by default
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle file selection
  const handleFile = (file: File) => {
    // Reset previous invoice state completely
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
      // Auto-advance to Step 2 and run OCR on the actual image
      setCurrentStep(2);
      startOcrScan(file, dataUrl, file.name, sizeFormatted);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Drag and drop handlers
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
    } else {
      addToast('error', 'Invalid File', 'Please upload an image file (PNG, JPG, WebP).');
    }
  };

  // Camera handlers
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
      alert("Unable to access camera. Please allow camera permissions or use file upload.");
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

      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setCameraActive(false);

      setBill(null);
      setSaveSuccess(false);
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

  // Run OCR on the actual image
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

      // Verify request wasn't superseded by another file
      if (activeExtractionId.current === extractionId) {
        parsed.imageUrl = previewUrl;
        setBill(parsed);
        if (parsed.warnings.length > 0) {
          addToast('info', 'OCR Scanned with Notes', 'Please review highlighted fields and line items.');
        } else {
          addToast('success', 'OCR Completed', 'Extracted invoice details successfully.');
        }
      }
    } catch (err: any) {
      if (activeExtractionId.current === extractionId) {
        console.warn('OCR error caught in view:', err);
        // Manual entry fallback preserving image
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
          warnings: ['Could not automatically recognize text. Please type invoice details manually.'],
          extractionStatus: 'FAILED',
          isSampleDemo: false
        });
        addToast('error', 'OCR Processing Incomplete', 'Could not extract all text. You can enter details manually.');
      }
    } finally {
      if (activeExtractionId.current === extractionId) {
        setIsScanning(false);
      }
    }
  };

  // Load an explicit sample bill (clearly marked as DEMO)
  const handleLoadSample = (presetId: string) => {
    setSaveSuccess(false);
    const sample = BillScannerService.createSampleBill(presetId);
    setSelectedImage(sample.imageUrl || null);
    setFileName(sample.fileName || 'Sample_Invoice.svg');
    setFileSize(sample.fileSize || '48 KB');
    setBill(sample);
    setCurrentStep(2);
    addToast('info', 'Sample Bill Loaded', `Loaded ${sample.supplierName} as demo test invoice.`);
  };

  // Clear / Replace image
  const handleClearImage = () => {
    activeExtractionId.current = '';
    setSelectedImage(null);
    setFileName('');
    setFileSize('');
    setBill(null);
    setSaveSuccess(false);
    setCurrentStep(1);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Bill Editing Handlers
  const handleFieldChange = (field: keyof ScannedBill, value: any) => {
    if (!bill) return;
    const updated = BillScannerService.recalculateBill({
      ...bill,
      [field]: value
    });
    setBill(updated);
  };

  const handleItemChange = (index: number, field: keyof ScannedBillItem, value: any) => {
    if (!bill) return;
    const newItems = [...bill.items];
    const current = { ...newItems[index], [field]: value };

    // Auto-calculate amount if quantity, rate, or tax changes
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
    const updated = BillScannerService.recalculateBill({
      ...bill,
      items: newItems
    });
    setBill(updated);
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
    const updated = BillScannerService.recalculateBill({
      ...bill,
      items: [...bill.items, newItem]
    });
    setBill(updated);
  };

  const handleDeleteItem = (index: number) => {
    if (!bill) return;
    const newItems = bill.items.filter((_, idx) => idx !== index);
    const updated = BillScannerService.recalculateBill({
      ...bill,
      items: newItems
    });
    setBill(updated);
  };

  // Final confirmation and saving to AppContext
  const handleSaveConfirmedExpense = async () => {
    if (!bill) return;

    if (!bill.supplierName.trim()) {
      alert("Please provide a supplier name before recording the expense.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Record expense
      const finalAmount = bill.printedTotal > 0 ? bill.printedTotal : bill.calculatedTotal;
      recordExpense({
        category: 'SUPPLIER_PURCHASE',
        categoryLabel: `Wholesale Purchase (${bill.supplierName})`,
        categoryLabelHi: `थोक सामान खरीद (${bill.supplierName})`,
        amount: finalAmount,
        supplierName: bill.supplierName,
        paymentMethod: 'UPI',
        invoiceNo: bill.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        notes: `Recorded via AI Bill Scanner. ${bill.warnings.length > 0 ? 'Discrepancy noted.' : 'Totals reconciled.'}`,
        verifiedFromBill: true
      });

      // 2. Optional Stock Inward (OFF by default)
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
        addToast('success', 'Stock Inward Completed', 'Inventory stock adjusted for matching items.');
      }

      setSaveSuccess(true);
      addToast('success', 'Invoice Saved', `Expense of ${formatINR(finalAmount)} recorded.`);
    } catch (err: any) {
      console.error('Save expense failed:', err);
      addToast('error', 'Save Failed', 'Could not record invoice. Please check values.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-4 lg:p-7 space-y-7 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-mint-accent/20 to-lime-accent/20 text-mint-accent flex items-center justify-center border border-mint-accent/40 shadow-mint-glow">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  {isHi ? 'एआई बिल स्कैनर' : 'AI Invoice Scanner'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-mint-accent/20 text-mint-accent border border-mint-accent/30 font-mono">
                  Kirana Safe OCR
                </span>
                {bill?.isSampleDemo && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    DEMO SAMPLE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan wholesale distributor bills, verify arithmetic totals, and record shop expenses in 3 simple steps.
              </p>
            </div>
          </div>
        </div>

        {selectedImage && currentStep !== 1 && (
          <button
            onClick={handleClearImage}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isDark 
                ? 'bg-navy-800 hover:bg-navy-700 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload Another Bill</span>
          </button>
        )}
      </div>

      {/* 3-Step Workflow Indicator */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 max-w-3xl mx-auto ${
        isDark ? 'bg-navy-950/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Step 1 */}
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${
            currentStep === 1 
              ? 'bg-lime-accent text-navy-950 shadow-lime-glow' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            currentStep === 1 ? 'bg-navy-950 text-lime-accent' : 'bg-slate-800 text-slate-300'
          }`}>1</span>
          <span>Upload Bill</span>
        </button>

        <span className="text-slate-600">→</span>

        {/* Step 2 */}
        <button
          onClick={() => selectedImage && setCurrentStep(2)}
          disabled={!selectedImage}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold disabled:opacity-40 ${
            currentStep === 2 
              ? 'bg-lime-accent text-navy-950 shadow-lime-glow' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            currentStep === 2 ? 'bg-navy-950 text-lime-accent' : 'bg-slate-800 text-slate-300'
          }`}>2</span>
          <span>Review & Edit</span>
        </button>

        <span className="text-slate-600">→</span>

        {/* Step 3 */}
        <button
          onClick={() => bill && setCurrentStep(3)}
          disabled={!bill}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold disabled:opacity-40 ${
            currentStep === 3 
              ? 'bg-lime-accent text-navy-950 shadow-lime-glow' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
            currentStep === 3 ? 'bg-navy-950 text-lime-accent' : 'bg-slate-800 text-slate-300'
          }`}>3</span>
          <span>Confirm & Save</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: UPLOAD                                                            */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          
          {/* Main Drag-and-Drop / Upload Box */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-8 lg:p-12 rounded-3xl border-2 border-dashed text-center transition-all ${
              isDragOver 
                ? 'border-lime-accent bg-lime-accent/5' 
                : isDark 
                  ? 'border-slate-700 bg-navy-800/80 hover:border-slate-600' 
                  : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-lime-accent/15 border border-lime-accent/30 text-lime-accent flex items-center justify-center mx-auto mb-4 shadow-lime-glow">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-navy-950'}`}>
              Upload Your Distributor Bill
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 mb-6">
              Drag and drop your printed invoice photo here, or use the buttons below to select or capture a bill.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Upload Button */}
              <label className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-extrabold text-sm shadow-lime-glow cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Bill (Image)</span>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handleFileInputChange} 
                  className="hidden" 
                />
              </label>

              {/* Camera Button */}
              <button
                onClick={handleStartCamera}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                  isDark 
                    ? 'bg-navy-900 hover:bg-navy-700 text-mint-accent border-mint-accent/40' 
                    : 'bg-slate-100 hover:bg-slate-200 text-navy-900 border-slate-300'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 font-mono">
              Supports PNG, JPG, JPEG, and WebP invoice photos
            </p>
          </div>

          {/* Live Camera View if Active */}
          {cameraActive && (
            <div className={`p-5 rounded-3xl border space-y-4 ${
              isDark ? 'bg-navy-900 border-slate-700' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-2 text-mint-accent">
                  <Camera className="w-4 h-4" />
                  <span>Align Invoice in Frame</span>
                </span>
                <button 
                  onClick={handleCloseCamera}
                  className="text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Close Camera
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black border border-slate-700 aspect-video relative flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCloseCamera}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCapturePhoto}
                  className="px-6 py-2 rounded-xl bg-lime-accent text-navy-950 font-bold text-xs shadow-lime-glow flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Invoice Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* Sample Testing Option */}
          <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'bg-navy-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-lime-accent shrink-0" />
              <div>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Try Sample Bill (DEMO Testing):</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">Test the OCR and arithmetic reconciliation with authentic Indian invoice structures.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SAMPLE_INVOICE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadSample(preset.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                    isDark 
                      ? 'bg-navy-900 hover:bg-navy-800 text-slate-200 border-slate-700' 
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {preset.supplierName.split(' ')[0]} ({formatINR(preset.printedTotal)})
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: REVIEW & EDIT                                                     */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">

          {/* Scanning Progress Banner */}
          {isScanning && (
            <div className="p-4 rounded-2xl bg-navy-950 border border-mint-accent/50 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-mint-accent flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-lime-accent" />
                  <span>{scanStatus}</span>
                </span>
                <span className="font-mono font-bold text-lime-accent">{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-navy-900 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-mint-accent to-lime-accent transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Discrepancy & Verification Notice */}
          {bill && bill.warnings.length > 0 && !isScanning && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Notice: Discrepancy or Missing Fields Detected</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                {bill.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-300/80 pt-1">
                You can correct any amounts or supplier details directly below.
              </p>
            </div>
          )}

          {/* Workspace Layout: Left Document Preview, Right Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Original Bill Document Preview */}
            <div className={`lg:col-span-5 rounded-3xl border p-4 space-y-3 sticky top-4 ${
              isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                  <Eye className="w-4 h-4 text-mint-accent" />
                  <span>Original Invoice Document</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowImagePreview(!showImagePreview)}
                    className="text-slate-400 hover:text-white text-[11px] font-semibold"
                  >
                    {showImagePreview ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={handleClearImage}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Replace
                  </button>
                </div>
              </div>

              {selectedImage && showImagePreview && (
                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black max-h-[520px] overflow-y-auto">
                  <img 
                    src={selectedImage} 
                    alt="Invoice Preview" 
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span className="truncate max-w-[220px]" title={fileName}>{fileName || 'Invoice'}</span>
                <span>{fileSize || ''}</span>
              </div>
            </div>

            {/* Right: Clean, Editable Form & Line Items */}
            <div className={`lg:col-span-7 rounded-3xl border p-5 lg:p-6 space-y-6 ${
              isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  Extracted Bill Details
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {bill?.items.length || 0} line items extracted
                </span>
              </div>

              {bill && (
                <div className="space-y-5">
                  
                  {/* Top Form Fields: Supplier, Inv No, Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Supplier Name *
                      </label>
                      <input
                        type="text"
                        value={bill.supplierName}
                        onChange={(e) => handleFieldChange('supplierName', e.target.value)}
                        placeholder="e.g. Akash Enterprises"
                        className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-lime-accent ${
                          !bill.supplierName.trim() ? 'border-amber-500 bg-amber-500/10 text-white' : isDark ? 'bg-navy-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Invoice / Bill No
                      </label>
                      <input
                        type="text"
                        value={bill.invoiceNo}
                        onChange={(e) => handleFieldChange('invoiceNo', e.target.value)}
                        placeholder="e.g. S01"
                        className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-lime-accent ${
                          isDark ? 'bg-navy-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Invoice Date
                      </label>
                      <input
                        type="date"
                        value={bill.date}
                        onChange={(e) => handleFieldChange('date', e.target.value)}
                        className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-lime-accent ${
                          isDark ? 'bg-navy-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Financial Totals row: Printed Total, Discount, Paid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Printed Bill Total (₹) *
                      </label>
                      <input
                        type="number"
                        value={bill.printedTotal}
                        onChange={(e) => handleFieldChange('printedTotal', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-lime-accent ${
                          isDark ? 'bg-navy-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        value={bill.discount || 0}
                        onChange={(e) => handleFieldChange('discount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-lime-accent ${
                          isDark ? 'bg-navy-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount Paid / Advance (₹)
                      </label>
                      <input
                        type="number"
                        value={bill.receivedAmount ?? ''}
                        onChange={(e) => handleFieldChange('receivedAmount', parseFloat(e.target.value) || 0)}
                        placeholder="Optional"
                        className={`mt-1 w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:border-lime-accent ${
                          isDark ? 'bg-navy-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">Line Items</span>
                      <button
                        onClick={handleAddItem}
                        className="px-2.5 py-1 rounded-xl bg-lime-accent/20 hover:bg-lime-accent/30 text-lime-accent text-xs font-bold border border-lime-accent/30 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    {bill.items.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-700 text-center text-xs text-slate-400">
                        No line items entered. Click "+ Add Item" to add products from this invoice.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-navy-950/70">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-navy-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3">Item Description</th>
                              <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                              <th className="py-2.5 px-2 w-24 text-center">Unit</th>
                              <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                              <th className="py-2.5 px-2 w-20 text-right">Tax (₹)</th>
                              <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                              <th className="py-2.5 px-2 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {bill.items.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-navy-900/50">
                                {/* Item Name */}
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                    className="w-full px-2 py-1 rounded-lg bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                                  />
                                </td>

                                {/* Quantity */}
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 rounded-lg bg-navy-900 border border-slate-700 text-xs text-white text-center font-mono focus:outline-none focus:border-lime-accent"
                                  />
                                </td>

                                {/* Unit */}
                                <td className="py-2 px-2">
                                  <select
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value as UnitType)}
                                    className="w-full px-2 py-1 rounded-lg bg-navy-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-lime-accent"
                                  >
                                    <option value="kg">kg</option>
                                    <option value="packet">packet</option>
                                    <option value="piece">piece</option>
                                    <option value="litre">litre</option>
                                    <option value="box">box</option>
                                    <option value="bottle">bottle</option>
                                  </select>
                                </td>

                                {/* Rate */}
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={item.rate}
                                    onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 rounded-lg bg-navy-900 border border-slate-700 text-xs text-white text-right font-mono focus:outline-none focus:border-lime-accent"
                                  />
                                </td>

                                {/* Tax */}
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    value={item.taxRate}
                                    onChange={(e) => handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 rounded-lg bg-navy-900 border border-slate-700 text-xs text-slate-400 text-right font-mono focus:outline-none focus:border-lime-accent"
                                  />
                                </td>

                                {/* Amount */}
                                <td className="py-2 px-3 text-right">
                                  <input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => handleItemChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                                    className={`w-full px-2 py-1 rounded-lg border text-xs font-mono font-bold text-right focus:outline-none focus:border-lime-accent ${
                                      item.hasLineDiscrepancy 
                                        ? 'bg-amber-500/10 border-amber-500 text-amber-300' 
                                        : 'bg-navy-900 border-slate-700 text-white'
                                    }`}
                                    title={item.hasLineDiscrepancy ? 'Printed amount differs from qty × rate' : undefined}
                                  />
                                </td>

                                {/* Delete */}
                                <td className="py-2 px-2 text-center">
                                  <button
                                    onClick={() => handleDeleteItem(idx)}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                    title="Delete line"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Calculations & Discrepancy Reconciliation Summary */}
                  <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Sum of Line Items:</span>
                      <span className="font-mono font-bold text-white">
                        {formatINR(bill.items.reduce((s, it) => s + it.amount, 0))}
                      </span>
                    </div>

                    {bill.discount > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-rose-400">Discount:</span>
                        <span className="font-mono font-bold text-rose-400">
                          -{formatINR(bill.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-slate-300 font-bold">Calculated Invoice Total:</span>
                      <span className="font-mono font-black text-white text-sm">
                        {formatINR(bill.calculatedTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Printed Total on Invoice:</span>
                      <span className="font-mono font-black text-lime-accent text-sm">
                        {formatINR(bill.printedTotal)}
                      </span>
                    </div>

                    {/* Discrepancy Pill */}
                    {Math.abs(bill.difference) > 0.5 ? (
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          The total on the bill ({formatINR(bill.printedTotal)}) doesn't match the calculated amount ({formatINR(bill.calculatedTotal)}). Difference: {formatINR(Math.abs(bill.difference))}.
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Calculated line items agree with the printed bill total.</span>
                      </div>
                    )}
                  </div>

                  {/* Step Navigation Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Upload</span>
                    </button>

                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-extrabold text-xs shadow-lime-glow flex items-center gap-2 transition-all active:scale-95"
                    >
                      <span>Proceed to Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CONFIRM & SAVE                                                    */}
      {/* ========================================================================= */}
      {currentStep === 3 && bill && (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {!saveSuccess ? (
            <div className={`p-6 lg:p-8 rounded-3xl border space-y-6 ${
              isDark ? 'bg-navy-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}>
              
              <div className="text-center space-y-1">
                <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  Confirm Wholesale Invoice Entry
                </h3>
                <p className="text-xs text-slate-400">
                  Review the final values before recording this transaction to your shop's expense ledger.
                </p>
              </div>

              {/* Invoice Summary Card */}
              <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
                
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{bill.supplierName || 'Unknown Supplier'}</h4>
                    <p className="text-xs text-slate-400 font-mono">Invoice #{bill.invoiceNo || 'N/A'} • {bill.date}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-navy-800 text-xs font-bold text-mint-accent border border-slate-700">
                    {bill.items.length} Line Items
                  </span>
                </div>

                {/* Arithmetic breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Line Items Subtotal:</span>
                    <span className="font-mono text-slate-200">
                      {formatINR(bill.items.reduce((s, it) => s + it.amount, 0))}
                    </span>
                  </div>

                  {bill.discount > 0 && (
                    <div className="flex items-center justify-between text-rose-400">
                      <span>Discount:</span>
                      <span className="font-mono font-bold">-{formatINR(bill.discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="font-bold text-slate-200">Final Recorded Amount:</span>
                    <span className="font-mono font-black text-xl text-lime-accent">
                      {formatINR(bill.printedTotal > 0 ? bill.printedTotal : bill.calculatedTotal)}
                    </span>
                  </div>

                  {(bill.receivedAmount !== undefined || bill.dueBalance !== undefined) && (
                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800/80 font-mono">
                      <span>Paid: {formatINR(bill.receivedAmount || 0)}</span>
                      <span>Balance Due: {formatINR(bill.dueBalance || 0)}</span>
                    </div>
                  )}
                </div>

                {/* Discrepancy Note */}
                {Math.abs(bill.difference) > 0.5 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Discrepancy Note:</strong> Sum of line items ({formatINR(bill.calculatedTotal)}) differs from the printed total ({formatINR(bill.printedTotal)}) by {formatINR(Math.abs(bill.difference))}. The printed amount of {formatINR(bill.printedTotal)} will be saved to your expense records.
                    </div>
                  </div>
                )}
              </div>

              {/* Update Stock Checkbox (OFF BY DEFAULT) */}
              <div className="p-4 rounded-2xl bg-navy-950/60 border border-slate-800 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={updateStockChecked}
                    onChange={(e) => setUpdateStockChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-lime-accent focus:ring-lime-accent accent-lime-accent cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Update Inventory Quantities (Stock Inward)
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Increase store stock for products in your catalogue that match the items in this bill.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Line Items</span>
                </button>

                <button
                  onClick={handleSaveConfirmedExpense}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-2xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-sm shadow-lime-glow disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording Expense...</span>
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
            /* Save Success View */
            <div className={`p-8 rounded-3xl border text-center space-y-5 animate-in fade-in ${
              isDark ? 'bg-navy-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">Invoice Recorded Successfully!</h3>
                <p className="text-xs text-slate-400">
                  Recorded expense of <strong className="text-white">{formatINR(bill.printedTotal || bill.calculatedTotal)}</strong> under Wholesale Purchases ({bill.supplierName}).
                </p>
                {updateStockChecked && (
                  <p className="text-xs text-mint-accent">
                    Inventory stock was successfully inwarded for matching catalogue items.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={handleClearImage}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow transition-all"
                >
                  Scan Another Bill
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
