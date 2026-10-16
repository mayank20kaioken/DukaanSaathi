import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Store, 
  LayoutDashboard, 
  TrendingUp, 
  Receipt, 
  ShoppingCart, 
  Package, 
  RefreshCw, 
  AlertOctagon, 
  BookOpen, 
  HeartHandshake, 
  Mic, 
  ScanLine, 
  BrainCircuit, 
  ShieldCheck, 
  Search, 
  Users, 
  Compass, 
  CalendarRange, 
  FileText, 
  ShieldAlert, 
  Building2,
  Sparkles,
  Zap,
  Globe2
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSelectView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAi?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView
}) => {
  const { language, activeShop, theme, setLanguage } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const navSections: NavSection[] = [
    {
      title: isHi ? 'एआई इंटेलिजेंस' : 'AI Intelligence',
      icon: Sparkles,
      items: [
        { id: 'voice-assistant', label: isHi ? 'हिंदी वॉयस AI' : 'Hindi Voice Assistant', icon: Mic, isAi: true },
        { id: 'bill-scanner', label: isHi ? 'एआई बिल स्कैनर' : 'AI Invoice Scanner', icon: ScanLine, isAi: true },
        { id: 'ai-advisor', label: isHi ? 'बिजनेस सलाहकार' : 'AI Business Advisor', icon: BrainCircuit, isAi: true },
        { id: 'officer-scanner', label: isHi ? 'अधिकारी आईडी सत्यापन' : 'Officer ID Verification', icon: ShieldCheck }
      ]
    },
    {
      title: isHi ? 'दैनिक ऑपरेशन्स' : 'Operations & Finance',
      items: [
        { id: 'dashboard', label: isHi ? 'डैशबोर्ड' : 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'profit-tracker', label: isHi ? 'लाभ ट्रैकर' : 'Gross & Net Profit', icon: TrendingUp },
        { id: 'expenses', label: isHi ? 'दुकान खर्च' : 'Expense Manager', icon: Receipt },
        { id: 'sales-pos', label: isHi ? 'बिक्री व बिलिंग' : 'Sales History & POS', icon: ShoppingCart },
        { id: 'risk-cashflow', label: isHi ? 'कैश-फ्लो रडार' : 'Cash Flow Radar', icon: ShieldAlert }
      ]
    },
    {
      title: isHi ? 'स्टॉक व ग्राहक' : 'Inventory & Khata',
      items: [
        { id: 'inventory', label: isHi ? 'उत्पाद कैटलॉग' : 'Inventory & Stock', icon: Package },
        { id: 'stock-reorder', label: isHi ? 'रीऑर्डर प्रेडिक्शन' : 'Reorder Planner', icon: RefreshCw },
        { id: 'expiry-deadstock', label: isHi ? 'एक्सपायरी व डेडस्टॉक' : 'Expiry & Dead Stock', icon: AlertOctagon },
        { id: 'khata', label: isHi ? 'डिजिटल खाता (उधार)' : 'Digital Khata Book', icon: BookOpen },
        { id: 'loyalty-feedback', label: isHi ? 'ग्राहक लॉयल्टी' : 'Customer Loyalty', icon: HeartHandshake }
      ]
    },
    {
      title: isHi ? 'मार्केट व नेटवर्क' : 'Market & Network',
      items: [
        { id: 'market-scout', label: isHi ? 'मार्केट स्काउट' : 'TinyFish Market Scout', icon: Search, badge: 'B2B' },
        { id: 'suppliers', label: isHi ? 'सप्लायर रेट तुलना' : 'Supplier Price Check', icon: Users },
        { id: 'group-buying', label: isHi ? 'सामूहिक खरीद' : 'Group Buying Pool', icon: Zap },
        { id: 'competitor-tracker', label: isHi ? 'प्रतियोगी भाव' : 'Competitor Price Index', icon: Compass },
        { id: 'festival-planner', label: isHi ? 'त्योहार मांग योजना' : 'Festival Demand Planner', icon: CalendarRange }
      ]
    },
    {
      title: isHi ? 'सिस्टम व रिपोर्ट्स' : 'System & Reports',
      items: [
        { id: 'reports-export', label: isHi ? 'वित्तीय रिपोर्ट्स' : 'Financial Reports', icon: FileText },
        { id: 'shop-profile', label: isHi ? 'दुकान प्रोफाइल' : 'Shop Profile & Settings', icon: Building2 }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer Body */}
      <div className={`relative w-4/5 max-w-xs flex flex-col h-full z-10 animate-in slide-in-from-left duration-200 border-r ${
        isDark ? 'bg-navy-950 border-navy-800' : 'bg-white border-slate-200 shadow-2xl'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-navy-800/80' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
              isDark 
                ? 'bg-gradient-to-br from-lime-accent/20 to-mint-accent/20 text-lime-accent border border-lime-accent/30' 
                : 'bg-navy-900 text-lime-accent'
            }`}>
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  Dukaan<span className="text-lime-accent">Saathi</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-lime-accent/15 text-lime-accent border border-lime-accent/30">
                  AI
                </span>
              </div>
              <p className={`text-[10px] truncate max-w-[150px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeShop.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-navy-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Language Switcher inside Drawer */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs ${
          isDark ? 'border-navy-800/60 bg-navy-900/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-600'
        }`}>
          <span className="flex items-center gap-1.5 font-medium">
            <Globe2 className="w-3.5 h-3.5 text-mint-accent" />
            {isHi ? 'भाषा बदलें' : 'Language'}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                language === 'en' 
                  ? 'bg-lime-accent text-navy-950 shadow-xs' 
                  : 'hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                language === 'hi' 
                  ? 'bg-lime-accent text-navy-950 shadow-xs' 
                  : 'hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 px-3 py-1">
                {section.icon && <section.icon className="w-3 h-3 text-mint-accent" />}
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {section.title}
                </span>
              </div>

              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors relative ${
                        isActive
                          ? isDark 
                            ? 'bg-navy-800 text-lime-accent font-semibold border-l-2 border-lime-accent shadow-surface-dark'
                            : 'bg-emerald-50 text-emerald-950 font-semibold border-l-2 border-emerald-500'
                          : isDark
                            ? 'text-slate-300 hover:text-white hover:bg-navy-900/60'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive 
                          ? isDark ? 'text-lime-accent' : 'text-emerald-600'
                          : item.isAi 
                            ? 'text-mint-accent' 
                            : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.isAi && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-lime-accent/20 text-lime-accent">
                          AI
                        </span>
                      )}
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-mint-accent/20 text-mint-accent">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
