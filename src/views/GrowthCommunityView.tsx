import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Store, 
  Compass, 
  HeartHandshake, 
  MessageSquare, 
  TrendingDown, 
  Plus, 
  CheckCircle2, 
  Award, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const GrowthCommunityView: React.FC = () => {
  const { customers, language } = useApp();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'group-buying' | 'competitor' | 'loyalty' | 'feedback'>('group-buying');
  const [joinedPools, setJoinedPools] = useState<Record<string, boolean>>({ 'pool-1': true });

  const groupBuyingPools = [
    {
      id: 'pool-1',
      title: 'Fortune Mustard Oil 15L Tin Bulk Consignment',
      poolName: 'Chandni Chowk Retailer Union Pool #12',
      retailersJoined: 8,
      targetQuantity: 120,
      currentQuantity: 95,
      unitPrice: 1950,
      mrp: 2280,
      savingPercent: 14.4,
      daysLeft: 2,
      supplier: 'Khemka Edible Oils Wholesale Hub'
    },
    {
      id: 'pool-2',
      title: 'Aashirvaad Shudh Chakki Atta 10kg Truckload',
      poolName: 'Old Delhi Kirana Syndicate',
      retailersJoined: 14,
      targetQuantity: 400,
      currentQuantity: 360,
      unitPrice: 368,
      mrp: 435,
      savingPercent: 15.4,
      daysLeft: 4,
      supplier: 'Direct Mill Dispatch (Khari Baoli)'
    },
    {
      id: 'pool-3',
      title: 'Patanjali Pure Cow Ghee 1L Tin Cartons',
      poolName: 'North Delhi Retail Alliance',
      retailersJoined: 6,
      targetQuantity: 60,
      currentQuantity: 32,
      unitPrice: 565,
      mrp: 675,
      savingPercent: 16.2,
      daysLeft: 5,
      supplier: 'Patanjali Central Depot'
    }
  ];

  const competitorPriceData = [
    {
      productName: 'Aashirvaad Shudh Chakki Atta 10kg',
      ourPrice: 435,
      blinkitPrice: 465,
      zeptoPrice: 459,
      localSupermart: 445,
      status: 'CHEAPER_AT_OUR_STORE',
      marginAdvantage: 'You are ₹30 cheaper than Blinkit'
    },
    {
      productName: 'Fortune Sunlite Refined Sunflower Oil 1L',
      ourPrice: 155,
      blinkitPrice: 159,
      zeptoPrice: 154,
      localSupermart: 158,
      status: 'COMPETITIVE',
      marginAdvantage: 'Matched within ₹1'
    },
    {
      productName: 'Maggi 2-Minute Masala Noodles 70g',
      ourPrice: 14,
      blinkitPrice: 14,
      zeptoPrice: 14,
      localSupermart: 14,
      status: 'MRP_FIXED',
      marginAdvantage: 'Standard MRP parity'
    },
    {
      productName: 'Surf Excel Easy Wash 1kg',
      ourPrice: 154,
      blinkitPrice: 165,
      zeptoPrice: 162,
      localSupermart: 156,
      status: 'CHEAPER_AT_OUR_STORE',
      marginAdvantage: 'You are ₹11 cheaper than Blinkit'
    }
  ];

  const feedbackLogs = [
    {
      id: 'fb-1',
      customer: 'Sunita Devi',
      date: '2026-10-14',
      rating: 5,
      comment: 'Very polite behavior. Always fresh milk and curd available early morning at 6:30 AM.'
    },
    {
      id: 'fb-2',
      customer: 'Ramesh Kumar',
      date: '2026-10-12',
      rating: 4,
      comment: 'Please also stock Harvest Gold brown bread or multigrain options.'
    },
    {
      id: 'fb-3',
      customer: 'Anjali Verma',
      date: '2026-10-09',
      rating: 5,
      comment: 'Digital UPI QR code and instant invoice WhatsApp receipt is super convenient!'
    }
  ];

  const handleToggleJoin = (id: string) => {
    setJoinedPools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-4 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isHi ? 'ग्रोथ एवं कम्युनिटी हब' : 'Growth & Community Hub'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Group wholesale buying pooling, local quick-commerce price tracking, loyalty points & customer feedback.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('group-buying')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'group-buying' ? 'bg-lime-accent text-navy-950 shadow-lime-glow' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Group Buying Network ({groupBuyingPools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('competitor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'competitor' ? 'bg-mint-accent text-navy-950 shadow-mint-glow' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Competitor Price Tracker (Blinkit/Zepto)</span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'loyalty' ? 'bg-amber-400 text-navy-950 shadow-md' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Customer Loyalty Points</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'feedback' ? 'bg-blue-400 text-navy-950 shadow-md' : 'bg-navy-800 text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Feedback ({feedbackLogs.length})</span>
        </button>
      </div>

      {/* Group Buying Network Tab */}
      {activeTab === 'group-buying' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-navy-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <strong className="text-white">What is Group Buying?</strong> Pool wholesale purchase quantities with other local shopkeepers in Chandni Chowk to unlock tier-1 distributor truckload rates.
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-lime-accent/20 text-lime-accent">
              Save up to 16.2%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {groupBuyingPools.map(pool => {
              const isJoined = joinedPools[pool.id] || false;
              const fillPercent = Math.min(100, Math.round((pool.currentQuantity / pool.targetQuantity) * 100));

              return (
                <div key={pool.id} className="p-5 rounded-3xl bg-navy-800/95 border border-slate-700 shadow-card-dark flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{pool.poolName}</span>
                      <span className="text-amber-400 font-bold font-mono">{pool.daysLeft} days left</span>
                    </div>

                    <h4 className="font-extrabold text-white text-sm">{pool.title}</h4>

                    <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Pool Wholesale Rate:</span>
                        <span className="font-extrabold text-lime-accent font-mono text-base">{formatINR(pool.unitPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Standard Single-Store Cost:</span>
                        <span className="text-slate-400 line-through font-mono">{formatINR(pool.mrp)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-navy-900 overflow-hidden">
                        <div className="h-full bg-lime-accent" style={{ width: `${fillPercent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{pool.currentQuantity} / {pool.targetQuantity} units committed</span>
                        <span className="font-bold text-mint-accent">{fillPercent}% Target</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Supplier: <strong className="text-slate-200">{pool.supplier}</strong> • {pool.retailersJoined} retailers pooled
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleJoin(pool.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isJoined
                        ? 'bg-navy-900 border border-lime-accent/40 text-lime-accent'
                        : 'bg-lime-accent hover:bg-lime-hover text-navy-950 shadow-lime-glow'
                    }`}
                  >
                    {isJoined ? <CheckCircle2 className="w-4 h-4 text-lime-accent" /> : <Plus className="w-4 h-4" />}
                    <span>{isJoined ? 'Joined Pool (Allocated 15 units)' : 'Join Bulk Pool (+10 units)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competitor Price Tracker Tab */}
      {activeTab === 'competitor' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-navy-800/80 border border-slate-700 text-xs text-slate-300">
            Compare your counter rates against Blinkit, Zepto, and nearby supermarkets in Delhi NCR.
          </div>

          <div className="rounded-3xl border border-slate-700 bg-navy-800/95 overflow-hidden shadow-card-dark">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-3 text-right">Our Price</th>
                  <th className="py-3 px-3 text-right">Blinkit Rate</th>
                  <th className="py-3 px-3 text-right">Zepto Rate</th>
                  <th className="py-3 px-3 text-right">Local Mart</th>
                  <th className="py-3 px-4 text-center">Price Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {competitorPriceData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-navy-900/40">
                    <td className="py-3 px-4 font-bold text-white">{item.productName}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-lime-accent font-mono text-sm">{formatINR(item.ourPrice)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{formatINR(item.blinkitPrice)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{formatINR(item.zeptoPrice)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">{formatINR(item.localSupermart)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'CHEAPER_AT_OUR_STORE' ? 'bg-lime-accent/15 text-lime-accent border border-lime-accent/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.marginAdvantage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Loyalty Points Tab */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-navy-800/80 border border-slate-700 text-xs text-slate-300">
            Reward regular customers with 1 Saathi Point per ₹100 spent. Points redeemable for instant checkout discounts.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customers.map((c, idx) => (
              <div key={c.id} className="p-4 rounded-2xl bg-navy-800 border border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{c.name}</h4>
                  <p className="text-[10px] text-slate-400">{c.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-lime-accent/20 text-lime-accent font-mono">
                    {320 + (idx * 65)} Points
                  </span>
                  <p className="text-[9px] text-slate-400 mt-0.5">Value: ₹{Math.round((320 + (idx * 65)) * 0.1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedbackLogs.map(fb => (
              <div key={fb.id} className="p-5 rounded-3xl bg-navy-800 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{fb.customer}</span>
                  <span className="text-amber-400">{'★'.repeat(fb.rating)}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-hindi">"{fb.comment}"</p>
                <p className="text-[10px] text-slate-500">{fb.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
