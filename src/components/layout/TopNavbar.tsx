import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  Languages, 
  Plus, 
  Store, 
  Moon, 
  SunMedium, 
  Check, 
  ChevronDown, 
  Calendar,
  Command
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  onSelectView: (view: string) => void;
  onOpenNotifications: () => void;
  hasUnreadNotifications: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileMenu,
  onSelectView,
  onOpenNotifications,
  hasUnreadNotifications
}) => {
  const { 
    language, 
    setLanguage, 
    shops, 
    activeShop, 
    setActiveShopId,
    workspaceMode,
    setWorkspaceMode,
    openModal,
    products,
    customers,
    suppliers
  } = useApp();

  const isHi = language === 'hi';
  const isLight = workspaceMode === 'light';

  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const shopMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setShopMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const searchResults = searchQuery.trim().length > 1 ? {
    products: products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.nameHi && p.nameHi.includes(searchQuery)) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    customers: customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    ).slice(0, 3),
    suppliers: suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 2)
  } : null;

  const todayDateString = new Date('2026-10-15').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className={`sticky top-0 z-30 h-16 border-b transition-colors duration-200 flex items-center justify-between px-4 lg:px-6 backdrop-blur-md ${
      isLight 
        ? 'bg-white/95 border-slate-200 shadow-xs' 
        : 'bg-navy-900/95 border-navy-800 shadow-surface-dark'
    }`}>
      {/* Left Area: Mobile hamburger & Shop Selector */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile toggle */}
        <button
          onClick={onOpenMobileMenu}
          className={`lg:hidden p-2 rounded-xl transition-colors ${
            isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-navy-800'
          }`}
          aria-label="Open mobile menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Shop Switcher */}
        <div className="relative" ref={shopMenuRef}>
          <button
            onClick={() => setShopMenuOpen(!shopMenuOpen)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all text-left ${
              isLight 
                ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-300 text-slate-800' 
                : 'bg-navy-800/80 hover:bg-navy-750 border-slate-700/70 text-slate-100'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-lime-soft flex items-center justify-center text-lime-accent shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:flex flex-col min-w-0 pr-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isHi ? 'सक्रिय दुकान' : 'Active Store'}
              </span>
              <span className="text-xs font-bold truncate max-w-[180px] md:max-w-[240px]">
                {activeShop.name}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          </button>

          {/* Shop Switcher Dropdown */}
          {shopMenuOpen && (
            <div className={`absolute left-0 mt-2 w-80 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 ${
              isLight ? 'bg-white border-slate-200' : 'bg-navy-800 border-slate-700'
            }`}>
              <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b ${
                isLight ? 'text-slate-400 border-slate-100' : 'text-slate-400 border-slate-700/60'
              }`}>
                {isHi ? 'दुकान शाखा बदलें' : 'Switch Store Location'}
              </div>
              <div className="space-y-1 mt-1">
                {shops.map(s => {
                  const isSelected = s.id === activeShop.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveShopId(s.id);
                        setShopMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                        isSelected 
                          ? isLight 
                            ? 'bg-slate-100 border border-slate-300 text-slate-900 font-semibold' 
                            : 'bg-navy-700 border border-lime-accent/40 text-white font-semibold'
                          : isLight 
                            ? 'hover:bg-slate-50 text-slate-600' 
                            : 'hover:bg-navy-900/60 text-slate-300'
                      }`}
                    >
                      <Store className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-lime-accent' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{s.name}</p>
                        <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {s.address}, {s.city}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-lime-accent shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Context Badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium border shrink-0 ${
          isLight ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-navy-950/60 border-slate-800 text-slate-300'
        }`}>
          <Calendar className="w-3.5 h-3.5 text-lime-accent" />
          <span className="whitespace-nowrap">{todayDateString}</span>
        </div>
      </div>

      {/* Middle Area: Generous Global Search */}
      <div className="relative flex-1 max-w-lg lg:max-w-xl mx-4 sm:mx-6 hidden sm:block" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder={isHi ? "खोजें: उत्पाद नाम, ग्राहक उधारी, सप्लायर..." : "Search catalogue, khata accounts, suppliers..."}
            className={`w-full pl-10 pr-12 py-2 rounded-2xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-lime-accent/30 ${
              isLight 
                ? 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-300' 
                : 'bg-navy-800/90 border border-slate-700/70 text-white placeholder-slate-400 focus:border-lime-accent/50'
            }`}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          ) : (
            <span className="hidden lg:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-navy-950/40 text-slate-400 border border-slate-700/50">
              ⌘K
            </span>
          )}
        </div>

        {/* Live Search Instant Results Popover */}
        {searchFocused && searchResults && (
          <div className={`absolute left-0 right-0 mt-2 rounded-2xl border shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-navy-800 border-slate-700 text-white'
          }`}>
            {searchResults.products.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-slate-400">Products</span>
                <div className="mt-1 space-y-1">
                  {searchResults.products.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectView('inventory');
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs ${
                        isLight ? 'hover:bg-slate-100' : 'hover:bg-navy-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          Stock: {p.stock} {p.unit}s • Cost: {formatINR(p.costPrice)}
                        </p>
                      </div>
                      <span className="font-bold text-lime-accent">{formatINR(p.sellingPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.customers.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 text-slate-400">Khata Accounts</span>
                <div className="mt-1 space-y-1">
                  {searchResults.customers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectView('khata');
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs ${
                        isLight ? 'hover:bg-slate-100' : 'hover:bg-navy-700'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.phone}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400">
                        View Khata
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.products.length === 0 && searchResults.customers.length === 0 && (
              <div className={`py-4 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                No matching product or customer found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Single High-Priority Record Sale Action & Utility Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* PROMINENT PRIMARY ACTION: Record Sale (Single Global Primary CTA) */}
        <button
          onClick={() => openModal('RECORD_SALE')}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-lime-accent hover:bg-lime-hover text-navy-950 font-black text-xs tracking-tight shadow-lime-glow transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isHi ? 'नई बिक्री दर्ज करें' : 'Record Sale'}</span>
        </button>

        <div className={`h-6 w-px mx-0.5 sm:mx-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className={`px-2.5 py-1.5 rounded-2xl border text-xs font-bold transition-colors ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-navy-800 hover:bg-navy-750 border-slate-700 text-slate-200'
          }`}
          title="Switch language between Hindi and English"
        >
          {language === 'en' ? 'हिन्दी' : 'EN'}
        </button>

        {/* Theme switcher */}
        <button
          onClick={() => setWorkspaceMode(workspaceMode === 'dark' ? 'light' : 'dark')}
          className={`p-2 rounded-2xl border transition-colors ${
            isLight 
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
              : 'bg-navy-800 hover:bg-navy-700 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isLight ? "Switch to Midnight Navy Dark Shell" : "Switch to Clean Light Workspace"}
        >
          {isLight ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <SunMedium className="w-4 h-4 text-amber-300" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className={`relative p-2 rounded-2xl border transition-colors ${
            isLight 
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
              : 'bg-navy-800 hover:bg-navy-700 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Store Alerts"
        >
          <Bell className="w-4 h-4" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Shopkeeper Profile Avatar */}
        <div 
          onClick={() => onSelectView('shop-profile')}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="Store profile & owner settings"
        >
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-lime-accent to-emerald-400 text-navy-950 font-black flex items-center justify-center text-xs shadow-sm">
            RG
          </div>
        </div>
      </div>
    </header>
  );
};
