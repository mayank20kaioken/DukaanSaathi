import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
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
  Store, 
  Compass, 
  CalendarRange, 
  FileText, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse
}) => {
  const { language, activeShop, metrics, workspaceMode } = useApp();
  const isHi = language === 'hi';
  const isLight = workspaceMode === 'light';

  // 5 clear, structured navigation groups containing all existing feature modules
  const navSections = [
    {
      group: isHi ? 'एआई कोपायलट' : 'AI Intelligence',
      badge: 'Signature',
      items: [
        { 
          id: 'voice-assistant', 
          label: isHi ? 'हिंदी वॉयस असिस्टेंट' : 'Hindi Voice Assistant', 
          icon: Mic,
          isHighlight: true
        },
        { 
          id: 'bill-scanner', 
          label: isHi ? 'एआई बिल स्कैनर' : 'AI Bill Scanner', 
          icon: ScanLine,
          isHighlight: true
        },
        { 
          id: 'ai-advisor', 
          label: isHi ? 'एआई बिज़नेस सलाहकार' : 'AI Business Advisor', 
          icon: BrainCircuit 
        },
        { 
          id: 'officer-scanner', 
          label: isHi ? 'अधिकारी आईडी सत्यापन' : 'Officer ID Verification', 
          icon: ShieldCheck 
        }
      ]
    },
    {
      group: isHi ? 'दुकान संचालन एवं वित्त' : 'Operations & Finance',
      items: [
        { 
          id: 'dashboard', 
          label: isHi ? 'कमांड सेंटर (डैशबोर्ड)' : 'Command Centre', 
          icon: LayoutDashboard 
        },
        { 
          id: 'profit-tracker', 
          label: isHi ? 'रियल-टाइम लाभ ट्रैकर' : 'Real-Time Profit Tracker', 
          icon: TrendingUp 
        },
        { 
          id: 'expenses', 
          label: isHi ? 'स्मार्ट खर्च प्रबंधक' : 'Smart Expense Manager', 
          icon: Receipt 
        },
        { 
          id: 'sales-pos', 
          label: isHi ? 'बिक्री इतिहास व बिलिंग' : 'Sales History & POS', 
          icon: ShoppingCart 
        }
      ]
    },
    {
      group: isHi ? 'स्टॉक एवं खाता' : 'Inventory & Khata',
      items: [
        { 
          id: 'inventory', 
          label: isHi ? 'उत्पाद सूची एवं स्टॉक' : 'Product Catalogue', 
          icon: Package,
          count: metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low` : undefined
        },
        { 
          id: 'stock-reorder', 
          label: isHi ? 'स्मार्ट स्टॉक व रीऑर्डर' : 'Stock Prediction & Reorders', 
          icon: RefreshCw 
        },
        { 
          id: 'expiry-deadstock', 
          label: isHi ? 'एक्सपायरी व डेड-स्टॉक' : 'Expiry & Dead-Stock', 
          icon: AlertOctagon 
        },
        { 
          id: 'khata', 
          label: isHi ? 'डिजिटल खाता (उधारी)' : 'Digital Khata Book', 
          icon: BookOpen 
        },
        { 
          id: 'loyalty-feedback', 
          label: isHi ? 'लॉयल्टी व ग्राहक राय' : 'Loyalty & Feedback', 
          icon: HeartHandshake 
        }
      ]
    },
    {
      group: isHi ? 'मार्केट एवं नेटवर्क' : 'Market & Network',
      items: [
        { 
          id: 'market-scout', 
          label: isHi ? 'TinyFish मार्केट स्काउट' : 'TinyFish Market Scout', 
          icon: Search,
          badge: 'B2B'
        },
        { 
          id: 'suppliers', 
          label: isHi ? 'सप्लायर रेट तुलना' : 'Supplier Directory & Rates', 
          icon: Users 
        },
        { 
          id: 'group-buying', 
          label: isHi ? 'ग्रुप बाइंग नेटवर्क' : 'Group Buying Network', 
          icon: Store 
        },
        { 
          id: 'competitor-tracker', 
          label: isHi ? 'प्रतियोगी भाव ट्रैकर' : 'Competitor Price Tracker', 
          icon: Compass 
        },
        { 
          id: 'festival-planner', 
          label: isHi ? 'त्योहार डिमांड प्लानर' : 'Festival Demand Planner', 
          icon: CalendarRange 
        }
      ]
    },
    {
      group: isHi ? 'सिस्टम एवं रिपोर्ट्स' : 'System & Reports',
      items: [
        { 
          id: 'reports-export', 
          label: isHi ? 'रिपोर्ट्स व सीएसवी' : 'Reports & Data Export', 
          icon: FileText 
        },
        { 
          id: 'risk-cashflow', 
          label: isHi ? 'कैश-फ्लो रडार व रिस्क' : 'Cash-Flow Radar & Risk', 
          icon: ShieldAlert 
        },
        { 
          id: 'shop-profile', 
          label: isHi ? 'दुकान प्रोफ़ाइल' : 'Store Profile & Branches', 
          icon: Building2 
        }
      ]
    }
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col transition-all duration-300 select-none border-r ${
        isLight 
          ? 'bg-white border-slate-200 shadow-sm' 
          : 'bg-navy-950 border-slate-800/80 shadow-2xl'
      } ${collapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand Header */}
      <div className={`p-4 flex items-center justify-between border-b ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-lime-accent/30 flex items-center justify-center shrink-0 shadow-lime-glow">
            <Store className="w-5 h-5 text-lime-accent" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-black text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Dukaan<span className="text-lime-accent">Saathi</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-lime-soft text-lime-accent border border-lime-accent/30">
                  AI
                </span>
              </div>
              <span className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isHi ? 'भारतीय किराना साथी' : 'Retail AI Partner'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-xl transition-colors ${
            isLight 
              ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' 
              : 'text-slate-400 hover:text-white hover:bg-navy-800'
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Shop Badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className={`px-3.5 py-2.5 rounded-2xl border flex items-center gap-2.5 ${
            isLight 
              ? 'bg-slate-50 border-slate-200' 
              : 'bg-navy-900/90 border-slate-800'
          }`}>
            <span className="w-2 h-2 rounded-full bg-lime-accent shrink-0" />
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                Current Store
              </p>
              <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {activeShop.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Structured Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                  {sec.group}
                </span>
                {sec.badge && (
                  <span className="text-[10px] font-semibold text-lime-accent px-1.5 py-0.2 rounded bg-lime-soft">
                    {sec.badge}
                  </span>
                )}
              </div>
            )}

            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-left relative ${
                    isActive
                      ? isLight
                        ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-300'
                        : 'bg-navy-800 text-white border border-slate-700/80 shadow-surface-dark'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900/80'
                  }`}
                >
                  {/* Left Active Accent Pill */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-lime-accent" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive 
                        ? 'text-lime-accent' 
                        : item.isHighlight 
                          ? 'text-mint-accent group-hover:text-lime-accent' 
                          : isLight ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}

                  {!collapsed && item.count && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      {item.count}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-mint-soft text-mint-accent">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className={`p-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-accent" />
              <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                AI Engine Active
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              v2.4
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title="AI Engine Active">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-accent animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
