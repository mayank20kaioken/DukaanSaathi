import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  ExternalLink, 
  Sparkles, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Building2,
  Info,
  BookmarkCheck,
  Bookmark,
  Key,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  MarketResearchService, 
  MarketResearchQuery, 
  ServerConfigStatus 
} from '../services/marketResearchService';
import { MarketScoutTask, TinyFishListing, ReviewedComparison } from '../types';
import { formatINR } from '../utils/formatters';
import { DemoBadge } from '../components/common/DemoBadge';

export const MarketScoutView: React.FC = () => {
  const { products, language } = useApp();
  const isHi = language === 'hi';

  const defaultProduct = products.find(p => p.id === 'prod-02') || products[0];

  // Query configuration state
  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProduct.id);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>(defaultProduct.name);
  const [brand, setBrand] = useState<string>('Fortune');
  const [packSize, setPackSize] = useState<string>('1 Litre Pouch');
  const [customCostPrice, setCustomCostPrice] = useState<number>(defaultProduct.costPrice);
  const [targetMarket, setTargetMarket] = useState<string>('Delhi NCR Wholesale & B2B Listings');
  const [taskType, setTaskType] = useState<MarketResearchQuery['taskType']>('SUPPLIER_COMPARISON');

  // Execution state
  const [isResearching, setIsResearching] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentTask, setCurrentTask] = useState<MarketScoutTask | null>(MarketResearchService.getHistory()[0] || null);

  // Server proxy status & saved benchmarks
  const [serverConfig, setServerConfig] = useState<ServerConfigStatus | null>(null);
  const [savedBenchmarks, setSavedBenchmarks] = useState<ReviewedComparison[]>([]);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState<string>('');
  const [activeReviewListing, setActiveReviewListing] = useState<TinyFishListing | null>(null);

  // Current active benchmark cost
  const matchedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const effectiveCostPrice = isCustomMode ? customCostPrice : matchedProduct.costPrice;

  // Load config & saved comparisons on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      const config = await MarketResearchService.checkConfig();
      if (isMounted) setServerConfig(config);

      const saved = await MarketResearchService.getSavedComparisons();
      if (isMounted) setSavedBenchmarks(saved);
    }

    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const handleProductSelect = (prodId: string) => {
    if (prodId === 'custom') {
      setIsCustomMode(true);
      setSelectedProductId('custom');
      return;
    }

    setIsCustomMode(false);
    setSelectedProductId(prodId);
    const p = products.find(prod => prod.id === prodId);
    if (p) {
      setProductName(p.name);
      setBrand(p.name.split(' ')[0] || '');
      setPackSize(p.name.includes('10kg') ? '10kg Bag' : p.name.includes('1L') ? '1 Litre Pouch' : 'Standard Pack');
      setCustomCostPrice(p.costPrice);
    }
  };

  const handleRunScout = async () => {
    setIsResearching(true);
    setProgressPercent(10);
    setProgressStatus('Connecting to TinyFish Web Agent Gateway...');
    setActiveReviewListing(null);

    try {
      const task = await MarketResearchService.executeResearchTask(
        {
          productName,
          brand,
          packSize,
          targetMarket,
          ourCostPrice: effectiveCostPrice,
          taskType
        },
        (status, pct) => {
          setProgressStatus(status);
          setProgressPercent(pct);
        }
      );
      setCurrentTask(task);
    } catch (err) {
      console.error('TinyFish execution error:', err);
    } finally {
      setIsResearching(false);
    }
  };

  const handleSaveBenchmark = async (listing: TinyFishListing) => {
    if (!currentTask) return;

    try {
      const diff = listing.listedPrice - currentTask.ourCostPrice;
      const savingsPct = diff < 0 ? Number((((currentTask.ourCostPrice - listing.listedPrice) / currentTask.ourCostPrice) * 100).toFixed(2)) : 0;

      const record = await MarketResearchService.saveComparison({
        taskId: currentTask.id,
        productId: isCustomMode ? undefined : matchedProduct.id,
        productName: `${productName} (${listing.packSize})`,
        savedCostPrice: currentTask.ourCostPrice,
        bestExternalPrice: listing.listedPrice,
        supplierName: listing.supplierName,
        sourceUrl: listing.sourceUrl,
        packSize: listing.packSize,
        potentialSavings: savingsPct,
        notes: reviewNoteInput.trim() || `Reviewed listing from ${listing.platform}. Benchmark recorded for purchase negotiations.`
      });

      setSavedBenchmarks(prev => [record, ...prev.filter(b => b.id !== record.id)]);
      setSavedSuccessId(listing.id);
      setActiveReviewListing(null);
      setReviewNoteInput('');

      setTimeout(() => {
        setSavedSuccessId(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to save benchmark:', err);
    }
  };

  return (
    <div className="p-4 lg:p-7 space-y-7 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mint-accent/20 to-lime-accent/20 text-mint-accent flex items-center justify-center border border-mint-accent/40 shadow-mint-glow">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {isHi ? 'TinyFish मार्केट स्काउट' : 'Market Scout, powered by TinyFish'}
                </h1>

                {/* Live vs Configured status badge */}
                {serverConfig?.isConfigured ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>TinyFish Live Agent Active</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>Offline Verification Mode (Key Required for Live Agent)</span>
                  </span>
                )}

                <DemoBadge label="B2B Research" />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Research publicly accessible supplier listings and benchmark external market prices against your shop records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-navy-800 border border-slate-700 text-xs text-slate-300 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-mint-accent" />
            <span>Secure Server Proxy</span>
          </span>
        </div>
      </div>

      {/* Integration Caveat & Key Transparency Notice */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
        serverConfig?.isConfigured 
          ? 'bg-navy-950 border-emerald-900/60 text-slate-300' 
          : 'bg-navy-950 border-amber-900/40 text-slate-300'
      }`}>
        <div className="flex items-start gap-3">
          {serverConfig?.isConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div>
              <strong className="text-white">Architecture & Live Research Policy:</strong>{' '}
              {serverConfig?.isConfigured ? (
                <span>
                  TinyFish AI Web Agent is connected with server-side credentials ({serverConfig.keyMasked}). 
                  Public wholesale listings are retrieved live via isolated proxy without automated purchasing or submitting client forms.
                </span>
              ) : (
                <span>
                  Running in offline verification mode. Live requests require <code className="px-1.5 py-0.5 rounded bg-navy-900 text-amber-300 font-mono text-[11px]">TINYFISH_API_KEY</code> configured in <code className="font-mono text-slate-200">.env</code>. 
                  Demonstration fixtures are verified baseline wholesale rates from IndiaMART, Udaan, and Metro Wholesale.
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Disclaimer: Public listings reflect unconfirmed wholesale offers and may require minimum order quantity (MOQ) commitments, GST registration, or local transit charges.
            </p>
          </div>
        </div>
      </div>

      {/* Query Configuration Card */}
      <div className="rounded-3xl bg-navy-800/95 border border-slate-700 p-6 shadow-card-dark space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <h3 className="font-extrabold text-sm text-white">1. Configure Market Research Task</h3>
          <span className="text-[10px] text-slate-400 font-mono">Targeting B2B Wholesale Marketplaces</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Benchmark Against Store Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Our Cost: {formatINR(p.costPrice)})
                </option>
              ))}
              <option value="custom">-- Custom Product Search --</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Product Name / Title
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Fortune Refined Sunflower Oil"
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Expected Pack Size
            </label>
            <input
              type="text"
              value={packSize}
              onChange={(e) => setPackSize(e.target.value)}
              placeholder="e.g. 1 Litre Pouch, 10kg Bag"
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
            />
          </div>

          {isCustomMode ? (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Baseline Buying Cost (₹)
              </label>
              <input
                type="number"
                value={customCostPrice}
                onChange={(e) => setCustomCostPrice(Number(e.target.value) || 0)}
                placeholder="100.00"
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              />
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Market Region
              </label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                <option value="Delhi NCR Wholesale & B2B Listings">Delhi NCR Wholesale (Khari Baoli / Naya Bans)</option>
                <option value="All India Verified B2B Portals">All India B2B (Udaan / IndiaMART / Metro)</option>
                <option value="North India Regional Mandis">North India Regional Hubs</option>
              </select>
            </div>
          )}
        </div>

        {/* Target Market and Task Type if in Custom Mode */}
        {isCustomMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Market Region
              </label>
              <select
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                <option value="Delhi NCR Wholesale & B2B Listings">Delhi NCR Wholesale (Khari Baoli / Naya Bans)</option>
                <option value="All India Verified B2B Portals">All India B2B (Udaan / IndiaMART / Metro)</option>
                <option value="North India Regional Mandis">North India Regional Hubs</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Research Objective
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                <option value="SUPPLIER_COMPARISON">Compare Supplier Wholesale Listings</option>
                <option value="LISTED_PRICES">Find Lowest Listed Public Rates</option>
                <option value="PRODUCT_AVAILABILITY">Check Bulk Stock Availability</option>
              </select>
            </div>
          </div>
        )}

        {/* Progress & Launch Bar */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs flex-1 flex-wrap">
            <span className="text-slate-400">Store Baseline Cost:</span>
            <span className="font-extrabold text-white font-mono text-sm">{formatINR(effectiveCostPrice)}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Primary Supplier: <strong className="text-slate-200">{isCustomMode ? 'Custom Benchmark' : matchedProduct.supplierName.split(' ')[0]}</strong>
            </span>
          </div>

          <button
            onClick={handleRunScout}
            disabled={isResearching}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isResearching ? 'animate-spin' : ''}`} />
            <span>{isResearching ? 'TinyFish Agent Scouting Web...' : 'Start TinyFish Market Scout'}</span>
          </button>
        </div>

        {/* Live Multi-stage Agent Progress State */}
        {isResearching && (
          <div className="p-4 rounded-2xl bg-navy-950 border border-mint-accent/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-mint-accent flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{progressStatus}</span>
              </span>
              <span className="font-mono font-bold text-lime-accent">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-navy-900 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-mint-accent to-lime-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scout Results & Price Comparison */}
      {currentTask && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white">
                  2. Market Scout Findings for "{currentTask.productQuery}"
                </h3>
                {currentTask.isLive ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live TinyFish Research
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Baseline Demo Fixtures
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Retrieved: {new Date(currentTask.completedAt || '').toLocaleTimeString()} • Showing external supplier listings vs shop records
              </p>
            </div>

            {/* Savings Badge */}
            {currentTask.potentialSavingPercent !== undefined && currentTask.potentialSavingPercent > 0 && (
              <div className="px-3.5 py-1.5 rounded-2xl bg-lime-accent/15 border border-lime-accent/40 text-lime-accent text-xs font-bold flex items-center gap-1.5 shadow-lime-glow shrink-0">
                <TrendingDown className="w-4 h-4" />
                <span>Potential Saving: {currentTask.potentialSavingPercent}% below current cost!</span>
              </div>
            )}
          </div>

          {/* Status Alert if credentials required or failed */}
          {currentTask.apiMessage && (
            <div className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 ${
              currentTask.isLive
                ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                : 'bg-navy-950 border border-amber-800/40 text-amber-300'
            }`}>
              {currentTask.isLive ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span>{currentTask.apiMessage}</span>
            </div>
          )}

          {/* Active Review / Note modal card if opened */}
          {activeReviewListing && (
            <div className="p-4 rounded-2xl bg-navy-900 border border-lime-accent/50 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-lime-accent" />
                  <span className="text-xs font-bold text-white">
                    Save Reviewed Benchmark: {activeReviewListing.supplierName} ({formatINR(activeReviewListing.listedPrice)})
                  </span>
                </div>
                <button
                  onClick={() => setActiveReviewListing(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="Add notes (e.g. MOQ acceptable, contact vendor on Monday, check sample first)..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveReviewListing(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveBenchmark(activeReviewListing)}
                  className="px-4 py-1.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Confirm & Save Benchmark</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Table */}
          <div className="rounded-3xl border border-slate-700 bg-navy-800/95 overflow-hidden shadow-card-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950 text-slate-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Platform & Supplier</th>
                    <th className="py-3 px-3">Product Title Matched</th>
                    <th className="py-3 px-3 text-center">Pack Size Check</th>
                    <th className="py-3 px-3 text-right">Wholesale Rate</th>
                    <th className="py-3 px-3 text-right">vs Our Cost ({formatINR(currentTask.ourCostPrice)})</th>
                    <th className="py-3 px-3 text-center">MOQ / Delivery</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentTask.results.map(item => {
                    const priceDiff = item.listedPrice - currentTask.ourCostPrice;
                    const isCheaper = priceDiff < 0;
                    const isSaved = savedSuccessId === item.id || savedBenchmarks.some(b => b.supplierName === item.supplierName && b.bestExternalPrice === item.listedPrice);

                    return (
                      <tr key={item.id} className="hover:bg-navy-900/40 transition-colors">
                        {/* Platform / Supplier */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-white text-xs">{item.supplierName}</p>
                            {item.isLive ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                                Live
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700/60 text-slate-400">
                                Fixture
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-mint-accent">{item.platform}</span>
                        </td>

                        {/* Title Match */}
                        <td className="py-3 px-3 max-w-xs">
                          <p className="text-slate-200">{item.productMatch}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.notes}</p>
                        </td>

                        {/* Pack Size Mismatch Flag */}
                        <td className="py-3 px-3 text-center">
                          {item.packSizeMatch ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-accent/15 text-lime-accent inline-block">
                              Exact Match ({item.packSize})
                            </span>
                          ) : (
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Mismatch: {item.packSize}</span>
                              </span>
                              {item.matchWarning && (
                                <p className="text-[9px] text-amber-400/90 leading-tight">
                                  {item.matchWarning}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Listed Price */}
                        <td className="py-3 px-3 text-right font-extrabold text-white text-sm font-mono">
                          {formatINR(item.listedPrice)}
                        </td>

                        {/* Comparison vs Saved Cost Price */}
                        <td className="py-3 px-3 text-right">
                          <span className={`font-mono font-bold ${isCheaper ? 'text-lime-accent' : 'text-rose-400'}`}>
                            {isCheaper ? `-${formatINR(Math.abs(priceDiff))}` : `+${formatINR(priceDiff)}`}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {isCheaper ? 'Cheaper than store cost' : 'Higher than store cost'}
                          </p>
                        </td>

                        {/* MOQ & Delivery */}
                        <td className="py-3 px-3 text-center text-slate-300">
                          <span className="block font-medium">Min: {item.minOrderQty} units</span>
                          <span className="text-[10px] text-slate-400">{item.deliveryDays}d dispatch</span>
                        </td>

                        {/* Actions (Open Source & Save Benchmark) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-700 text-mint-accent inline-flex items-center gap-1 text-[11px] font-semibold border border-slate-700 transition-colors"
                              title="Verify original public listing on supplier site"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => {
                                setActiveReviewListing(item);
                                setReviewNoteInput(`Benchmark candidate: ${item.supplierName} @ ${formatINR(item.listedPrice)}`);
                              }}
                              disabled={isSaved}
                              className={`p-1.5 rounded-lg inline-flex items-center gap-1 text-[11px] font-semibold border transition-colors ${
                                isSaved
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 cursor-default'
                                  : 'bg-navy-900 hover:bg-navy-700 text-slate-300 hover:text-white border-slate-700'
                              }`}
                              title="Save this reviewed listing to shop benchmarks"
                            >
                              {isSaved ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-3 h-3 text-lime-accent" />
                                  <span>Review</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer Disclaimer */}
            <div className="p-3 bg-navy-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Always verify MOQ, GST terms, and delivery charges directly on the supplier portal prior to purchasing.</span>
              <span className="font-mono text-slate-500">TinyFish Agent Engine v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reviewed Comparisons Section */}
      <div className="rounded-3xl bg-navy-800/95 border border-slate-700 p-6 shadow-card-dark space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-lime-accent" />
            <h3 className="font-extrabold text-sm text-white">
              3. Saved Reviewed Benchmarks ({savedBenchmarks.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Persistent Store Comparison Ledger
          </span>
        </div>

        {savedBenchmarks.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No reviewed benchmarks saved yet. Click "Review" on any listing above to record a benchmark for your supplier negotiations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Product & Pack</th>
                  <th className="py-2.5 px-3">Supplier & Source</th>
                  <th className="py-2.5 px-3 text-right">Store Cost</th>
                  <th className="py-2.5 px-3 text-right">Market Benchmark</th>
                  <th className="py-2.5 px-3 text-center">Saving Margin</th>
                  <th className="py-2.5 px-3">Review Notes</th>
                  <th className="py-2.5 px-3 text-center">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {savedBenchmarks.map(item => (
                  <tr key={item.id} className="hover:bg-navy-900/30">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.productName}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-300">{item.supplierName}</span>
                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mint-accent hover:underline inline-flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {formatINR(item.savedCostPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      {formatINR(item.bestExternalPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.potentialSavings > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-accent/15 text-lime-accent">
                          -{item.potentialSavings}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">Par</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate" title={item.notes}>
                      {item.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 text-[10px] font-mono">
                      {new Date(item.reviewedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
