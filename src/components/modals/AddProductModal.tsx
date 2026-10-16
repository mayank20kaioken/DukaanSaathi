import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Package, CheckCircle2 } from 'lucide-react';
import { UnitType } from '../../types';
import { formatINR, calculateProductMargins } from '../../utils/formatters';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, suppliers, language } = useApp();
  const isHi = language === 'hi';

  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [category, setCategory] = useState<any>('Groceries');
  const [costPrice, setCostPrice] = useState<number>(100);
  const [sellingPrice, setSellingPrice] = useState<number>(125);
  const [stock, setStock] = useState<number>(20);
  const [unit, setUnit] = useState<UnitType>('packet');
  const [minStockThreshold, setMinStockThreshold] = useState<number>(10);
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [shelfLocation, setShelfLocation] = useState<string>('Aisle 1');
  const [expiryDate, setExpiryDate] = useState<string>('2027-06-30');

  if (!isOpen) return null;

  const margins = calculateProductMargins(sellingPrice, costPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter product name.");
      return;
    }

    const supplier = suppliers.find(s => s.id === supplierId);
    const sku = `${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    addProduct({
      name,
      nameHi: nameHi || name,
      sku,
      category,
      costPrice,
      sellingPrice,
      stock,
      unit,
      minStockThreshold,
      supplierId: supplierId || 'sup-01',
      supplierName: supplier ? supplier.name : 'Direct Wholesale Market',
      expiryDate,
      shelfLocation,
      demandLevel: 'Medium'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-xl bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isHi ? 'कैटलॉग में नया सामान जोड़ें' : 'Add New Product to Inventory'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure buying cost, selling price, safety stock thresholds & supplier.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name (English)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parle Hide & Seek 120g"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">हिंदी नाम (Hindi Name)</label>
              <input
                type="text"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                placeholder="उदा. पारले हाइड एंड सीक 120 ग्राम"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent font-hindi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                <option value="Groceries">Groceries & Cooking (राशन / तेल)</option>
                <option value="Snacks & Beverages">Snacks & Beverages (नमकीन व चाय)</option>
                <option value="Dairy & Bakery">Dairy & Bakery (दूध / मक्खन / ब्रेड)</option>
                <option value="Personal Care">Personal Care (साबुन / शैम्पू)</option>
                <option value="Home Care">Home Care (सर्फ / सफाई)</option>
                <option value="Spices & Staples">Spices & Staples (मसाले / दालें)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Live Margin Calculator */}
          <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cost / Buying Price (₹)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-sm font-bold text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MRP / Selling Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-sm font-extrabold text-lime-accent font-mono"
                />
              </div>
            </div>

            {/* Live Profit Margin Bar */}
            <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-xl bg-navy-900/80">
              <span className="text-slate-400">Estimated Unit Profit:</span>
              <span className="font-bold text-mint-accent">
                {formatINR(margins.margin)} / unit ({margins.marginPercent}% gross margin)
              </span>
            </div>
          </div>

          {/* Stock & Thresholds */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opening Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white text-center font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Type</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
              >
                <option value="packet">packet (पैकेट)</option>
                <option value="kg">kg (किलो)</option>
                <option value="litre">litre (लीटर)</option>
                <option value="piece">piece (पीस)</option>
                <option value="box">box (डिब्बा)</option>
                <option value="bottle">bottle (बोतल)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Alert Stock</label>
              <input
                type="number"
                min="1"
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(parseInt(e.target.value) || 5)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white text-center font-bold text-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shelf / Aisle Location</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Aisle 2 - Shelf B"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Add to Catalogue / सामान जोड़ें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
