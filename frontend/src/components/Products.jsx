import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Tags, AlertCircle } from 'lucide-react';
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
      const res = await api.get('/products');
      setProducts(res.data);
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
      const res = await api.get(`/predict-demand/${selectedProduct.product_id}`);
      setPrediction(res.data.prediction);
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
      const res = await api.get(`/recommend/${selectedProduct.product_id}`);
      setRecommendations(res.data.recommendations);
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
      const res = await api.post(`/update-price/${selectedProduct.product_id}`);
      setPriceUpdate(res.data);
      fetchProducts(); // refresh products list to get new price
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
           Product Inventory
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-dark-muted">
            <thead className="text-xs text-dark-muted uppercase bg-dark-bg border-b border-dark-border">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id} className="border-b border-dark-border hover:bg-dark-bg/50 transition-colors">
                  <td className="px-4 py-4 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-4">
                    <span className="bg-dark-border/50 text-xs px-2 py-1 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-4">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={p.stock < 10 ? 'text-danger font-medium flex items-center gap-1' : 'text-success font-medium'}>
                      {p.stock < 10 && <AlertCircle size={14} />} {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleSelectProduct(p)}
                      className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline"
                    >
                      Select ML Tools
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
            <p>Select a product from the inventory to access ML tools.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-dark-bg p-4 rounded-xl border border-primary/20">
              <span className="text-xs uppercase text-primary font-bold">Selected Product</span>
              <h4 className="text-xl font-bold text-white mt-1">{selectedProduct.name}</h4>
              <p className="text-sm text-dark-muted mt-1">Current Price: ${selectedProduct.price.toFixed(2)}</p>
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
                  <p><strong>Predicted Demand (Next Month):</strong> <span className="text-lg font-bold text-accent">{prediction.predicted_demand_next_month} units</span></p>
                  <p className="text-dark-muted text-xs mt-1">Confidence: <span className="capitalize">{prediction.confidence}</span> based on historical data model.</p>
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
                Get Frequently Bought Together
              </button>
              
              {recommendations.length > 0 && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-white space-y-2">
                  <p className="font-semibold text-primary">Recommendations Engine:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {recommendations.map(r => (
                      <li key={r.product_id} className="text-dark-text">{r.name} - ${r.price.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendations.length === 0 && mlLoading === false && prediction === null && priceUpdate === null && (
                 <div className="text-xs text-dark-muted italic">Click to run collaborative filtering...</div>
              )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleUpdatePrice}
                disabled={mlLoading}
                className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 justify-start"
              >
                <DollarSign size={18} />
                Run Dynamic Pricing Agent
              </button>
              
              {priceUpdate && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-white space-y-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-dark-muted line-through">${priceUpdate.old_price.toFixed(2)}</span>
                    <span className="text-success text-2xl">${priceUpdate.new_price.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-semibold uppercase mb-1">Rules Applied:</p>
                    <ul className="list-disc pl-4 text-xs">
                      {priceUpdate.rules_applied.map((rule, idx) => (
                        <li key={idx} className="text-dark-muted">{rule}</li>
                      ))}
                    </ul>
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
