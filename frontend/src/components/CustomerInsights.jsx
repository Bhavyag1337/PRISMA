import { useState } from 'react';
import { User, Search, ShoppingBag, CreditCard, BarChart3, ArrowRight } from 'lucide-react';
import api from '../api';

export default function CustomerInsights() {
  const [customerId, setCustomerId] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/customers/${customerId}`);
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <User className="text-accent" /> Customer Intelligence
      </h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
          <input 
            type="text" 
            placeholder="Enter Customer ID (e.g. CUST-001)"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary outline-none transition-all"
          />
        </div>
        <button 
          onClick={fetchInsights}
          className="bg-primary hover:bg-primary-hover text-white px-6 rounded-xl font-bold transition-all"
        >
          Analyze
        </button>
      </div>

      {loading && <div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div></div>}

      {insights && !insights.error && (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center space-y-2">
              <ShoppingBag className="mx-auto text-primary" size={24} />
              <p className="text-xs text-dark-muted uppercase font-bold tracking-wider">Total Orders</p>
              <h4 className="text-3xl font-black text-white">{insights.order_count}</h4>
            </div>
            <div className="card text-center space-y-2">
              <CreditCard className="mx-auto text-success" size={24} />
              <p className="text-xs text-dark-muted uppercase font-bold tracking-wider">Total Spent</p>
              <h4 className="text-3xl font-black text-white">${insights.total_spent.toFixed(2)}</h4>
            </div>
            <div className="card text-center space-y-2">
              <BarChart3 className="mx-auto text-accent" size={24} />
              <p className="text-xs text-dark-muted uppercase font-bold tracking-wider">Avg Order Value</p>
              <h4 className="text-3xl font-black text-white">${insights.average_order_value.toFixed(2)}</h4>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg">Loyalty Segment: {insights.order_count > 10 ? 'VIP Platinum' : 'Growing'}</h4>
                <p className="text-sm text-dark-muted">Based on frequency and high lifetime value.</p>
              </div>
              <ArrowRight className="text-primary" />
            </div>
          </div>
        </div>
      )}

      {insights?.error && (
        <div className="card border-danger/30 text-center py-12">
           <p className="text-danger">Customer not found. Try CUST-001 after seeding data.</p>
        </div>
      )}
    </div>
  );
}
