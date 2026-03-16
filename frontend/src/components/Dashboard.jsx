import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [salesData, setSalesData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, alertsRes] = await Promise.all([
          api.get('/sales/analytics'),
          api.get('/inventory-alerts')
        ]);
        setSalesData(salesRes.data);
        setAlerts(alertsRes.data.alerts);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-64 justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-dark-card to-dark-bg border-l-4 border-l-primary flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-lg text-primary">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-dark-muted font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-white">${salesData?.total_revenue?.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-dark-card to-dark-bg border-l-4 border-l-accent flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-lg text-accent">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-dark-muted font-medium">Monthly Trend</p>
            <h3 className="text-2xl font-bold text-white">Up 12%</h3>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-dark-card to-dark-bg border-l-4 border-l-success flex items-center gap-4">
          <div className="p-3 bg-success/20 rounded-lg text-success">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-dark-muted font-medium">Top Product</p>
            <h3 className="text-lg font-bold text-white truncate max-w-[150px]">
              {salesData?.top_selling_products?.[0]?.name || 'N/A'}
            </h3>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-dark-card to-dark-bg border-l-4 border-l-danger flex items-center gap-4">
          <div className="p-3 bg-danger/20 rounded-lg text-danger">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-dark-muted font-medium">Alerts</p>
            <h3 className="text-2xl font-bold text-white">{alerts.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData?.monthly_revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={False} />
                <XAxis dataKey="month" stroke="#94A3B8" tick={{fill: '#94A3B8'}} />
                <YAxis stroke="#94A3B8" tick={{fill: '#94A3B8'}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-white">Top Selling Products</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData?.top_selling_products} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={False} />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" width={80} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="quantity" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Inventory Alerts section */}
      {alerts.length > 0 && (
        <div className="card border-danger/50 shadow-danger/10">
          <h3 className="text-lg font-semibold text-danger flex items-center gap-2 mb-4">
            <AlertTriangle size={20} />
            Inventory Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-danger/20 bg-danger/5 text-sm">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                   <span className="text-white">{alert.message}</span>
                </div>
                <button className="text-primary hover:text-primary-hover font-medium">Restock</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
