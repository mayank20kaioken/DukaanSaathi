import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BrainCircuit, 
  Sparkles, 
  CalendarRange, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Info,
  Clock,
  Check
} from 'lucide-react';
import { DEMO_FESTIVALS } from '../data/mockData';
import { formatINR } from '../utils/formatters';

export const AiAdvisorView: React.FC = () => {
  const { products, sales, customers, language } = useApp();
  const isHi = language === 'hi';

  const [selectedFestivalId, setSelectedFestivalId] = useState<string>(DEMO_FESTIVALS[0].id);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({
    'Order special Diwali gift boxes from Agarwal Distributors before 22 Oct': true
  });

  const activeFestival = DEMO_FESTIVALS.find(f => f.id === selectedFestivalId) || DEMO_FESTIVALS[0];

  const handleToggleCheck = (item: string) => {
    setCheckedChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Structured Evidence-Backed Recommendations
  const aiRecommendations = [
    {
      id: 'rec-1',
      category: 'INVENTORY OPTIMIZATION',
      headline: 'Bulk Restock Cooking Oil Before Diwali Price Spike',
      headlineHi: 'दिवाली से पहले रिफाइंड तेल का थोक स्टॉक करें',
      recommendation: 'Increase Fortune Refined Sunflower Oil stock from 18 to 60 pouches before 25th October.',
      recommendationHi: 'फॉर्च्यून रिफाइंड तेल का स्टॉक 18 से बढ़ाकर 60 पैकेट कर लें।',
      evidence: {
        metric: 'Diwali Festive Run Rate: 3.4x average volume',
        records: 'Recorded sales show 42% edible oil surge during festival sweet preparation',
        source: 'TinyFish wholesale listings indicate upcoming manufacturer price revision'
      },
      confidence: '92% High Confidence',
      suggestedAction: 'Scout Udaan / Sharma Traders Wholesale rates'
    },
    {
      id: 'rec-2',
      category: 'WORKING CAPITAL RECOVERY',
      headline: 'Collect Udhaar From Long Overdue Tailor Ramesh Kumar',
      headlineHi: 'मास्टर रमेश कुमार से 22 दिन पुरानी उधारी वसूलें',
      recommendation: 'Send polite WhatsApp payment reminder for ₹3,300 before Dhanteras festival shopping.',
      recommendationHi: 'धनतेरस से पहले ₹3,300 के भुगतान हेतु व्हाट्सएप संदेश भेजें।',
      evidence: {
        metric: 'Overdue duration: 22 days (highest outstanding in local khata)',
        records: 'Ledger shows 3 consecutive udhaar transactions without repayment since 02 Oct',
        source: 'Customer Khata Chronological Audit'
      },
      confidence: '88% High Confidence',
      suggestedAction: 'Draft Polite WhatsApp in Hindi'
    },
    {
      id: 'rec-3',
      category: 'MARGIN EXPANSION',
      headline: 'Repackage Garam Masala Into Festival Spice Combos',
      headlineHi: 'गरम मसाला व खड़े मसालों के कॉम्बो पैकेट बनाएं',
      recommendation: 'Bundle Catch Garam Masala (100g) with Tata Salt and Everest Kasoori Methi for ₹185 festive price.',
      recommendationHi: 'मसाला कॉम्बो बनाकर ₹185 में बेचें, जिससे 24% मार्जिन मिलेगा।',
      evidence: {
        metric: 'Combined Cost: ₹146.50 • Combo Selling: ₹185.00',
        records: 'Kasoori Methi is slow-moving (expiring soon). Bundling liquidates stock.',
        source: 'Dead-Stock & Margin Cross-Analysis'
      },
      confidence: '85% Solid Opportunity',
      suggestedAction: 'Create Promo Bundle on POS'
    }
  ];

  return (
    <div className="p-4 lg:p-7 space-y-7 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lime-accent/20 to-mint-accent/20 text-lime-accent flex items-center justify-center border border-lime-accent/40 shadow-lime-glow">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {isHi ? 'एआई बिज़नेस सलाहकार एवं मांग पूर्वानुमान' : 'AI Business Advisor & Demand Forecasting'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent/20 text-lime-accent border border-lime-accent/30">
                  Evidence-Backed
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data-backed retail recommendations with verifiable calculation traces, limitations & festival demand planning.
          </p>
        </div>
      </div>

      {/* FESTIVAL DEMAND PLANNER (Standout Feature) */}
      <div className="rounded-3xl bg-navy-800/95 border border-slate-700 p-6 shadow-card-dark space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CalendarRange className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Festival Demand Planner (भारतीय त्योहार प्लानर)</h3>
              <p className="text-xs text-slate-400">
                Advance stock preparation for Diwali, Chhath Puja, Holi, and Raksha Bandhan
              </p>
            </div>
          </div>

          {/* Festival Switcher Tabs */}
          <div className="flex items-center gap-2">
            {DEMO_FESTIVALS.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFestivalId(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFestivalId === f.id
                    ? 'bg-amber-400 text-navy-950 shadow-md'
                    : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.name.split(' ')[0]} ({f.daysRemaining}d left)
              </button>
            ))}
          </div>
        </div>

        {/* Selected Festival Spotlight */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-white text-base">{activeFestival.name}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-accent/15 text-lime-accent">
                +{activeFestival.projectedSalesGrowth}% Projected Surge
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Festive Dates: <strong className="text-white">{activeFestival.dates}</strong> • {activeFestival.daysRemaining} days remaining for stock dispatch
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Assumed Surge Rate</span>
            <span className="text-sm font-black text-amber-300 font-mono">Based on Q3 Festive Cycle</span>
          </div>
        </div>

        {/* Recommended Prep Stock Grid */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Recommended Festival Stock Buffer
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeFestival.recommendedPrepStock.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{item.productName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Normal Stock: {item.normalStock} → <strong className="text-lime-accent">Festival Prep: {item.recommendedStock} units</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Est. Revenue</span>
                  <span className="font-extrabold text-lime-accent font-mono text-sm">{formatINR(item.estimatedRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Preparation Checklist & Deadlines
          </span>
          <div className="space-y-1.5">
            {activeFestival.checklist.map((task, idx) => {
              const isChecked = checkedChecklist[task] || false;
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleCheck(task)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 text-xs ${
                    isChecked 
                      ? 'bg-navy-900/60 border-lime-accent/30 text-slate-400 line-through' 
                      : 'bg-navy-950 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-lime-accent border-lime-accent text-navy-950' : 'border-slate-600'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{task}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EVIDENCE-BACKED AI RECOMMENDATIONS */}
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-white">Evidence-Backed Business Insights</h3>
          <p className="text-xs text-slate-400">
            Every advice displays the calculation trace, confidence score & source data.
          </p>
        </div>

        <div className="space-y-4">
          {aiRecommendations.map(rec => (
            <div
              key={rec.id}
              className="p-6 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-lime-accent/15 text-lime-accent border border-lime-accent/30">
                    {rec.category}
                  </span>
                  <h4 className="font-extrabold text-white text-sm">{rec.headline}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint-accent/20 text-mint-accent font-mono">
                  {rec.confidence}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-hindi text-slate-100 font-medium">{rec.recommendationHi}</p>
                <p className="text-xs text-slate-300">{rec.recommendation}</p>
              </div>

              {/* Evidence Panel */}
              <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-lime-accent text-[10px] font-bold font-sans uppercase">
                  <Info className="w-3.5 h-3.5" />
                  <span>Audit Trail & Records Supporting This Recommendation:</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">• Metric: {rec.evidence.metric}</p>
                <p className="text-slate-300 text-[11px] font-sans">• Internal Records: {rec.evidence.records}</p>
                <p className="text-slate-400 text-[11px] font-sans">• Data Source: {rec.evidence.source}</p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  className="px-4 py-2 rounded-xl bg-lime-accent hover:bg-lime-hover text-navy-950 text-xs font-bold shadow-lime-glow flex items-center gap-1.5"
                >
                  <span>Execute Next Action: {rec.suggestedAction}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
