import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Printer, 
  Eye, 
  Calendar, 
  Download, 
  Filter, 
  ArrowUpRight 
} from 'lucide-react';
import { Sale } from '../types';
import { formatINR, formatDateTime, formatDate } from '../utils/formatters';

export const SalesPosView: React.FC = () => {
  const { sales, openModal, language, activeShop } = useApp();
  const isHi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(s => 
    s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalGrossProfit = filteredSales.reduce((sum, s) => sum + s.grossProfit, 0);

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isHi ? 'बिक्री इतिहास एवं बिलिंग काउंटर' : 'Sales History & POS Counter'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction ledger, customer invoices, payment method audit & profit margins.
          </p>
        </div>

        <button
          onClick={() => openModal('RECORD_SALE')}
          className="px-4 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-bold text-xs shadow-lime-glow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Sale (POS)</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-navy-800 border border-slate-700 shadow-card-dark">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed Revenue</span>
          <p className="text-xl font-black text-lime-accent font-mono mt-1">{formatINR(totalSalesRevenue)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredSales.length} customer receipts</p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-800 border border-slate-700 shadow-card-dark">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Gross Profit Margin</span>
          <p className="text-xl font-black text-mint-accent font-mono mt-1">{formatINR(totalGrossProfit)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totalSalesRevenue > 0 ? ((totalGrossProfit / totalSalesRevenue) * 100).toFixed(1) : 0}% cumulative margin
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-800 border border-slate-700 shadow-card-dark">
          <span className="text-[10px] uppercase font-bold text-slate-400">Payment Breakdown</span>
          <p className="text-xs text-slate-200 mt-2 flex items-center gap-2">
            <span className="text-lime-accent font-bold">UPI: {filteredSales.filter(s => s.paymentMode === 'UPI').length}</span> •
            <span className="text-white font-bold">Cash: {filteredSales.filter(s => s.paymentMode === 'CASH').length}</span> •
            <span className="text-rose-400 font-bold">Udhaar: {filteredSales.filter(s => s.paymentMode === 'UDHAAR').length}</span>
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-3xl bg-navy-800/90 border border-slate-700 flex items-center justify-between gap-3 shadow-card-dark">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number or customer name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-accent"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-3xl border border-slate-700 bg-navy-800/95 overflow-hidden shadow-card-dark">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950 text-slate-400 text-[10px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Items Purchased</th>
              <th className="py-3 px-2 text-center">Payment</th>
              <th className="py-3 px-3 text-right">Margin (₹)</th>
              <th className="py-3 px-4 text-right">Total (₹)</th>
              <th className="py-3 px-3 text-center">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredSales.map(s => (
              <tr key={s.id} className="hover:bg-navy-900/40">
                <td className="py-3 px-4 font-mono font-bold text-white">{s.invoiceNo}</td>
                <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{formatDateTime(s.date)}</td>
                <td className="py-3 px-3 text-white font-medium">{s.customerName || 'Walk-in Cash Customer'}</td>
                <td className="py-3 px-3 text-slate-300">
                  {s.items.map(i => `${i.productName.split(' ')[0]} (${i.quantity})`).join(', ')}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.paymentMode === 'UDHAAR' ? 'bg-rose-500/20 text-rose-300' :
                    s.paymentMode === 'UPI' ? 'bg-lime-accent/20 text-lime-accent' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {s.paymentMode}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-mint-accent font-bold">
                  +{formatINR(s.grossProfit)}
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-lime-accent font-mono text-sm">
                  {formatINR(s.total)}
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => setSelectedSale(s)}
                    className="p-1 rounded-lg bg-navy-900 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-800"
                    title="View printable receipt"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 printable-area">
            <div className="text-center pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-lg text-slate-900">{activeShop.name}</h3>
              <p className="text-[11px] text-slate-600">{activeShop.address}, {activeShop.city}</p>
              <p className="text-[11px] text-slate-600">GST: {activeShop.gstin} • Ph: {activeShop.phone}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">Invoice: {selectedSale.invoiceNo}</p>
              <p className="text-[10px] text-slate-400">{formatDateTime(selectedSale.date)}</p>
            </div>

            <div className="text-xs space-y-1">
              <p><strong>Customer:</strong> {selectedSale.customerName}</p>
              <p><strong>Payment Mode:</strong> {selectedSale.paymentMode}</p>
            </div>

            <div className="border-t border-b border-slate-200 py-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px]">
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSale.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1">{item.productName.slice(0, 22)}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right font-mono">{formatINR(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Grand Total:</span>
              <span className="font-mono">{formatINR(selectedSale.total)}</span>
            </div>

            <div className="no-print pt-3 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
