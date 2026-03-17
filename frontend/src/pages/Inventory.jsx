import { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  ArrowUpDown, 
  Filter, 
  MoreHorizontal,
  RefreshCcw,
  TrendingDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { inventoryService } from '../services/api';

const StockBadge = ({ level, reorder }) => {
  const isLow = level < reorder;
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
      isLow ? 'bg-danger/20 text-danger animate-pulse' : 'bg-primary/20 text-primary'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-danger shadow-[0_0_8px_rgba(255,49,49,0.8)]' : 'bg-primary shadow-neon'}`} />
      {isLow ? 'Low Stock' : 'Healthy'}
    </span>
  );
};

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAlerts();
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.product_name.toLowerCase().includes(search.toLowerCase()) ||
    item.product_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Smart Inventory</h2>
          <p className="text-dark-muted mt-2 font-medium">Real-time stock monitoring and replenishment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchInventory} className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-dark-muted hover:text-white transition-all">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-black text-sm rounded-xl shadow-neon hover:shadow-neon-strong transition-all active:scale-95">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-primary outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-dark-card border border-dark-border rounded-2xl text-dark-muted font-bold text-sm hover:text-white transition-all">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Inventory Grid/Table */}
      <div className="card overflow-hidden bg-dark-card border-dark-border p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-dark-bg/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-dark-muted">Product Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-dark-muted">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-dark-muted">Stock Level</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-dark-muted">Reorder PT</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-dark-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 bg-dark-card/50"></td>
                  </tr>
                ))
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.product_id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-primary group-hover:shadow-neon transition-all">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white leading-none">{item.product_name}</p>
                          <p className="text-[10px] text-dark-muted mt-1.5 tracking-tighter uppercase">{item.product_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StockBadge level={item.stock_level} reorder={item.reorder_point} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-black ${item.stock_level < item.reorder_point ? 'text-danger' : 'text-white'}`}>
                          {item.stock_level}
                        </span>
                        <div className="w-24 bg-dark-bg h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${item.stock_level < item.reorder_point ? 'bg-danger' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(100, (item.stock_level / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-dark-muted">{item.reorder_point}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-dark-border rounded-xl text-dark-muted hover:text-white transition-colors">
                          <RefreshCcw size={16} />
                        </button>
                        <button className="p-2 hover:bg-dark-border rounded-xl text-dark-muted hover:text-white transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {!loading && filteredInventory.length === 0 && (
          <div className="py-20 text-center">
             <div className="w-16 h-16 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center mx-auto mb-4">
                <Search className="text-dark-muted" />
             </div>
             <p className="text-white font-bold">No products found</p>
             <p className="text-sm text-dark-muted">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
