import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Filter, 
  Edit3, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { formatINR, calculateProductMargins } from '../utils/formatters';
import { AddProductModal } from '../components/modals/AddProductModal';

export const InventoryView: React.FC = () => {
  const { products, updateProduct, adjustStock, suppliers, openModal, language, theme } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);

  // Stock Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Restocking from wholesale delivery');

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock Movement History Modal State
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  // Categories
  const categories = ['ALL', 'Groceries', 'Snacks & Beverages', 'Dairy & Bakery', 'Personal Care', 'Home Care', 'Spices & Staples'];

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.nameHi && p.nameHi.includes(searchQuery)) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesLowStock = !filterLowStockOnly || p.stock <= p.minStockThreshold;
    return matchesQuery && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStockThreshold).length;
  const totalValuation = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  const handleApplyStockAdjustment = () => {
    if (!adjustingProduct) return;
    adjustStock(adjustingProduct.id, stockDelta, adjustmentReason);
    setAdjustingProduct(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className={`p-4 lg:p-7 space-y-6 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b ${
        isDark ? 'border-navy-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lime-accent/20 text-lime-accent flex items-center justify-center border border-lime-accent/40 shadow-lime-glow">
              <Package className="w-5 h-5" />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {isHi ? 'उत्पाद कैटलॉग एवं स्टॉक प्रबंधन' : 'Inventory & Product Catalogue'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track buying cost, selling prices, margins, minimum safety thresholds & stock movements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border text-right ${
            isDark ? 'bg-navy-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Inventory Valuation</span>
            <span className="text-xl font-black text-lime-accent font-mono">{formatINR(totalValuation)}</span>
          </div>

          <button
            onClick={() => setAddProductModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-xs shadow-lime-glow flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ {isHi ? 'नया उत्पाद जोड़ें' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-surface-dark ${
        isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? "खोजें: मैगी, तेल, आटा, SKU..." : "Search product name, SKU..."}
            className={`w-full pl-10 pr-3 py-2 rounded-xl text-xs border focus:outline-none transition-colors ${
              isDark 
                ? 'bg-navy-950 border-slate-700 text-white placeholder-slate-400 focus:border-lime-accent' 
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-lime-accent text-navy-950 shadow-sm font-bold'
                  : isDark
                    ? 'bg-navy-950 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Low Stock Filter Button */}
        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            filterLowStockOnly
              ? 'bg-rose-500 text-white shadow-md'
              : isDark
                ? 'bg-navy-950 text-rose-300 border border-rose-500/40 hover:bg-rose-500/20'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Only ({lowStockCount})</span>
        </button>
      </div>

      {/* Product Grid Table */}
      <div className={`rounded-3xl border overflow-hidden shadow-surface-dark ${
        isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[10px] uppercase tracking-wider sticky top-0 ${
              isDark ? 'bg-navy-950 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Cost (₹)</th>
                <th className="py-3.5 px-3 text-right">Selling (₹)</th>
                <th className="py-3.5 px-3 text-right">Unit Margin</th>
                <th className="py-3.5 px-3 text-center">Stock / Threshold</th>
                <th className="py-3.5 px-3">Supplier</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map(p => {
                const margins = calculateProductMargins(p.sellingPrice, p.costPrice);
                const isLowStock = p.stock <= p.minStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-navy-900/50 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-navy-900 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                          <Package className="w-4 h-4 text-lime-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs">{p.name}</p>
                          {p.nameHi && (
                            <p className="text-[11px] text-slate-400 font-hindi">{p.nameHi}</p>
                          )}
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-navy-900 text-slate-300 border border-slate-700">
                        {p.category}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                      {formatINR(p.costPrice)}
                    </td>

                    {/* Selling */}
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-lime-accent">
                      {formatINR(p.sellingPrice)}
                    </td>

                    {/* Margin */}
                    <td className="py-3 px-3 text-right">
                      <p className="font-bold text-mint-accent font-mono">
                        +{formatINR(margins.margin)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {margins.marginPercent}%
                      </p>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono ${
                          isLowStock 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                            : 'bg-navy-900 text-white border border-slate-700'
                        }`}>
                          {p.stock} {p.unit}s
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">
                          Alert at: {p.minStockThreshold}
                        </span>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[140px]">
                      {p.supplierName.split(' ')[0]} {p.supplierName.split(' ')[1] || ''}
                    </td>

                    {/* Action Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Adjust Stock Button */}
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setStockDelta(Math.max(10, (p.minStockThreshold * 2) - p.stock));
                          }}
                          className="px-2 py-1 rounded-lg bg-navy-900 hover:bg-navy-700 text-lime-accent text-[11px] font-bold border border-lime-accent/30 flex items-center gap-1"
                          title="Restock or adjust inventory"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Restock</span>
                        </button>

                        {/* Edit Product */}
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-400 hover:text-white border border-slate-800"
                          title="Edit product rates"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Stock History */}
                        <button
                          onClick={() => setHistoryProduct(p)}
                          className="p-1 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-400 hover:text-white border border-slate-800"
                          title="View movement history"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-navy-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">Adjust Stock: {adjustingProduct.name}</h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Current Stock Quantity</label>
                <p className="text-lg font-bold text-white font-mono">{adjustingProduct.stock} {adjustingProduct.unit}s</p>
              </div>

              <div>
                <label className="text-xs text-slate-400">Add or Remove Quantity (+ for inward, − for damage/loss)</label>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-sm font-bold text-lime-accent font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Adjustment Reason</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Weekly replenishment from Sharma Traders"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyStockAdjustment}
                  className="px-5 py-2.5 rounded-xl bg-lime-accent text-navy-950 font-bold text-xs"
                >
                  Confirm Adjustment ({adjustingProduct.stock + stockDelta} Total)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movement History Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-navy-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">Movement Log: {historyProduct.name}</h3>
              <button onClick={() => setHistoryProduct(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {historyProduct.stockMovements.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous movement logs recorded.</p>
              ) : (
                historyProduct.stockMovements.map(m => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{m.reason}</p>
                      <p className="text-[10px] text-slate-400">{m.date}</p>
                    </div>
                    <span className={`font-mono font-bold ${m.type === 'IN' ? 'text-lime-accent' : 'text-rose-400'}`}>
                      {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} {historyProduct.unit}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setHistoryProduct(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductModalOpen && (
        <AddProductModal
          isOpen={addProductModalOpen}
          onClose={() => setAddProductModalOpen(false)}
        />
      )}
    </div>
  );
};
