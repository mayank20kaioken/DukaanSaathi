import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  FileText, 
  Download, 
  Upload, 
  ShieldAlert, 
  Users, 
  Store, 
  CheckCircle2, 
  RefreshCcw, 
  Smartphone,
  PhoneCall,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const SettingsReportsView: React.FC = () => {
  const { 
    activeShop, 
    shops, 
    setActiveShopId, 
    products, 
    customers, 
    expenses, 
    sales, 
    suppliers, 
    resetToDemoData, 
    language 
  } = useApp();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'reports' | 'suppliers' | 'risk' | 'profile'>('reports');

  // Export all shop records as JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      shop: activeShop,
      products,
      customers,
      sales,
      expenses,
      suppliers
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DukaanSaathi_Backup_${activeShop.id}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isHi ? 'सेटिंग्स, रिपोर्ट्स एवं सप्लायर डायरेक्टरी' : 'Settings, Reports & Supplier Directory'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data exports, supplier comparison directory, business risk radar & store profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDemoData}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset data back to factory defaults"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-lime-accent text-navy-950 shadow-lime-glow' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reports & CSV Export</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'suppliers' ? 'bg-mint-accent text-navy-950 shadow-mint-glow' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Supplier Directory & Prices</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'risk' ? 'bg-rose-500 text-white shadow-md' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Business Risk Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-blue-400 text-navy-950 shadow-md' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shop Profile & Multi-Shop</span>
        </button>
      </div>

      {/* Reports & CSV Export Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark space-y-3">
              <h4 className="font-bold text-white text-sm">Customer Udhaar Summary</h4>
              <p className="text-xs text-slate-400">Download chronological balance sheets and overdue days for all customers.</p>
              <button
                onClick={() => {
                  const headers = ['Name', 'Phone', 'Overdue Days', 'Trust Score', 'Balance Due'];
                  const rows = customers.map(c => [c.name, c.phone, c.overdueDays, c.trustScore, c.ledger.reduce((s, l) => s + (l.type === 'CREDIT_GIVEN' ? l.amount : -l.amount), 0)]);
                  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'Khata_Udhaar_Summary.csv'; a.click();
                }}
                className="w-full py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-700 text-lime-accent text-xs font-bold border border-lime-accent/30 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Udhaar Report (CSV)</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark space-y-3">
              <h4 className="font-bold text-white text-sm">Inventory & Stock Valuation</h4>
              <p className="text-xs text-slate-400">Export catalogue margins, buying cost, selling price, and warehouse stock units.</p>
              <button
                onClick={() => {
                  const headers = ['Product', 'SKU', 'Category', 'Cost (₹)', 'Selling (₹)', 'Stock Units', 'Threshold', 'Valuation (₹)'];
                  const rows = products.map(p => [p.name, p.sku, p.category, p.costPrice, p.sellingPrice, p.stock, p.minStockThreshold, p.stock * p.costPrice]);
                  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const a = document.createElement('a'); a.href = encodeURI(csv); a.download = 'Inventory_Valuation.csv'; a.click();
                }}
                className="w-full py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-700 text-mint-accent text-xs font-bold border border-mint-accent/30 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Inventory Valuation (CSV)</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark space-y-3">
              <h4 className="font-bold text-white text-sm">Complete Store JSON Backup</h4>
              <p className="text-xs text-slate-400">Download entire shop state including sales, expenses, khata, and products.</p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2 px-3 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 text-xs font-bold shadow-lime-glow flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Download Full Store Backup (JSON)</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Local Privacy Notice:</strong> DukaanSaathi prototype data is safely stored directly in your local browser sandbox. It is never transmitted to unverified external trackers.
          </div>
        </div>
      )}

      {/* Supplier Directory Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="p-5 rounded-3xl bg-navy-800 border border-slate-700 shadow-card-dark space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{s.name}</h4>
                    <p className="text-xs text-slate-400">Contact: <strong className="text-slate-200">{s.contactPerson}</strong></p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-accent/15 text-lime-accent">
                    ★ {s.rating}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Terms:</span>
                    <span className="text-slate-200 font-medium">{s.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pending Payables Balance:</span>
                    <span className="font-bold text-rose-300 font-mono">{formatINR(s.pendingPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Categories:</span>
                    <span className="text-slate-300">{s.categories.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{s.address}</span>
                  <a
                    href={`tel:${s.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-700 text-lime-accent font-bold text-xs border border-lime-accent/30 flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{s.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Risk Alerts Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-navy-800 border border-slate-700 shadow-card-dark space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="font-extrabold text-sm text-white">Active Retail Risk Radar</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-navy-950 border border-rose-500/30 flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-rose-300 block">Credit Default Risk: Vikas Sharma (Plumber)</span>
                  <p className="text-slate-400 mt-0.5">₹4,750 outstanding for 48 days without any counter transaction. High default probability.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 shrink-0">HIGH RISK</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-navy-950 border border-amber-500/30 flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-amber-300 block">Wholesale Payable Concentration: Sharma Traders</span>
                  <p className="text-slate-400 mt-0.5">₹18,450 payable due in 4 days. Negotiate partial settlement if sales collection slows.</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 shrink-0">MEDIUM RISK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Profile & Multi-Shop Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-navy-800 border border-slate-700 shadow-card-dark space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-base text-white">Store Identity & Statutory Registration</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold">Store Name</label>
                <input
                  type="text"
                  readOnly
                  value={activeShop.name}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold">Proprietor / Owner</label>
                <input
                  type="text"
                  readOnly
                  value={activeShop.ownerName}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN Registration</label>
                <input
                  type="text"
                  readOnly
                  value={activeShop.gstin}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-lime-accent font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold">Store Phone</label>
                <input
                  type="text"
                  readOnly
                  value={activeShop.phone}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block text-[10px] uppercase font-bold">Physical Address</label>
                <input
                  type="text"
                  readOnly
                  value={`${activeShop.address}, ${activeShop.city} - ${activeShop.pincode}`}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
              <span className="text-slate-400">Multi-Shop Architecture: Configured for {shops.length} branch stores.</span>
              <span className="text-lime-accent font-bold">Sync: Local Engine</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
