import { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowUpRight, 
  Zap, 
  TrendingUp,
  BrainCircuit,
  ShoppingBag,
  Star,
  ChevronRight
} from 'lucide-react';

const RecommendationCard = ({ product, confidence, reason, price }) => (
  <div className="card bg-dark-card border-dark-border hover:border-primary/40 transition-all group overflow-hidden">
    <div className="absolute top-0 right-0 p-4">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
        <Zap size={12} className="text-primary fill-primary" />
        <span className="text-[10px] font-black text-primary uppercase tracking-wider">{confidence}% Match</span>
      </div>
    </div>
    
    <div className="p-8">
      <div className="w-16 h-16 rounded-3xl bg-dark-bg border border-dark-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-neon transition-all duration-500 mb-6">
        <ShoppingBag size={32} />
      </div>
      
      <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors">{product}</h4>
      <p className="text-xs text-dark-muted font-medium mt-2 leading-relaxed">
        {reason || "Based on recent purchase history and similar customer behavioral patterns."}
      </p>

      <div className="mt-8 pt-8 border-t border-dark-border/50 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-dark-muted font-bold tracking-widest uppercase">Target Price</p>
          <p className="text-2xl font-black text-white">${price}</p>
        </div>
        <button className="p-3 bg-primary text-black rounded-2xl shadow-neon hover:shadow-neon-strong active:scale-95 transition-all">
          <ArrowUpRight size={20} />
        </button>
      </div>
    </div>
  </div>
);

export default function Recommendations() {
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);

  const mockRecommendations = [
    { product: 'Premium Espresso Beans', confidence: 98, price: 24.99, reason: 'High frequency purchase of coffee-related items.' },
    { product: 'Organic Oat Milk', confidence: 92, price: 5.50, reason: 'Frequent pairing with your coffee purchases.' },
    { product: 'Artisan Sourdough', confidence: 85, price: 6.25, reason: 'Popular item among customers with similar basket profiles.' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-primary animate-pulse" size={20} />
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">PRISMA Core AI</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">AI Recommendation Engine</h2>
          <p className="text-dark-muted mt-2 font-medium">Predictive modeling for personalized retail experiences.</p>
        </div>
      </div>

      {/* Customer Selector */}
      <div className="card p-8 bg-gradient-to-r from-primary/5 to-transparent border-primary/20 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-primary/10 p-4 rounded-2xl text-primary">
          <BrainCircuit size={40} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-black text-white">Generate Personalized Offers</h3>
          <p className="text-sm text-dark-muted mt-1">Select a customer ID to run the predictive analysis.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={16} />
            <input 
              type="text" 
              placeholder="Enter Customer ID..."
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-primary outline-none transition-all"
            />
          </div>
          <button 
            className="px-6 py-3 bg-primary text-black font-black text-sm rounded-xl shadow-neon hover:shadow-neon-strong transition-all flex items-center gap-2"
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}
          >
            Run Engine
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-neon" />
          <p className="text-primary font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">Processing Data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-white tracking-tight">Predicted Top Suggestions</h3>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-dark-border to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockRecommendations.map((rec, idx) => (
              <RecommendationCard key={idx} {...rec} />
            ))}
          </div>
          
          {/* Insights Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="card p-8 bg-dark-card border-dark-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 text-accent">
                  <TrendingUp size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Market Trend Insight</span>
                </div>
                <h4 className="text-xl font-black text-white tracking-tight leading-tight">Upsell Opportunity Detected</h4>
                <p className="text-sm text-dark-muted mt-3 leading-relaxed">
                  Based on current inventory levels and high-demand cycles, bundling Organic Coffee with Premium Espresso Beans could yield a **15.2%** increase in average order value.
                </p>
              </div>
              <button className="w-full mt-8 py-4 bg-accent text-black font-black rounded-2xl flex items-center justify-center gap-2 group transition-all">
                Generate Campaign <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="card p-8 bg-dark-card border-dark-border border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-dark-muted">
                  <BrainCircuit size={32} />
               </div>
               <div>
                 <h4 className="text-lg font-black text-white">Advanced ML Models Locked</h4>
                 <p className="text-sm text-dark-muted">Gather more data to unlock Predictive Churn and Lifetime Value forecasting.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
