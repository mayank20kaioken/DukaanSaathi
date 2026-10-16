import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  BookOpen, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Customer } from '../../types';
import { formatINR } from '../../utils/formatters';

interface KhataActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  defaultAction?: 'PAYMENT' | 'CREDIT' | 'REMINDER';
}

export const KhataActionModal: React.FC<KhataActionModalProps> = ({
  isOpen,
  onClose,
  customer,
  defaultAction = 'PAYMENT'
}) => {
  const { customers, recordKhataPayment, addKhataCredit, getCustomerBalance, activeShop, language } = useApp();
  const isHi = language === 'hi';

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customer?.id || customers[0]?.id || '');
  const [actionType, setActionType] = useState<'PAYMENT' | 'CREDIT' | 'REMINDER'>(defaultAction);
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('UPI');
  const [description, setDescription] = useState<string>('Counter payment received');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [copiedReminder, setCopiedReminder] = useState<boolean>(false);
  const [reminderLang, setReminderLang] = useState<'hi' | 'en'>('hi');

  if (!isOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const currentBalance = currentCustomer ? getCustomerBalance(currentCustomer) : 0;

  // WhatsApp Payment Reminders
  const hindiReminder = `नमस्ते ${currentCustomer?.name} जी, आपकी सुविधा के लिए ${activeShop.name} से यह विनम्र सूचना है। आपके खाते में कुल बकाया उधारी ${formatINR(currentBalance)} है। कृपया सुविधा अनुसार UPI या दुकान पर आकर भुगतान करने की कृपा करें। धन्यवाद! - ${activeShop.ownerName}`;
  const englishReminder = `Dear ${currentCustomer?.name}, this is a gentle reminder from ${activeShop.name}. Your outstanding Khata credit balance is ${formatINR(currentBalance)}. Kindly settle this via UPI or at store counter at your earliest convenience. Thank you! - ${activeShop.ownerName}`;
  const reminderText = reminderLang === 'hi' ? hindiReminder : englishReminder;

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(reminderText);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = currentCustomer.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderText)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    if (!confirmed) {
      alert("Please confirm the verification checkbox before finalizing this ledger entry.");
      return;
    }

    if (actionType === 'PAYMENT') {
      recordKhataPayment(currentCustomer.id, amount, paymentMethod, description);
    } else if (actionType === 'CREDIT') {
      addKhataCredit(currentCustomer.id, amount, description);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isHi ? 'डिजिटल खाता कार्रवाई' : 'Digital Khata Transaction & Reminders'}
              </h3>
              <p className="text-xs text-slate-400">
                Customer: <strong className="text-white">{currentCustomer?.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toggle (Payment Received vs Credit Given vs WhatsApp Reminder) */}
        <div className="p-4 bg-navy-950/60 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => { setActionType('PAYMENT'); setConfirmed(false); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              actionType === 'PAYMENT'
                ? 'bg-lime-accent text-navy-950 shadow-lime-glow'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-800" />
            <span>{isHi ? 'जमा मिला (Payment)' : 'Receive Payment'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActionType('CREDIT'); setConfirmed(false); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              actionType === 'CREDIT'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span>{isHi ? 'उधार दिया (Credit)' : 'Give Credit'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActionType('REMINDER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              actionType === 'REMINDER'
                ? 'bg-mint-accent text-navy-950 shadow-mint-glow'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-navy-950" />
            <span>{isHi ? 'व्हाट्सएप तकादा' : 'Reminder Draft'}</span>
          </button>
        </div>

        {/* Customer Balance Spotlight */}
        <div className="px-6 py-3 bg-navy-950 flex items-center justify-between text-xs border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Outstanding Balance:</span>
            <p className="font-extrabold text-white text-base font-mono">{formatINR(currentBalance)}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Trust Score</span>
            <p className={`font-bold ${
              currentCustomer?.trustScore === 'Excellent' ? 'text-lime-accent' :
              currentCustomer?.trustScore === 'Risky' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {currentCustomer?.trustScore} ({currentCustomer?.overdueDays} days overdue)
            </p>
          </div>
        </div>

        {actionType === 'REMINDER' ? (
          /* WhatsApp Polite Reminder Generator */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {isHi ? 'भाषा चुनें' : 'Draft Reminder Language'}:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReminderLang('hi')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    reminderLang === 'hi' ? 'bg-mint-accent text-navy-950' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderLang('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    reminderLang === 'en' ? 'bg-mint-accent text-navy-950' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-hindi">
              {reminderText}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyReminder}
                className="flex-1 py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
              >
                {copiedReminder ? <Check className="w-4 h-4 text-lime-accent" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReminder ? 'Copied / कॉपी हो गया' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send on WhatsApp</span>
              </button>
            </div>
          </div>
        ) : (
          /* Payment or Credit Transaction Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {actionType === 'PAYMENT' ? 'Payment Amount (₹)' : 'Credit Amount (₹)'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className={`mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border text-base font-extrabold font-mono focus:outline-none ${
                    actionType === 'PAYMENT' 
                      ? 'border-lime-accent/50 text-lime-accent' 
                      : 'border-rose-500/50 text-rose-300'
                  }`}
                />
              </div>

              {actionType === 'PAYMENT' ? (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash / काउंटर नकद</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bill Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-1015"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Note / Reason</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly ration partial settlement"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white"
              />
            </div>

            {/* Strict Confirmation Requirement before modifying financial balance */}
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-lime-accent mt-0.5 bg-navy-800 border-slate-700"
                />
                <span className="leading-tight">
                  I confirm recording <strong className="text-white">{formatINR(amount)}</strong> for {currentCustomer?.name}. New calculated balance will become <strong className="text-lime-accent">{formatINR(actionType === 'PAYMENT' ? Math.max(0, currentBalance - amount) : currentBalance + amount)}</strong>.
                </span>
              </label>
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
                disabled={!confirmed}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none ${
                  actionType === 'PAYMENT'
                    ? 'bg-lime-accent text-navy-950 shadow-lime-glow hover:bg-lime-hover'
                    : 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Update Khata Ledger</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
