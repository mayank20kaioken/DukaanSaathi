import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Receipt, 
  Plus, 
  Download, 
  Filter, 
  Search, 
  CheckCircle2, 
  FileText, 
  ScanLine, 
  Calendar, 
  Building2 
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';
import { ExpenseCategory } from '../types';

export const ExpenseManagerView: React.FC = () => {
  const { expenses, openModal, language } = useApp();
  const isHi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.notes.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (e.supplierName && e.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.invoiceNo && e.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Category', 'Amount (INR)', 'Payment Method', 'Supplier', 'Invoice No', 'Notes', 'Verified'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      e.category,
      e.amount,
      e.paymentMethod,
      e.supplierName || 'N/A',
      e.invoiceNo || 'N/A',
      `"${e.notes.replace(/"/g, '""')}"`,
      e.verifiedFromBill ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaanSaathi_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isHi ? 'स्मार्ट खर्च प्रबंधक (Expense Manager)' : 'Smart Expense Manager'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track electricity, rent, salaries, cartage, and direct supplier invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openModal('BILL_SCANNER')}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-mint-accent border border-mint-accent/40 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Bill to Expense</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openModal('RECORD_EXPENSE')}
            className="px-4 py-2 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-navy-800 border border-slate-700 shadow-card-dark">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Filtered Expenses</span>
          <p className="text-xl font-black text-rose-400 font-mono mt-1">{formatINR(totalExpense)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredExpenses.length} expense records</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-800 border border-slate-700 shadow-card-dark">
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified via OCR Bill Scanner</span>
          <p className="text-xl font-black text-mint-accent font-mono mt-1">
            {filteredExpenses.filter(e => e.verifiedFromBill).length} Bills
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Audited from scanned supplier slips</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-800 border border-slate-700 shadow-card-dark">
          <span className="text-[10px] uppercase font-bold text-slate-400">Largest Expense Category</span>
          <p className="text-xl font-black text-white mt-1">Shop Rent (₹18,000)</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Fixed commercial lease cost</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-3xl bg-navy-800/90 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 shadow-card-dark">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense notes, supplier, invoice..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-accent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'RENT', 'ELECTRICITY', 'SALARIES', 'SUPPLIER_PURCHASE', 'TRANSPORT', 'PACKAGING'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-amber-400 text-navy-950 font-bold' 
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl border border-slate-700 bg-navy-800/95 overflow-hidden shadow-card-dark">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950 text-slate-400 text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Description & Notes</th>
              <th className="py-3 px-3">Supplier Reference</th>
              <th className="py-3 px-2 text-center">Payment</th>
              <th className="py-3 px-2 text-center">OCR Verified</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredExpenses.map(e => (
              <tr key={e.id} className="hover:bg-navy-900/40">
                <td className="py-3 px-4 font-mono text-slate-400">{formatDate(e.date)}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-900 text-amber-300 border border-amber-500/30">
                    {e.category}
                  </span>
                </td>
                <td className="py-3 px-3 text-white">
                  <p className="font-semibold">{e.categoryLabel}</p>
                  <p className="text-[11px] text-slate-400">{e.notes}</p>
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {e.supplierName || '—'}
                  {e.invoiceNo && <span className="block text-[10px] text-slate-500 font-mono">#{e.invoiceNo}</span>}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {e.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  {e.verifiedFromBill ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-mint-accent/20 text-mint-accent">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Manual</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-rose-300 font-mono text-sm">
                  {formatINR(e.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
