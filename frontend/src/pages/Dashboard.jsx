import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ArrowUpRight, 
  Calendar,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { analyticsService } from '../services/api';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="card group relative overflow-hidden bg-dark-card border-dark-border hover:border-primary/50 transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 bg-${color}/10 pointer-events-none group-hover:bg-${color}/20 transition-colors duration-500`} />
    <div className="flex justify-between items-start relative z-10">
      <div className="space-y-2">
        <p className="text-xs font-bold text-dark-muted uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${change.startsWith('+') ? 'text-primary' : 'text-danger'}`}>
          {change.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change} 
          <span className="text-dark-muted font-medium ml-1">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-2xl bg-dark-bg border border-dark-border text-${color} group-hover:shadow-neon transition-all duration-300`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await analyticsService.getDashboardSummary();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = [
    { name: 'Mon', sales: 4000, revenue: 2400 },
    { name: 'Tue', sales: 3000, revenue: 1398 },
    { name: 'Wed', sales: 2000, revenue: 9800 },
    { name: 'Thu', sales: 2780, revenue: 3908 },
    { name: 'Fri', sales: 1890, revenue: 4800 },
    { name: 'Sat', sales: 2390, revenue: 3800 },
    { name: 'Sun', sales: 3490, revenue: 4300 },
  ];

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-dark-card rounded-2xl border border-dark-border"></div>)}
      </div>
      <div className="h-96 bg-dark-card rounded-2xl border border-dark-border"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Earning Dashboard</h2>
          <p className="text-dark-muted mt-2 font-medium">Monitoring your retail performance in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-dark-card border border-dark-border rounded-xl text-white font-bold text-sm hover:border-white/20 transition-all">
            <Calendar size={18} className="text-primary" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-black text-sm rounded-xl shadow-neon hover:shadow-neon-strong transition-all active:scale-95">
            Download Report <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${data?.total_revenue?.toLocaleString() || '0'}`} 
          change="+12.5%" 
          icon={DollarSign} 
          color="primary"
        />
        <StatCard 
          title="Sales Volume" 
          value={data?.total_orders?.toLocaleString() || '0'} 
          change="+8.2%" 
          icon={TrendingUp} 
          color="accent"
        />
        <StatCard 
          title="Active Customers" 
          value={data?.total_customers?.toLocaleString() || '0'} 
          change="-2.1%" 
          icon={Users} 
          color="warning"
        />
        <StatCard 
          title="Inventory Items" 
          value="4,291" 
          change="+14.0%" 
          icon={Package} 
          color="success"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-8 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Revenue Insights</h3>
              <p className="text-xs text-dark-muted font-bold tracking-widest uppercase mt-1">Growth progression over time</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <div className="w-2 h-2 rounded-full bg-primary" /> Revenue
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-accent">
                <div className="w-2 h-2 rounded-full bg-accent" /> Target
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D0D0D', 
                    border: '1px solid #1A1A1A',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrimary)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-8 bg-dark-card border-dark-border flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white tracking-tight">Top Performance</h3>
            <button className="p-2 hover:bg-dark-border rounded-xl text-dark-muted transition-colors"><MoreVertical size={18} /></button>
          </div>
          <div className="flex-1 space-y-6">
            {data?.top_products?.slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-lg font-black text-primary transition-all group-hover:bg-primary/10">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{product.name}</h4>
                    <p className="text-[10px] text-dark-muted uppercase font-bold tracking-widest mt-0.5">{product.total_sold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-white">${(product.unit_price * product.total_sold).toLocaleString()}</p>
                   <div className="flex items-center justify-end text-[10px] text-primary font-black gap-0.5">
                     <TrendingUp size={10} /> 4.2%
                   </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-dark-bg border border-dark-border rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:border-primary/50 transition-all flex items-center justify-center gap-2 group">
            View Ranking <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
