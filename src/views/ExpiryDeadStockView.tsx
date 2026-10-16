import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertOctagon, 
  Clock, 
  Layers, 
  TrendingDown, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const ExpiryDeadStockView: React.FC = () => {
  const { products, updateProduct, openModal, language } = useApp();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'expiry' | 'deadstock'>('expiry');

  // Expiring items
  const expiringItems = products
    .filter(p => p.expiryDate)
    .map(p => {
      const diff = Math.ceil((new Date(p.expiryDate!).getTime() - new Date('2026-10-15').getTime()) / (1000 * 3600 * 24));
      return { ...p, daysToExpiry: diff };
    })
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  // Dead stock items (slow moving or no sales recorded)
  const deadStockItems = products.filter(p => p.demandLevel === 'Slow-Moving' || p.stockMovements.length === 0);
  const totalDeadStockCapital = deadStockItems.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  const handleApplyDiscount = (productId: string, discountPercent: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newPrice = Math.round(prod.sellingPrice * (1 - discountPercent / 100));
    updateProduct(productId, { sellingPrice: newPrice });
  };

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isHi ? 'एक्सपायरी अलर्ट एवं डेड-स्टॉक डिटेक्टर' : 'Expiry Date Alerts & Dead-Stock Detector'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prevent unsellable wastage and liquidate frozen working capital through strategic markdown campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-navy-800 border border-slate-700 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Frozen Capital in Slow Stock</span>
            <span className="text-lg font-black text-amber-300 font-mono">{formatINR(totalDeadStockCapital)}</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('expiry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expiry'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-navy-800 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Upcoming Expiries ({expiringItems.filter(i => i.daysToExpiry <= 45).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deadstock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'deadstock'
              ? 'bg-amber-400 text-navy-950 shadow-md'
              : 'bg-navy-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dead-Stock Liquidator ({deadStockItems.length})</span>
        </button>
      </div>

      {/* Main View Area */}
      {activeTab === 'expiry' ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-navy-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Highlighted products are nearing manufacturer expiry dates. Prioritize counter liquidation or supplier exchange.
            </span>
            <span className="text-rose-400 font-bold font-mono">Reference Date: 15 Oct 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringItems.map(item => {
              const isUrgent = item.daysToExpiry <= 15;
              const isWarning = item.daysToExpiry <= 45;

              return (
                <div key={item.id} className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">Location: {item.shelfLocation || 'Aisle 1'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' :
                        isWarning ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.daysToExpiry <= 0 ? 'EXPIRED' : `${item.daysToExpiry} days left`}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-sans">Expiry Date</span>
                        <span className="font-bold text-white">{item.expiryDate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase block font-sans">Remaining Units</span>
                        <span className="font-bold text-amber-400">{item.stock} {item.unit}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleApplyDiscount(item.id, 15)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-rose-300 text-xs font-semibold border border-rose-500/30 text-center"
                    >
                      Apply 15% Clearance
                    </button>
                    <button
                      onClick={() => openModal('RECORD_SALE')}
                      className="px-3 py-1.5 rounded-xl bg-lime-accent text-navy-950 text-xs font-bold"
                    >
                      Quick Bill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-navy-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Dead stock refers to inventory with zero recorded sales in the last 45+ days. Liquidate to unlock working capital.
            </span>
            <span className="text-amber-400 font-bold font-mono">Tied Up: {formatINR(totalDeadStockCapital)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deadStockItems.map(item => {
              const tiedValue = item.stock * item.costPrice;

              return (
                <div key={item.id} className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <p className="text-[11px] text-slate-400">Category: {item.category}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300">
                        Slow Mover
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-sans">Stock Sitting</span>
                        <span className="font-bold text-white">{item.stock} {item.unit}s</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase block font-sans">Tied-Up Capital</span>
                        <span className="font-bold text-amber-400">{formatINR(tiedValue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleApplyDiscount(item.id, 20)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 text-navy-950 text-xs font-bold hover:bg-amber-300"
                    >
                      Offer 20% Clearance Sale
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
