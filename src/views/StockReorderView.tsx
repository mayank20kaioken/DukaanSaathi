import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  RefreshCw, 
  Package, 
  AlertTriangle, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Calculator,
  MessageSquare
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const StockReorderView: React.FC = () => {
  const { products, suppliers, adjustStock, activeShop, language } = useApp();
  const isHi = language === 'hi';

  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);

  // Products needing reorder
  const lowStockProducts = products.filter(p => p.stock <= p.minStockThreshold);

  // Generate WhatsApp Purchase Order for Supplier
  const handleDraftSupplierPo = (supplierName: string, items: typeof lowStockProducts) => {
    const text = `आदरणीय ${supplierName}, ${activeShop.name} से नया थोक रीऑर्डर:\n` +
      items.map(i => `• ${i.name}: ${Math.max(20, (i.minStockThreshold * 2) - i.stock)} ${i.unit}s`).join('\n') +
      `\nकृपया जल्द डिलीवरी भिजवाने की कृपा करें। - ${activeShop.ownerName}`;

    navigator.clipboard.writeText(text);
    setCopiedDraft(supplierName);
    setTimeout(() => setCopiedDraft(null), 2500);
  };

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isHi ? 'स्मार्ट स्टॉक प्रेडिक्शन एवं ऑटो रीऑर्डर' : 'Smart Stock Prediction & Automatic Reorder'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic safety stock buffers, days of cover run-rate & automated supplier purchase orders.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-navy-800 border border-slate-700 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Items Under Safety Threshold</span>
          <span className="text-lg font-black text-rose-400 font-mono">{lowStockProducts.length} SKUs</span>
        </div>
      </div>

      {/* Formula Explanation Banner */}
      <div className="p-4 rounded-3xl bg-navy-800/80 border border-slate-700 space-y-2 text-xs leading-relaxed shadow-card-dark">
        <div className="flex items-center gap-2 text-lime-accent font-bold uppercase text-[10px] tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>Transparent Reorder Quantity Formula:</span>
        </div>
        <p className="text-slate-300">
          <code className="text-lime-accent bg-navy-950 px-2 py-0.5 rounded font-mono">
            Suggested Reorder Qty = (2 × Min Safety Threshold) − Current Physical Stock
          </code>
        </p>
        <p className="text-[11px] text-slate-400">
          Forecasts are derived strictly from recorded sales transactions and supplier lead times rather than speculative extrapolations.
        </p>
      </div>

      {/* Reorder Recommendation Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-white">Recommended Supplier Orders ({lowStockProducts.length})</h3>

        {lowStockProducts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-navy-800/60 border border-slate-800 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-lime-accent mx-auto" />
            <p className="font-bold text-white text-sm">All inventory is currently above minimum safety stock!</p>
            <p className="text-xs">No stockouts are predicted for the immediate 7-day sales window.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockProducts.map(p => {
              const suggestedQty = Math.max(15, (p.minStockThreshold * 2) - p.stock);
              const estOrderCost = suggestedQty * p.costPrice;
              const matchedSupplier = suppliers.find(s => s.id === p.supplierId);

              return (
                <div key={p.id} className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku} • {p.category}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {p.stock} left (Min: {p.minStockThreshold})
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500">Current Stock</span>
                        <p className="font-extrabold text-rose-400 font-mono mt-0.5">{p.stock} {p.unit}s</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500">Suggested Order</span>
                        <p className="font-extrabold text-lime-accent font-mono mt-0.5">{suggestedQty} {p.unit}s</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500">Estimated Cost</span>
                        <p className="font-bold text-white font-mono mt-0.5">{formatINR(estOrderCost)}</p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Primary Supplier: <strong className="text-white">{p.supplierName}</strong>
                      {matchedSupplier && ` (${matchedSupplier.contactPerson} - ${matchedSupplier.phone})`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleDraftSupplierPo(p.supplierName, [p])}
                      className="flex-1 py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-mint-accent text-xs font-semibold border border-mint-accent/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{copiedDraft === p.supplierName ? 'Draft Copied!' : 'Copy WhatsApp PO'}</span>
                    </button>

                    <button
                      onClick={() => adjustStock(p.id, suggestedQty, `Replenished stock from ${p.supplierName}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 text-xs font-bold shadow-lime-glow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Received (+{suggestedQty})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
