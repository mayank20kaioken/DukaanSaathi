import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Search, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Printer, 
  MessageSquare, 
  UserPlus, 
  PhoneCall, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';
import { Customer, KhataLedgerEntry } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { KhataActionModal } from '../components/modals/KhataActionModal';

export const KhataBookView: React.FC = () => {
  const { customers, addCustomer, getCustomerBalance, activeShop, language, theme } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'PAYMENT' | 'CREDIT' | 'REMINDER'>('PAYMENT');
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [showPrintStatement, setShowPrintStatement] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState(10000);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const selectedCustomerBalance = selectedCustomer ? getCustomerBalance(selectedCustomer) : 0;

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    const balance = getCustomerBalance(c);
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    if (filterOverdueOnly) {
      return matchesQuery && c.overdueDays > 15 && balance > 0;
    }
    return matchesQuery;
  });

  const totalMarketUdhaar = customers.reduce((sum, c) => sum + getCustomerBalance(c), 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      creditLimit: newCustLimit,
      trustScore: 'Good'
    });

    setNewCustName('');
    setNewCustPhone('');
    setAddCustomerModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`p-4 lg:p-7 space-y-6 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* View Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b ${
        isDark ? 'border-navy-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lime-accent/20 text-lime-accent flex items-center justify-center border border-lime-accent/40 shadow-lime-glow">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {isHi ? 'डिजिटल खाता बुक एवं उधारी प्रबंधन' : 'Digital Khata Book & Udhaar Management'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ledger entries, WhatsApp payment collection drafts & balance calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border text-right ${
            isDark ? 'bg-navy-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Market Udhaar</span>
            <span className="text-xl font-black text-amber-400 font-mono">{formatINR(totalMarketUdhaar)}</span>
          </div>

          <button
            onClick={() => setAddCustomerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-xs shadow-lime-glow flex items-center gap-1.5 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ {isHi ? 'नया खाता खोलें' : 'Add Customer'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Customer List on Left, Active Customer Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Customer Directory & Search */}
        <div className={`lg:col-span-4 rounded-3xl p-4 border flex flex-col h-[700px] shadow-surface-dark ${
          isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Search & Overdue Filter */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHi ? "ग्राहक नाम या फोन नंबर..." : "Search customer name or phone..."}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-accent"
              />
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterOverdueOnly 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>Overdue ({'>'} 15 days)</span>
              </button>
              <span className="text-[11px] text-slate-500">{filteredCustomers.length} khata holders</span>
            </div>
          </div>

          {/* Customer Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredCustomers.map(c => {
              const balance = getCustomerBalance(c);
              const isSelected = c.id === selectedCustomer?.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-navy-700 border-lime-accent/50 shadow-md'
                      : 'bg-navy-900/80 hover:bg-navy-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-amber-300 font-mono">
                        {formatINR(balance)}
                      </p>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        c.overdueDays > 30 ? 'bg-rose-500/20 text-rose-300' :
                        c.overdueDays > 10 ? 'bg-amber-500/20 text-amber-300' : 'bg-lime-accent/20 text-lime-accent'
                      }`}>
                        {c.overdueDays}d overdue
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Profile & Chronological Ledger */}
        <div className={`lg:col-span-8 rounded-3xl p-6 border flex flex-col h-[700px] overflow-hidden shadow-surface-dark ${
          isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {selectedCustomer ? (
            <div className="flex flex-col h-full space-y-5">
              
              {/* Profile Card & Action Bar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedCustomer.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-accent/15 text-lime-accent border border-lime-accent/30">
                      Trust: {selectedCustomer.trustScore}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Phone: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{selectedCustomer.phone}</strong></span>
                    <span>•</span>
                    <span>Address: {selectedCustomer.address || 'Local Market Area'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setActionType('PAYMENT');
                      setActionModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-xs shadow-lime-glow flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Receive Payment / जमा</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionType('CREDIT');
                      setActionModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Give Udhaar / उधार</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionType('REMINDER');
                      setActionModalOpen(true);
                    }}
                    className={`px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isDark 
                        ? 'bg-navy-800 hover:bg-navy-700 text-mint-accent border-mint-accent/40' 
                        : 'bg-white hover:bg-slate-100 text-teal-700 border-teal-300 shadow-xs'
                    }`}
                    title="Draft polite WhatsApp payment reminder in Hindi or English"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setShowPrintStatement(true)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border-slate-700' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300 shadow-xs'
                    }`}
                    title="Print customer ledger statement"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Outstanding Balance Banner */}
              <div className={`grid grid-cols-3 gap-3 p-3.5 rounded-2xl border text-xs ${
                isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Udhaar Taken</span>
                  <p className={`font-bold text-sm font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatINR(selectedCustomer.ledger.filter(l => l.type === 'CREDIT_GIVEN').reduce((s, l) => s + l.amount, 0))}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Amount Repaid</span>
                  <p className="font-bold text-lime-accent text-sm font-mono mt-0.5">
                    {formatINR(selectedCustomer.ledger.filter(l => l.type === 'PAYMENT_RECEIVED').reduce((s, l) => s + l.amount, 0))}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Net Outstanding Balance</span>
                  <p className="font-extrabold text-amber-400 text-base font-mono mt-0.5">
                    {formatINR(selectedCustomerBalance)}
                  </p>
                </div>
              </div>

              {/* Chronological Ledger Table */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Chronological Ledger History ({selectedCustomer.ledger.length} entries)
                </span>

                <div className={`flex-1 overflow-y-auto rounded-2xl border ${
                  isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`text-[10px] uppercase sticky top-0 ${
                      isDark ? 'bg-navy-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Credit (+)</th>
                        <th className="py-2.5 px-3 text-right">Payment (−)</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                      {selectedCustomer.ledger.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            No ledger entries recorded yet for this customer.
                          </td>
                        </tr>
                      ) : (
                        selectedCustomer.ledger.map(entry => (
                          <tr key={entry.id} className="hover:bg-navy-900/40">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{formatDate(entry.date)}</td>
                            <td className="py-2.5 px-3 text-white">
                              <p className="font-medium">{entry.description}</p>
                              {entry.billRef && (
                                <span className="text-[10px] text-slate-500 font-mono">Ref: {entry.billRef}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-rose-300 font-mono">
                              {entry.type === 'CREDIT_GIVEN' ? formatINR(entry.amount) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-lime-accent font-mono">
                              {entry.type === 'PAYMENT_RECEIVED' ? formatINR(entry.amount) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-200 font-mono">
                              {formatINR(entry.balanceAfter)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-600 mb-2" />
              <p>Select a customer to view ledger</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal for Payments, Udhaar and Reminders */}
      {actionModalOpen && (
        <KhataActionModal
          isOpen={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          customer={selectedCustomer}
          defaultAction={actionType}
        />
      )}

      {/* Printable Customer Statement Overlay */}
      {showPrintStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6 printable-area max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{activeShop.name}</h2>
                <p className="text-xs text-slate-600">{activeShop.address}, {activeShop.city} • GST: {activeShop.gstin}</p>
                <p className="text-xs text-slate-600">Phone: {activeShop.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded bg-slate-100 font-bold text-xs uppercase tracking-wider">
                  Customer Khata Statement
                </span>
                <p className="text-xs text-slate-500 mt-1">Generated: {formatDate(new Date().toISOString())}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Customer Details</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedCustomer.name}</p>
                <p className="text-slate-600">{selectedCustomer.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Net Balance Due</span>
                <p className="text-xl font-black text-rose-600 mt-0.5 font-mono">{formatINR(selectedCustomerBalance)}</p>
              </div>
            </div>

            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600 text-[10px] uppercase">
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Debit (+)</th>
                    <th className="py-2 text-right">Credit (−)</th>
                    <th className="py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedCustomer.ledger.map(entry => (
                    <tr key={entry.id}>
                      <td className="py-2 font-mono">{formatDate(entry.date)}</td>
                      <td className="py-2">{entry.description}</td>
                      <td className="py-2 text-right font-mono">{entry.type === 'CREDIT_GIVEN' ? formatINR(entry.amount) : '—'}</td>
                      <td className="py-2 text-right font-mono">{entry.type === 'PAYMENT_RECEIVED' ? formatINR(entry.amount) : '—'}</td>
                      <td className="py-2 text-right font-bold font-mono">{formatINR(entry.balanceAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="no-print pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowPrintStatement(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-navy-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-white">Add New Khata Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Credit Limit (₹)</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(parseInt(e.target.value) || 5000)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-lime-accent text-navy-950 font-bold text-xs"
                >
                  Create Khata Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
