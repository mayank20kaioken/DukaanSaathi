import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  User, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  Printer,
  Sparkles
} from 'lucide-react';
import { formatINR, calculateProductMargins } from '../../utils/formatters';
import { SaleItem } from '../../types';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ isOpen, onClose }) => {
  const { products, customers, recordSale, language } = useApp();
  const isHi = language === 'hi';

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<SaleItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      productNameHi: products[0]?.nameHi,
      quantity: 2,
      unit: products[0]?.unit || 'packet',
      unitPrice: products[0]?.sellingPrice || 14,
      unitCost: products[0]?.costPrice || 11.2,
      subtotal: (products[0]?.sellingPrice || 14) * 2
    }
  ]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerNameInput, setCustomerNameInput] = useState<string>('Walk-in Cash Customer');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'UDHAAR' | 'CARD'>('UPI');
  const [discount, setDiscount] = useState<number>(0);
  const [saleCompleted, setSaleCompleted] = useState<boolean>(false);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState<string>('');

  if (!isOpen) return null;

  const currentSelectedProduct = products.find(p => p.id === selectedProductId);

  const handleAddToCart = () => {
    if (!currentSelectedProduct || quantity <= 0) return;

    const existingIdx = cartItems.findIndex(i => i.productId === currentSelectedProduct.id);
    if (existingIdx >= 0) {
      const updated = [...cartItems];
      updated[existingIdx].quantity += quantity;
      updated[existingIdx].subtotal = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setCartItems(updated);
    } else {
      const newItem: SaleItem = {
        productId: currentSelectedProduct.id,
        productName: currentSelectedProduct.name,
        productNameHi: currentSelectedProduct.nameHi,
        quantity,
        unit: currentSelectedProduct.unit,
        unitPrice: currentSelectedProduct.sellingPrice,
        unitCost: currentSelectedProduct.costPrice,
        subtotal: currentSelectedProduct.sellingPrice * quantity
      };
      setCartItems([...cartItems, newItem]);
    }
    setQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);
  const cogs = cartItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
  const grossProfit = total - cogs;
  const marginPercent = total > 0 ? ((grossProfit / total) * 100).toFixed(1) : '0';

  const handleSubmitSale = () => {
    if (cartItems.length === 0) {
      alert("Please add at least one item to the bill.");
      return;
    }

    if (paymentMode === 'UDHAAR' && !selectedCustomerId) {
      alert("Please select a registered Khata Customer to record this as Udhaar.");
      return;
    }

    const matchedCustomer = customers.find(c => c.id === selectedCustomerId);
    const finalCustomerName = paymentMode === 'UDHAAR' && matchedCustomer 
      ? matchedCustomer.name 
      : customerNameInput;

    recordSale({
      customerId: selectedCustomerId || undefined,
      customerName: finalCustomerName,
      items: cartItems,
      subtotal,
      discount,
      tax: 0,
      total,
      paymentMode,
      cogs,
      grossProfit
    });

    setLastInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setSaleCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isHi ? 'नई बिक्री / बिल दर्ज करें (POS)' : 'Record New Sale (Fast Counter Billing)'}
              </h3>
              <p className="text-xs text-slate-400">
                Instantly compute margin, update stock, and link to Udhaar Khata.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {saleCompleted ? (
          /* Success Receipt View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-lime-accent/20 border-2 border-lime-accent flex items-center justify-center text-lime-accent mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-xl text-white">
              {isHi ? 'बिक्री सफलतापूर्वक दर्ज हो गई!' : 'Sale Successfully Recorded!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Invoice #{lastInvoiceNumber} for <strong className="text-lime-accent">{formatINR(total)}</strong> has been logged. Stock updated and profit calculated.
            </p>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                onClick={() => {
                  setSaleCompleted(false);
                  setCartItems([]);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs"
              >
                Done / पूरा हुआ
              </button>
            </div>
          </div>
        ) : (
          /* Billing Form */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Customer & Payment Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isHi ? 'ग्राहक चयन (खाता लिंक)' : 'Customer Name / Khata Profile'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setCustomerNameInput(cust.name);
                  }}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                >
                  <option value="">Walk-in Retail Customer (नगद ग्राहक)</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isHi ? 'भुगतान का माध्यम' : 'Payment Mode'}
                </label>
                <div className="mt-1 grid grid-cols-4 gap-1.5">
                  {(['UPI', 'CASH', 'UDHAAR', 'CARD'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                        paymentMode === mode
                          ? mode === 'UDHAAR'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-lime-accent text-navy-950 shadow-lime-glow'
                          : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Inward to Cart Row */}
            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-lime-accent" />
                <span>{isHi ? 'बिल में सामान जोड़ें' : 'Select Product from Catalogue'}</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-7">
                  <label className="text-[10px] text-slate-400">Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatINR(p.sellingPrice)} (Stock: {p.stock} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white text-center font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-2 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-lime-accent border border-lime-accent/30 font-bold text-xs transition-colors"
                  >
                    + Add to Bill
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Items Table */}
            <div>
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-navy-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cartItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-navy-900/40">
                        <td className="py-2 px-4">
                          <p className="font-semibold text-white">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">Cost: {formatINR(item.unitCost)}</p>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-200">
                          {formatINR(item.unitPrice)}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-white">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right font-extrabold text-lime-accent font-mono">
                          {formatINR(item.subtotal)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400"
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

            {/* Bill Summary & Financial Margin Analysis */}
            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Total Bill Value</span>
                  <p className="font-extrabold text-lime-accent text-xl font-mono">{formatINR(total)}</p>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-[10px] text-slate-400 uppercase">Cost of Goods (COGS)</span>
                  <p className="font-bold text-slate-300 text-sm font-mono">{formatINR(cogs)}</p>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-[10px] text-slate-400 uppercase">Estimated Margin</span>
                  <p className="font-bold text-mint-accent text-sm font-mono">+{formatINR(grossProfit)} ({marginPercent}%)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitSale}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-extrabold text-xs shadow-lime-glow transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Bill & Record</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
