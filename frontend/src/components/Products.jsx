import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Tags, AlertCircle, DollarSign, Package } from 'lucide-react';
import api from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // ML States
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [priceUpdate, setPriceUpdate] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/analytics/dashboard/summary');
      // In a real app we'd have a specific /products endpoint, for now we list products seen in inventory or summary
      // Let's assume there's a products endpoint we missed or just fetch all
      const prodRes = await api.get('/inventory/alerts'); // Fallback for demo
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setPrediction(null);
    setRecommendations([]);
    setPriceUpdate(null);
  };

  // ML Handlers
  const handlePredictDemand = async () => {
    if (!selectedProduct) return;
    setMlLoading(true);
    try {
      const res = await api.get(`/inventory/products/${selectedProduct.product_id}/demand`);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMlLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedProduct) return;
    setMlLoading(true);
    try {
      // Recommendations for a customer, but we can mock for a product
      const res = await api.get(`/recommendations/CUST-MOCK`);
      setRecommendations(res.data.recommended_products);
    } catch (err) {
      console.error(err);
    } finally {
      setMlLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedProduct) return;
    setMlLoading(true);
    try {
      const res = await api.post(`/inventory/products/${selectedProduct.product_id}/update-price`);
      setPriceUpdate(res.data);
      fetchProducts(); 
    } catch (err) {
      console.error(err);
    } finally {
      setMlLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Product List */}
      <div className="card lg:col-span-2 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
           <Tags size={20} className="text-accent" />
           Inventory Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-dark-muted">
            <thead className="text-xs text-dark-muted uppercase bg-dark-bg border-b border-dark-border">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id} className="border-b border-dark-border hover:bg-dark-bg/50 transition-colors">
                  <td className="px-4 py-4 font-medium text-white">{p.product_name}</td>
                  <td className="px-4 py-4">{p.product_id}</td>
                  <td className="px-4 py-4 font-bold text-white">{p.stock_level}</td>
                  <td className="px-4 py-4">
                    <span className={p.status !== 'OK' ? 'text-danger font-medium flex items-center gap-1' : 'text-success font-medium'}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleSelectProduct(p)}
                      className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline"
                    >
                      ML Tools
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ML Operations Panel */}
      <div className="card space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-dark-border pb-4">
           <Sparkles size={20} className="text-primary" />
           AI Intelligence
        </h3>
        
        {!selectedProduct ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-dark-muted">
            <Sparkles size={48} className="mb-4 opacity-20" />
            <p>Select a product to access ML tools.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-dark-bg p-4 rounded-xl border border-primary/20">
              <span className="text-xs uppercase text-primary font-bold">Selected Product</span>
              <h4 className="text-xl font-bold text-white mt-1">{selectedProduct.product_name}</h4>
              <p className="text-sm text-dark-muted mt-1">ID: {selectedProduct.product_id}</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handlePredictDemand} 
                disabled={mlLoading}
                className="w-full btn-primary bg-accent hover:bg-violet-600 justify-start"
              >
                <TrendingUp size={18} />
                Predict Future Demand
              </button>
              
              {prediction && (
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-sm text-white">
                  <p><strong>Forecasted Demand:</strong> <span className="text-lg font-bold text-accent">{prediction.forecasted_demand} units</span></p>
                  <p className="text-dark-muted text-xs mt-1">Confidence Score: {(prediction.confidence_score * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleGetRecommendations}
                disabled={mlLoading}
                className="w-full btn-primary bg-primary hover:bg-primary-hover justify-start"
              >
                <Package size={18} />
                Collaborative Recommendations
              </button>
              
              {recommendations.length > 0 && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-white space-y-2">
                  <p className="font-semibold text-primary">AI Suggestions:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {recommendations.map(r => (
                      <li key={r.product_id} className="text-dark-text">{r.name} - ${r.unit_price}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleUpdatePrice}
                disabled={mlLoading}
                className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 justify-start"
              >
                <DollarSign size={18} />
                Dynamic Pricing Agent
              </button>
              
              {priceUpdate && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-white space-y-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-dark-muted line-through">${priceUpdate.old_price.toFixed(2)}</span>
                    <span className="text-success text-2xl">${priceUpdate.new_price.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-semibold uppercase mb-1">Agent Reasoning:</p>
                    <p className="text-xs text-dark-muted">{priceUpdate.reason}</p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>

    </div>
  );
}
