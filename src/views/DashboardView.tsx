import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  BookOpen, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Mic, 
  MicOff,
  ChevronRight, 
  Layers, 
  Info, 
  Calendar, 
  DollarSign, 
  Compass, 
  Zap, 
  Send,
  HelpCircle,
  BarChart3,
  Flame,
  AlertOctagon,
  PhoneCall,
  Volume2,
  VolumeX,
  RotateCcw,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Line 
} from 'recharts';
import { formatINR, calculateProductMargins } from '../utils/formatters';
import { DemoBadge, AiPoweredBadge } from '../components/common/DemoBadge';
import { VoiceAssistantResponse } from '../services/voiceAssistantEngine';

interface DashboardViewProps {
  onSelectView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectView }) => {
  const { 
    activeShop, 
    metrics, 
    healthScore, 
    dailyActions, 
    sales, 
    expenses, 
    products, 
    customers, 
    getCustomerBalance,
    openModal,
    language,
    theme,
    workspaceMode,
    voiceEngine
  } = useApp();

  const isHi = language === 'hi';
  const isDark = theme === 'dark';
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D'>('7D');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // AI Copilot Workspace State inside Dashboard
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<VoiceAssistantResponse | null>(null);
  const [isCopilotListening, setIsCopilotListening] = useState(false);
  const [isCopilotProcessing, setIsCopilotProcessing] = useState(false);
  const [copilotVoiceOn, setCopilotVoiceOn] = useState(true);

  // 7-day realistic trend data calculated consistent with demo sales
  const salesTrendData = [
    { day: '09 Oct', sales: 18450, expenses: 2400, grossProfit: 3120, netProfit: 720 },
    { day: '10 Oct', sales: 22100, expenses: 3100, grossProfit: 4180, netProfit: 1080 },
    { day: '11 Oct', sales: 26800, expenses: 1800, grossProfit: 5200, netProfit: 3400 },
    { day: '12 Oct', sales: 19400, expenses: 5880, grossProfit: 3600, netProfit: -2280 },
    { day: '13 Oct', sales: 28900, expenses: 1950, grossProfit: 5800, netProfit: 3850 },
    { day: '14 Oct', sales: 31200, expenses: 2650, grossProfit: 6240, netProfit: 3590 },
    { day: '15 Oct (Today)', sales: metrics.todaySales, expenses: metrics.todayExpenses, grossProfit: metrics.todayGrossProfit, netProfit: metrics.todayNetProfit },
  ];

  // Best selling products
  const bestSellers = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 4);

  // Dead stock candidate products (no recent sales)
  const deadStockCandidates = products.filter(p => p.demandLevel === 'Slow-Moving' || p.stockMovements.length === 0).slice(0, 3);
  const deadStockValue = deadStockCandidates.reduce((s, p) => s + (p.stock * p.costPrice), 0);

  // Upcoming expiry items
  const expiringSoon = products.filter(p => {
    if (!p.expiryDate) return false;
    const diff = Math.ceil((new Date(p.expiryDate).getTime() - new Date('2026-10-15').getTime()) / (1000 * 3600 * 24));
    return diff <= 30;
  }).slice(0, 3);

  // Top pending customer balances
  const topUdhaarCustomers = [...customers]
    .map(c => ({ ...c, balance: getCustomerBalance(c) }))
    .filter(c => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 4);

  // Curated smart queries for retail tasks
  const copilotPresets = [
    { label: isHi ? '💰 आज की कुल बिक्री व मुनाफा' : "Today's Revenue & Margins", query: 'Aaj ki total sale kitni hui?' },
    { label: isHi ? '📦 मैगी का खरीद व बिक्री रेट' : 'Maggi Wholesale & MRP Rate', query: 'Maggi ka buying aur selling price batao' },
    { label: isHi ? '📕 सबसे ज्यादा उधारी किसकी' : 'Top Customer Udhaar Balance', query: 'Kis customer ka sabse zyada udhaar baaki hai?' },
    { label: isHi ? '⚠️ कौन सा सामान खत्म होने वाला है' : 'Critical Low Stock SKUs', query: 'Kaunse products dobara order karne hain?' },
    { label: isHi ? '📞 सप्लायर शर्मा ट्रेडर्स का संपर्क' : 'Sharma Traders Phone Contact', query: 'Sharma Traders ka contact kya hai?' }
  ];

  // Audio Speech Synthesis
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !copilotVoiceOn) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Error:', e);
    }
  };

  // Run AI Query in-place
  const handleExecuteCopilotQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    setIsCopilotProcessing(true);
    setCopilotQuery(queryText);

    setTimeout(() => {
      const result = voiceEngine.processQuery(queryText);
      setCopilotResponse(result);
      setIsCopilotProcessing(false);
      if (copilotVoiceOn) {
        speakText(result.spokenText);
      }
    }, 300);
  };

  const grossMarginPercent = metrics.todaySales > 0 
    ? ((metrics.todayGrossProfit / metrics.todaySales) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className={`p-4 lg:p-7 space-y-6 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* 1. Header: Store Identity without Awkward Wrapping or Duplicate Action Buttons */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${
        isDark ? 'border-navy-800/80' : 'border-slate-200'
      }`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {isHi ? (activeShop.nameHi || activeShop.name) : activeShop.name}
            </h1>
            <DemoBadge />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isDark ? 'bg-navy-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {activeShop.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 mt-1">
            <span>{isHi ? 'मालिक' : 'Proprietor'}: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{activeShop.ownerName}</strong></span>
            <span>•</span>
            <span>{activeShop.city}</span>
            <span>•</span>
            <span className="font-mono text-lime-accent">GSTIN: {activeShop.gstin}</span>
          </div>
        </div>

        {/* Clean Context Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFormulaModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isDark ? 'bg-navy-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Accounting formula definitions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-mint-accent" />
            <span className="hidden sm:inline">Accounting Logic</span>
          </button>

          <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
            isDark ? 'bg-navy-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <span className="w-2 h-2 rounded-full bg-lime-accent animate-pulse" />
            <span>Accrual Live Sync</span>
          </span>
        </div>
      </div>

      {/* 2. Executive Business Overview: 4 Unified KPI Cards with Aligned Heights & Rich Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Today's Gross Sales (Hero) */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
          isDark 
            ? 'bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border-lime-accent/40 shadow-surface-dark' 
            : 'bg-gradient-to-br from-white to-emerald-50/30 border-emerald-500/30 shadow-md'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <ShoppingCart className="w-3.5 h-3.5 text-lime-accent" />
                <span>{isHi ? 'आज की कुल बिक्री' : "Today's Gross Sales"}</span>
              </span>
              <span className="flex items-center text-[10px] font-bold text-lime-accent bg-lime-accent/15 px-2 py-0.5 rounded-full border border-lime-accent/30 font-mono">
                <ArrowUpRight className="w-3 h-3" /> +12.4%
              </span>
            </div>

            <p className={`text-3xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {formatINR(metrics.todaySales)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Generated from <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{sales.length} customer bills</strong> today
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <span className="text-slate-400">Gross Margin:</span>
            <span className="font-bold text-mint-accent font-mono">
              {formatINR(metrics.todayGrossProfit)} ({grossMarginPercent}%)
            </span>
          </div>
        </div>

        {/* KPI 2: Net Operating Profit */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-mint-accent" />
                <span>{isHi ? 'शुद्ध परिचालन लाभ' : 'Net Operating Profit'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint-accent/15 text-mint-accent">
                Positive Cash
              </span>
            </div>

            <p className={`text-3xl font-black font-mono tracking-tight ${
              metrics.todayNetProfit >= 0 ? 'text-lime-accent' : 'text-rose-400'
            }`}>
              {formatINR(metrics.todayNetProfit)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Gross Profit minus <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{formatINR(metrics.todayExpenses)}</strong> daily expenses
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <span className="text-slate-400">Operating Margin:</span>
            <span className="font-bold text-lime-accent font-mono">
              {metrics.todaySales > 0 ? ((metrics.todayNetProfit / metrics.todaySales) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>

        {/* KPI 3: Customer Udhaar (Khata) */}
        <div 
          onClick={() => onSelectView('khata')}
          className={`p-5 rounded-3xl border flex flex-col justify-between cursor-pointer group transition-all ${
            isDark 
              ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark hover:border-amber-400/50' 
              : 'bg-white border-slate-200 shadow-md hover:border-amber-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? 'ग्राहक कुल उधारी (खाता)' : 'Customer Credit'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300">
                4 Overdue
              </span>
            </div>

            <p className="text-3xl font-black font-mono tracking-tight text-amber-400">
              {formatINR(metrics.totalOutstandingUdhaar)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Pending across <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{customers.length} ledger accounts</strong>
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
              <span>View Ledger Book</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* KPI 4: Inventory Valuation & Low Stock */}
        <div 
          onClick={() => onSelectView('inventory')}
          className={`p-5 rounded-3xl border flex flex-col justify-between cursor-pointer group transition-all ${
            isDark 
              ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark hover:border-blue-400/50' 
              : 'bg-white border-slate-200 shadow-md hover:border-blue-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-400" />
                <span>{isHi ? 'स्टॉक कुल मूल्य' : 'Inventory Value'}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                metrics.lowStockCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-mint-accent/20 text-mint-accent'
              }`}>
                <AlertTriangle className="w-3 h-3" />
                <span>{metrics.lowStockCount} Low Stock</span>
              </span>
            </div>

            <p className="text-3xl font-black font-mono tracking-tight text-blue-400">
              {formatINR(metrics.totalInventoryValue)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Valued across <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{products.length} catalogued SKUs</strong>
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <span className="text-slate-400 group-hover:text-white transition-colors">
              Manage Catalog →
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary Analytics Row: Prominent Sales & Margin Trend Chart (lg:col-span-8) + Cash Flow Radar (lg:col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Prominent Sales & Profit Margin Area Chart */}
        <div className={`lg:col-span-8 rounded-3xl p-6 border space-y-4 ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  {isHi ? 'बिक्री, सकल लाभ एवं खर्च ट्रेंड' : 'Revenue, Gross Margin & Operating Outlays'}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Accrual INR (₹)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily turnover vs wholesale cost of goods and operational store overheads
              </p>
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setChartPeriod('7D')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartPeriod === '7D' 
                    ? 'bg-lime-accent text-navy-950 shadow-sm' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Trend
              </button>
              <button
                onClick={() => setChartPeriod('30D')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartPeriod === '30D' 
                    ? 'bg-lime-accent text-navy-950 shadow-sm' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Trajectory
              </button>
            </div>
          </div>

          {/* Prominent Area Chart (Ample Height) */}
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C7F36B" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#C7F36B" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="chartProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#55C6A9" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#55C6A9" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="day" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#101B2D' : '#FFFFFF', 
                    borderColor: isDark ? '#243850' : '#E2E8F0', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: isDark ? '#fff' : '#0F172A',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(val: any) => [formatINR(val), '']}
                />
                <Area type="monotone" dataKey="sales" name="Gross Sales" stroke="#C7F36B" strokeWidth={2.5} fillOpacity={1} fill="url(#chartSalesGrad)" />
                <Area type="monotone" dataKey="grossProfit" name="Gross Profit" stroke="#55C6A9" strokeWidth={2} fillOpacity={1} fill="url(#chartProfitGrad)" />
                <Line type="monotone" dataKey="expenses" name="Operating Expenses" stroke="#F87171" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Performance Metrics Strip */}
          <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-lime-accent" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Gross Sales</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-mint-accent" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Gross Margin</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Store Expenses</span>
              </span>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              Avg Daily Run-rate: <strong className={isDark ? 'text-white' : 'text-slate-800'}>₹23,700</strong>
            </div>
          </div>
        </div>

        {/* Cash-Flow Radar & Health Diagnostic */}
        <div className={`lg:col-span-4 rounded-3xl p-6 border flex flex-col justify-between space-y-4 ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-lime-accent animate-spin" />
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  {isHi ? 'कैश-फ्लो रडार' : 'Cash-Flow Radar'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-accent/15 text-lime-accent border border-lime-accent/30 font-mono">
                Next 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Projected counter liquidity vs wholesale supplier dues & rent
            </p>
          </div>

          <div className="space-y-2.5">
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Expected Udhaar Repayments:</span>
                <span className="font-bold text-lime-accent font-mono">+{formatINR(4200)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sharma Traders Wholesale Due:</span>
                <span className="font-bold text-rose-400 font-mono">-{formatINR(18450)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Counter Cash Sales:</span>
                <span className="font-bold text-mint-accent font-mono">+{formatINR(24500)}</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? 'bg-navy-950 border-lime-accent/40' : 'bg-emerald-50/70 border-emerald-300'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Projected Net Cash Buffer
                </span>
                <p className="text-xl font-black text-lime-accent font-mono">+{formatINR(10250)}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-lime-accent/20 text-lime-accent">
                Safe Buffer
              </span>
            </div>
          </div>

          {/* Business Health Summary Mini Pill */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime-accent" />
              <span className="text-slate-400">Store Health Score:</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold font-mono">
              <span className="text-lime-accent text-sm">{healthScore.score}</span>
              <span className="text-slate-500 text-[11px]">/ 100</span>
              <span className="text-[10px] text-lime-accent px-1.5 py-0.2 rounded bg-lime-accent/15 uppercase font-sans font-bold ml-1">
                {healthScore.rating}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectView('risk-cashflow')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-colors ${
              isDark 
                ? 'bg-navy-950 hover:bg-navy-800 text-slate-200 border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <span>{isHi ? 'विस्तृत कैश-फ्लो रडार खोलें' : 'Open Full Cash-Flow & Risk Radar'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. SIGNATURE AI RETAIL COPILOT WORKSPACE (Flagship Distinctive Experience) */}
      <div className={`p-5 lg:p-6 rounded-3xl border relative overflow-hidden transition-all shadow-xl ${
        isDark 
          ? 'bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border-lime-accent/40 shadow-card-dark' 
          : 'bg-gradient-to-br from-emerald-950 via-navy-950 to-navy-900 text-white border-emerald-500/40'
      }`}>
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-accent/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        <div className="space-y-4 relative z-10">
          
          {/* Top Bar: Brand, Status & Audio Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-accent to-emerald-400 text-navy-950 flex items-center justify-center font-black shadow-lime-glow">
                  <Sparkles className="w-5 h-5 text-navy-950" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-lime-accent ring-2 ring-navy-950 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white tracking-tight">
                    DukaanSaathi AI Copilot
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent/20 text-lime-accent border border-lime-accent/30 font-mono">
                    Hindi & Hinglish
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Natural language Kirana assistant linked live to your inventory rates, debtor khata and supplier records.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCopilotVoiceOn(!copilotVoiceOn)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-navy-900/80 hover:bg-navy-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title={copilotVoiceOn ? "Voice audio feedback enabled" : "Voice muted"}
              >
                {copilotVoiceOn ? <Volume2 className="w-3.5 h-3.5 text-lime-accent" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copilotVoiceOn ? 'Audio On' : 'Muted'}</span>
              </button>

              <button
                onClick={() => openModal('VOICE_ASSISTANT')}
                className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-lime-accent border border-lime-accent/30 text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>Open Full Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Search Console */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal('VOICE_ASSISTANT')}
              className="w-12 h-12 rounded-2xl bg-lime-accent hover:bg-lime-hover text-navy-950 flex items-center justify-center font-bold shadow-lime-glow shrink-0 transition-transform active:scale-95 cursor-pointer"
              title="Click to speak in Hindi or English"
            >
              <Mic className="w-5 h-5 animate-pulse" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteCopilotQuery(copilotQuery)}
                placeholder={isHi ? "हिंदी में पूछें: 'आज का शुद्ध मुनाफा कितना है?', 'मैगी का मार्जिन बताओ'..." : "Ask in Hindi/English: 'Maggi selling price', 'Today's sales', 'Sharma Traders contact'..."}
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-navy-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-accent transition-colors"
              />
              <button
                onClick={() => handleExecuteCopilotQuery(copilotQuery)}
                disabled={!copilotQuery.trim() || isCopilotProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-lime-accent text-navy-950 disabled:opacity-30 hover:bg-lime-hover transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Quick Inquiries:
            </span>
            {copilotPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteCopilotQuery(preset.query)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-navy-900/90 hover:bg-navy-800 text-lime-accent border border-lime-accent/30 hover:border-lime-accent transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Live In-Place Response Preview Card */}
          {isCopilotProcessing && (
            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-center gap-3 animate-in fade-in">
              <Sparkles className="w-5 h-5 text-lime-accent animate-spin" />
              <span className="text-xs text-slate-300 font-medium">
                Querying live shop database & computing margins...
              </span>
            </div>
          )}

          {copilotResponse && !isCopilotProcessing && (
            <div className="p-4 rounded-2xl bg-navy-900 border border-lime-accent/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-accent flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-accent" />
                  <span>AI Business Partner Response</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(copilotResponse.spokenText)}
                    className="text-xs text-mint-accent hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={() => setCopilotResponse(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Hindi & English Transcript */}
              <div className="space-y-1">
                <p className="font-hindi text-sm lg:text-base text-white font-semibold leading-relaxed">
                  {copilotResponse.textHi}
                </p>
                <p className="text-xs text-slate-400">
                  {copilotResponse.textEn}
                </p>
              </div>

              {/* Live Verifiable Database Evidence Card */}
              {copilotResponse.evidenceData && (
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-xs">
                  {copilotResponse.evidenceType === 'PRODUCT' && copilotResponse.evidenceData.product && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{copilotResponse.evidenceData.product.name}</p>
                        <p className="text-[11px] text-slate-400">
                          Stock: {copilotResponse.evidenceData.product.stock} {copilotResponse.evidenceData.product.unit}s • Supplier: {copilotResponse.evidenceData.product.supplierName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Wholesale Buy Rate</span>
                          <span className="font-bold text-white font-mono">{formatINR(copilotResponse.evidenceData.product.costPrice)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Counter MRP</span>
                          <span className="font-bold text-lime-accent font-mono">{formatINR(copilotResponse.evidenceData.product.sellingPrice)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-mint-accent block uppercase font-bold">Margin Rate</span>
                          <span className="font-black text-mint-accent font-mono">{copilotResponse.evidenceData.margins?.marginPercent}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {copilotResponse.evidenceType === 'CUSTOMER' && copilotResponse.evidenceData.topDebtor && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{copilotResponse.evidenceData.topDebtor.name}</p>
                        <p className="text-[11px] text-slate-400">Phone: {copilotResponse.evidenceData.topDebtor.phone} • {copilotResponse.evidenceData.topDebtor.overdueDays} days overdue</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl text-sm font-black bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
                        Total Balance: {formatINR(copilotResponse.evidenceData.topDebtor.computedBalance)}
                      </span>
                    </div>
                  )}

                  {copilotResponse.evidenceType === 'SUPPLIER' && copilotResponse.evidenceData.supplier && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white text-sm">{copilotResponse.evidenceData.supplier.name}</p>
                        <p className="text-[11px] text-slate-400">Contact: {copilotResponse.evidenceData.supplier.contactPerson} • {copilotResponse.evidenceData.supplier.category}</p>
                      </div>
                      <a
                        href={`tel:${copilotResponse.evidenceData.supplier.phone}`}
                        className="px-3.5 py-1.5 rounded-xl bg-lime-accent text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call {copilotResponse.evidenceData.supplier.phone}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Compact Business Action Feed (lg:col-span-7) & Retail Stock Watch (lg:col-span-5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Compact Prioritized AI Action Feed */}
        <div className={`lg:col-span-7 rounded-3xl p-6 border flex flex-col justify-between space-y-4 ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-mint-accent/20 text-mint-accent flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  {isHi ? 'दैनिक बिज़नेस एक्शन प्लान' : "Prioritized AI Business Action Feed"}
                </h3>
                <p className="text-xs text-slate-400">
                  Priority operational recommendations generated from shop inventory and ledger data
                </p>
              </div>
            </div>
            <AiPoweredBadge label="Live Engine" />
          </div>

          {/* Action Items List with No Text Overflow & Clear Single Action */}
          <div className="space-y-2.5 flex-1">
            {dailyActions.map(action => (
              <div
                key={action.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark 
                    ? 'bg-navy-950/80 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      action.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      action.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 
                      'bg-lime-accent/20 text-lime-accent border border-lime-accent/30'
                    }`}>
                      {action.priority}
                    </span>
                    <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {isHi ? action.titleHi : action.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {isHi ? action.descriptionHi : action.description}
                  </p>
                  <p className="text-[11px] text-mint-accent font-semibold font-mono">
                    Expected Impact: {action.impact}
                  </p>
                </div>

                <button
                  onClick={() => onSelectView(action.actionRoute)}
                  className="px-3.5 py-2 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 text-xs font-bold shrink-0 transition-colors flex items-center justify-center gap-1 shadow-sm active:scale-95"
                >
                  <span>{action.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Retail Stock Watch: Best Sellers, Dead Stock & Expiries */}
        <div className={`lg:col-span-5 rounded-3xl p-6 border flex flex-col justify-between space-y-4 ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-lime-accent" />
                <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  Fast-Moving & Stock Alerts
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Top SKUs</span>
            </div>
            <p className="text-xs text-slate-400">
              High-velocity best sellers and urgent clearance candidates
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Top Seller Item */}
            {bestSellers.slice(0, 2).map(p => (
              <div key={p.id} className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-accent" />
                    <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Stock: {p.stock} {p.unit}s</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-lime-accent font-mono">{formatINR(p.sellingPrice)}</p>
                  <p className="text-[10px] text-mint-accent">+{formatINR(p.sellingPrice - p.costPrice)} margin</p>
                </div>
              </div>
            ))}

            {/* Dead stock item */}
            {deadStockCandidates.slice(0, 1).map(p => (
              <div key={p.id} className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</p>
                  </div>
                  <p className="text-[11px] text-amber-400/90 mt-0.5">Dead-Stock: {p.lastSaleDate || 'No sale in 60d'}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  15% Off
                </span>
              </div>
            ))}

            {/* Expiry item */}
            {expiringSoon.slice(0, 1).map(p => (
              <div key={p.id} className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</p>
                  </div>
                  <p className="text-[11px] text-rose-400 mt-0.5">Expires: {p.expiryDate}</p>
                </div>
                <button
                  onClick={() => openModal('RECORD_SALE')}
                  className="px-2.5 py-1 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                >
                  Clearance
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectView('inventory')}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-colors ${
              isDark 
                ? 'bg-navy-950 hover:bg-navy-800 text-slate-200 border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <span>Open Complete Product Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Recent Customer Bills & Pending Udhaar Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Recent Transactions */}
        <div className={`rounded-3xl p-6 border space-y-3 ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {isHi ? 'हालिया काउंटर बिल' : 'Recent Customer Bills'}
            </h3>
            <button
              onClick={() => onSelectView('sales-pos')}
              className="text-xs text-lime-accent hover:underline font-semibold"
            >
              View All ({sales.length}) →
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <table className="w-full text-left text-xs">
              <thead className={`${isDark ? 'bg-navy-900 text-slate-400' : 'bg-slate-100 text-slate-600'} text-[10px] uppercase`}>
                <tr>
                  <th className="py-2.5 px-3">Invoice</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-2 text-center">Mode</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {sales.slice(0, 4).map(s => (
                  <tr key={s.id} className={isDark ? 'hover:bg-navy-900/50' : 'hover:bg-slate-100/70'}>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{s.invoiceNo}</td>
                    <td className={`py-2.5 px-3 font-medium truncate max-w-[130px] ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {s.customerName}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.paymentMode === 'UDHAAR' ? 'bg-rose-500/20 text-rose-300' :
                        s.paymentMode === 'UPI' ? 'bg-lime-accent/20 text-lime-accent' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {s.paymentMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-lime-accent font-mono">{formatINR(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Customer Payments */}
        <div className={`rounded-3xl p-6 border space-y-3 ${
          isDark 
            ? 'bg-navy-900/90 border-slate-800 shadow-surface-dark' 
            : 'bg-white border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {isHi ? 'लंबित ग्राहक उधारी' : 'Pending Customer Payments (Udhaar)'}
            </h3>
            <button
              onClick={() => onSelectView('khata')}
              className="text-xs text-lime-accent hover:underline font-semibold"
            >
              Open Digital Khata →
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <table className="w-full text-left text-xs">
              <thead className={`${isDark ? 'bg-navy-900 text-slate-400' : 'bg-slate-100 text-slate-600'} text-[10px] uppercase`}>
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-2 text-center">Overdue</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {topUdhaarCustomers.map(c => (
                  <tr key={c.id} className={isDark ? 'hover:bg-navy-900/50' : 'hover:bg-slate-100/70'}>
                    <td className="py-2.5 px-3">
                      <p className={`font-bold truncate max-w-[140px] ${isDark ? 'text-white' : 'text-slate-800'}`}>{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.phone}</p>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.overdueDays > 30 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {c.overdueDays}d
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-400 font-mono">
                      {formatINR(c.balance)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => onSelectView('khata')}
                        className="px-2.5 py-1 rounded-lg bg-lime-accent/15 hover:bg-lime-accent/25 text-lime-accent text-[11px] font-semibold transition-colors"
                      >
                        Khata
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Accounting Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-navy-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-lime-accent" />
                <span>Accounting & Profit Calculations</span>
              </h3>
              <button 
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 space-y-1">
                <span className="font-bold text-lime-accent uppercase tracking-wider text-[10px]">1. Accrual Gross Profit</span>
                <p><strong>Formula:</strong> Today's Sales Revenue − Cost of Goods Sold (COGS)</p>
                <p className="text-slate-400 text-[11px]">COGS accounts for the wholesale acquisition cost of items sold, not the cash spent on bulk restocks.</p>
              </div>

              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 space-y-1">
                <span className="font-bold text-mint-accent uppercase tracking-wider text-[10px]">2. Net Operating Profit</span>
                <p><strong>Formula:</strong> Gross Profit − Operating Expenses</p>
                <p className="text-slate-400 text-[11px]">Deducts daily operational outlays (shop rent, helper wages, tea, electricity) from earned gross margin.</p>
              </div>

              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">3. Outstanding Khata Udhaar</span>
                <p><strong>Formula:</strong> Σ (Total Credit Given − Total Repayments Received)</p>
                <p className="text-slate-400 text-[11px]">Calculated chronologically from individual customer ledger transactions.</p>
              </div>
            </div>

            <button
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-2.5 rounded-xl bg-lime-accent text-navy-950 font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
