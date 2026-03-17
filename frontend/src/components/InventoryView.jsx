import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, RefreshCcw } from 'lucide-react';
import api from '../api';

export default function InventoryView() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/alerts');
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

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-dark-card rounded-xl"></div>)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="text-primary" /> Smart Inventory
        </h3>
        <button onClick={fetchInventory} className="p-2 hover:bg-dark-border rounded-lg text-dark-muted transition-colors">
          <RefreshCcw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventory.map(item => (
          <div key={item.product_id} className="card bg-dark-card border border-dark-border hover:border-primary/50 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-white">{item.product_name}</h4>
                <p className="text-xs text-dark-muted">ID: {item.product_id}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'OK' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {item.status}
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-dark-muted mb-1">Stock Level</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white">{item.stock_level}</span>
                  <span className="text-dark-muted">/ {item.reorder_point} Reorder</span>
                </div>
              </div>
              
              <div className="text-right">
                {item.stock_level < item.reorder_point ? (
                  <button className="btn-primary text-xs py-1 px-3 bg-danger hover:bg-danger/80">Restock Now</button>
                ) : (
                  <div className="flex items-center text-success text-xs font-medium gap-1">
                    <TrendingUp size={14} /> Healthy
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-dark-border/50">
              <div className="w-full bg-dark-bg h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${item.stock_level < item.reorder_point ? 'bg-danger' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(100, (item.stock_level / (item.reorder_point * 2)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
