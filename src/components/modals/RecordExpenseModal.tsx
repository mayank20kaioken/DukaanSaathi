import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Receipt, CheckCircle2 } from 'lucide-react';
import { ExpenseCategory } from '../../types';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({ isOpen, onClose }) => {
  const { recordExpense, suppliers, language } = useApp();
  const isHi = language === 'hi';

  const [category, setCategory] = useState<ExpenseCategory>('ELECTRICITY');
  const [amount, setAmount] = useState<number>(1200);
  const [supplierId, setSupplierId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CARD'>('UPI');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const categories: Array<{ id: ExpenseCategory; label: string; labelHi: string }> = [
    { id: 'ELECTRICITY', label: 'Electricity & Refrigerator Power', labelHi: 'दुकान का बिजली बिल' },
    { id: 'RENT', label: 'Shop Rent', labelHi: 'दुकान का किराया' },
    { id: 'SALARIES', label: 'Helper / Staff Salary', labelHi: 'दुकान सहायक का वेतन' },
    { id: 'TRANSPORT', label: 'Cartage & Wholesale Transport', labelHi: 'माल ढुलाई व भाड़ा' },
    { id: 'PACKAGING', label: 'Carry Bags & Packaging Pouches', labelHi: 'कागज़ के थैले व थैलियां' },
    { id: 'MAINTENANCE', label: 'Store Maintenance & Repairs', labelHi: 'दुकान की मरम्मत व सफाई' },
    { id: 'SUPPLIER_PURCHASE', label: 'Direct Supplier Purchase', labelHi: 'सप्लायर को नकद भुगतान' },
    { id: 'OTHER', label: 'General / Miscellaneous', labelHi: 'अन्य विविध खर्चे' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    const selectedCat = categories.find(c => c.id === category) || categories[0];
    const selectedSupplier = suppliers.find(s => s.id === supplierId);

    recordExpense({
      category,
      categoryLabel: selectedCat.label,
      categoryLabelHi: selectedCat.labelHi,
      amount,
      supplierId: supplierId || undefined,
      supplierName: selectedSupplier ? selectedSupplier.name : undefined,
      paymentMethod,
      invoiceNo: invoiceNo || undefined,
      notes: notes || 'Store routine operational expense',
      verifiedFromBill: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isHi ? 'दुकान का नया खर्च दर्ज करें' : 'Record Operating Expense'}
              </h3>
              <p className="text-xs text-slate-400">
                Operating expenses directly calculate your true Net Profit.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'खर्च की श्रेणी' : 'Expense Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {isHi ? c.labelHi : c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isHi ? 'राशि (₹)' : 'Amount (₹)'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-base font-extrabold text-lime-accent font-mono focus:outline-none focus:border-lime-accent"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isHi ? 'भुगतान विधि' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CASH">Cash / नगद</option>
                <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
                <option value="CARD">Debit / Credit Card</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isHi ? 'सप्लायर / वेंडर (यदि लागू हो)' : 'Supplier (Optional)'}
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
              >
                <option value="">None / General</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isHi ? 'बिल / रसीद नंबर' : 'Bill / Reference No'}
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. BSES-OCT-26"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isHi ? 'विवरण या टिप्पणी' : 'Expense Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly shop helper salary paid via cash"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-lime-accent"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
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
              <span>Save Expense / खर्च सुरक्षित करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
