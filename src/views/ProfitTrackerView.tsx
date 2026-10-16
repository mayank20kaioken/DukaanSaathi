import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart as PieIcon, 
  Download, 
  Info, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatINR, calculateProductMargins } from '../utils/formatters';

export const ProfitTrackerView: React.FC = () => {
  const { metrics, sales, expenses, products, language, theme } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  // What-If Simulator State
  const [selectedSimProduct, setSelectedSimProduct] = useState<string>(products[0]?.id || '');
  const [simPriceChangePercent, setSimPriceChangePercent] = useState<number>(5);
  const [simQuantityChangePercent, setSimQuantityChangePercent] = useState<number>(10);
  const [simDiscountPercent, setSimDiscountPercent] = useState<number>(0);

  const productForSim = products.find(p => p.id === selectedSimProduct) || products[0];

  // Simulation calculations
  const originalCost = productForSim?.costPrice || 100;
  const originalSelling = productForSim?.sellingPrice || 125;
  const baseUnitsPerMonth = 150; // Historical monthly baseline assumption

  const simNewSelling = originalSelling * (1 + simPriceChangePercent / 100) * (1 - simDiscountPercent / 100);
  const simNewUnits = Math.round(baseUnitsPerMonth * (1 + simQuantityChangePercent / 100));

  const originalMonthlyRevenue = originalSelling * baseUnitsPerMonth;
  const originalMonthlyGross = (originalSelling - originalCost) * baseUnitsPerMonth;

  const simMonthlyRevenue = simNewSelling * simNewUnits;
  const simMonthlyGross = (simNewSelling - originalCost) * simNewUnits;
  const monthlyGrossDelta = simMonthlyGross - originalMonthlyGross;

  // Expense breakdown data for Pie Chart
  const expenseCategoriesAgg = expenses.reduce((acc: any, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expenseCategoriesAgg).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#C7F36B', '#55C6A9', '#38BDF8', '#F59E0B', '#F43F5E', '#A855F7', '#EC4899'];

  return (
    <div className={`p-4 lg:p-7 space-y-7 max-w-7xl mx-auto transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b ${
        isDark ? 'border-navy-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-mint-accent/20 text-mint-accent flex items-center justify-center border border-mint-accent/40 shadow-mint-glow">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
              {isHi ? 'रियल-टाइम लाभ एवं मार्जिन विश्लेषक' : 'Real-Time Profit Tracker & Margin Engine'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accounting breakdown: Revenue, COGS, Gross Profit, Operating Expenses & What-If Profit Simulator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
            isDark ? 'bg-navy-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}>
            Accounting Standard: Accrual COGS
          </span>
        </div>
      </div>

      {/* Accounting Formula Banner */}
      <div className={`p-5 rounded-3xl border grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-center shadow-surface-dark ${
        isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-3 rounded-2xl text-center border ${
          isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Gross Revenue</span>
          <span className={`font-black text-base font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatINR(metrics.todaySales)}</span>
        </div>
        <div className="text-center font-black text-slate-400 text-xl hidden md:block">−</div>
        <div className={`p-3 rounded-2xl text-center border ${
          isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Cost of Goods (COGS)</span>
          <span className={`font-black text-base font-mono mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatINR(metrics.todayCogs)}</span>
        </div>
        <div className="text-center font-black text-slate-400 text-xl hidden md:block">=</div>
        <div className={`p-3 rounded-2xl text-center border ${
          isDark ? 'bg-navy-950 border-mint-accent/40' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <span className="text-[10px] text-mint-accent uppercase font-bold block">3. Gross Profit</span>
          <span className="font-black text-mint-accent text-base font-mono mt-0.5">{formatINR(metrics.todayGrossProfit)}</span>
        </div>
      </div>

      {/* WHAT-IF PROFIT SIMULATOR (Standout Feature) */}
      <div className={`rounded-3xl border p-6 shadow-2xl space-y-5 ${
        isDark 
          ? 'bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border-lime-accent/40' 
          : 'bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 border-emerald-500/40 shadow-lg'
      }`}>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-navy-950'}`}>
                  {isHi ? 'व्हाट-इफ़ लाभ सिम्युलेटर (What-If Profit Simulator)' : 'What-If Profit Simulator'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent/20 text-lime-accent border border-lime-accent/30">
                  Decision Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate price increments, promotional discounts or order volume expansion before changing counter prices.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Test Product</label>
            <select
              value={selectedSimProduct}
              onChange={(e) => setSelectedSimProduct(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none ${
                isDark 
                  ? 'bg-navy-950 border-slate-700 text-white focus:border-lime-accent' 
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
              }`}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (MRP: {formatINR(p.sellingPrice)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sliders Control Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slider 1: Selling Price Adjustment */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Price Change</span>
              <span className="font-extrabold text-lime-accent font-mono">{simPriceChangePercent > 0 ? `+${simPriceChangePercent}%` : `${simPriceChangePercent}%`}</span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={simPriceChangePercent}
              onChange={(e) => setSimPriceChangePercent(parseInt(e.target.value))}
              className="w-full accent-lime-accent cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              New simulated price: <strong className={isDark ? 'text-white font-mono' : 'text-slate-900 font-mono'}>{formatINR(simNewSelling)}</strong> (was {formatINR(originalSelling)})
            </p>
          </div>

          {/* Slider 2: Promotional Counter Discount */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Special Counter Discount</span>
              <span className="font-extrabold text-amber-400 font-mono">{simDiscountPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={simDiscountPercent}
              onChange={(e) => setSimDiscountPercent(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Customer discount reduction per unit: <strong className={isDark ? 'text-white font-mono' : 'text-slate-900 font-mono'}>{formatINR(originalSelling * (simDiscountPercent/100))}</strong>
            </p>
          </div>

          {/* Slider 3: Volume Elasticity / Expected Sales */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Expected Sales Volume Growth</span>
              <span className="font-extrabold text-mint-accent font-mono">{simQuantityChangePercent > 0 ? `+${simQuantityChangePercent}%` : `${simQuantityChangePercent}%`}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              step="5"
              value={simQuantityChangePercent}
              onChange={(e) => setSimQuantityChangePercent(parseInt(e.target.value))}
              className="w-full accent-mint-accent cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Simulated volume: <strong className={isDark ? 'text-white font-mono' : 'text-slate-900 font-mono'}>{simNewUnits} units / month</strong> (was {baseUnitsPerMonth})
            </p>
          </div>
        </div>

        {/* Simulation Output Delta Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400">Simulated Monthly Revenue</span>
            <p className={`text-xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatINR(simMonthlyRevenue)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Baseline: {formatINR(originalMonthlyRevenue)}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400">Simulated Monthly Gross Profit</span>
            <p className="text-xl font-black text-mint-accent font-mono mt-1">{formatINR(simMonthlyGross)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Baseline: {formatINR(originalMonthlyGross)}</p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-navy-950 border-lime-accent/40' : 'bg-emerald-50/80 border-emerald-300 shadow-xs'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Monthly Profit Delta</span>
            <p className={`text-2xl font-black font-mono mt-1 ${monthlyGrossDelta >= 0 ? 'text-lime-accent' : 'text-rose-400'}`}>
              {monthlyGrossDelta >= 0 ? `+${formatINR(monthlyGrossDelta)}` : formatINR(monthlyGrossDelta)}
            </p>
            <p className="text-[11px] font-bold mt-0.5 text-lime-accent">
              {monthlyGrossDelta >= 0 ? '✅ Net profit improves' : '⚠️ Volume does not cover margin loss'}
            </p>
          </div>
        </div>
      </div>

      {/* Expense Breakdown Pie & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 rounded-3xl p-5 border space-y-3 shadow-surface-dark ${
          isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-navy-950'}`}>Operating Expense Distribution</h3>
          <p className="text-xs text-slate-400">Breakdown of store costs by operational categories</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatINR(val), 'Expense']}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#101B2D' : '#FFFFFF', 
                    borderRadius: '12px', 
                    border: `1px solid ${isDark ? '#243850' : '#E2E8F0'}`,
                    color: isDark ? '#fff' : '#0F172A'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-xs justify-center pt-2">
            {pieData.map((item, idx) => (
              <span key={item.name} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
                isDark ? 'bg-navy-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}: {formatINR(item.value as number)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Profitability Diagnostic */}
        <div className={`lg:col-span-6 rounded-3xl p-5 border flex flex-col justify-between space-y-4 shadow-surface-dark ${
          isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-navy-950'}`}>Profit Diagnostic & Retained Earnings</h3>
            <p className="text-xs text-slate-400">Evaluating Kirana profitability benchmark against industry norms</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className={`p-3.5 rounded-2xl border space-y-2 ${
              isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Average Kirana FMCG Gross Margin:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>12% - 18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your Current Gross Margin:</span>
                <span className="font-bold text-lime-accent">19.2% (Top Quartile)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operating Cost-to-Sales Ratio:</span>
                <span className="font-bold text-mint-accent">8.4%</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isDark ? 'bg-navy-950 border-mint-accent/30' : 'bg-emerald-50/70 border-emerald-300'
            }`}>
              <Sparkles className="w-5 h-5 text-mint-accent shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Financial Recommendation</h4>
                <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your packaged groceries and staples show steady turnover. By ordering cooking oils in 12-pouch cases directly from verified B2B wholesale listings on TinyFish, you can expand your net profit margin by another 3.2%.
                </p>
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-navy-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-slate-400">Net Estimated Margin:</span>
            <span className="font-black text-lime-accent text-sm font-mono">+10.8% Net Earnings</span>
          </div>
        </div>
      </div>
    </div>
  );
};
