import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Package, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectView
}) => {
  const { products, customers, getCustomerBalance, language } = useApp();
  const isHi = language === 'hi';

  if (!isOpen) return null;

  const lowStockItems = products.filter(p => p.stock <= p.minStockThreshold);
  const overdueCustomers = customers.filter(c => c.overdueDays > 20 && getCustomerBalance(c) > 0);
  const expiringItems = products.filter(p => {
    if (!p.expiryDate) return false;
    const diff = Math.ceil((new Date(p.expiryDate).getTime() - new Date('2026-10-15').getTime()) / (1000 * 3600 * 24));
    return diff <= 30;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-navy-900 border-l border-slate-800 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isHi ? 'दुकान अलर्ट व सूचनाएं' : 'Shop Alerts & Notifications'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Actionable real-time business health warnings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="rounded-2xl bg-navy-950 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>{isHi ? 'कम स्टॉक चेतावनी' : 'Critical Stock Depletion'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                  {lowStockItems.length} items
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lowStockItems.map(p => p.name.split(' ')[0]).slice(0, 3).join(', ')} are below safety minimums. High risk of lost sales today.
              </p>
              <button
                onClick={() => {
                  onSelectView('inventory');
                  onClose();
                }}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-lime-accent text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <span>View Inventory Reorder Suggestions</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Overdue Udhaar Alerts */}
          {overdueCustomers.length > 0 && (
            <div className="rounded-2xl bg-navy-950 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isHi ? 'लंबित उधारी तकादा' : 'Overdue Customer Udhaar'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                  {overdueCustomers.length} accounts
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {overdueCustomers[0].name} has {formatINR(getCustomerBalance(overdueCustomers[0]))} overdue for {overdueCustomers[0].overdueDays} days.
              </p>
              <button
                onClick={() => {
                  onSelectView('khata');
                  onClose();
                }}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-lime-accent text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <span>Draft Polite WhatsApp Reminders</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Expiry Alerts */}
          {expiringItems.length > 0 && (
            <div className="rounded-2xl bg-navy-950 border border-slate-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-mint-accent flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isHi ? 'एक्सपायरी निकट' : 'Upcoming Expiry Date'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-mint-accent/20 text-mint-accent font-bold">
                  {expiringItems.length} items
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "{expiringItems[0]?.name}" expires on {expiringItems[0]?.expiryDate}. Put on front counter display.
              </p>
              <button
                onClick={() => {
                  onSelectView('expiry-deadstock');
                  onClose();
                }}
                className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-lime-accent text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1"
              >
                <span>Review Dead-Stock & Expiry Desk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-navy-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-semibold"
          >
            Mark All as Reviewed / सभी चेक कर लिए
          </button>
        </div>
      </div>
    </div>
  );
};
