import { useState } from 'react';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp, 
  Filter, 
  Download,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#39FF14', '#00F5FF', '#FFD700', '#FF3131', '#8B5CF6'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('monthly');

  const purchaseTrendData = [
    { name: 'Week 1', organic: 4000, processed: 2400 },
    { name: 'Week 2', organic: 3000, processed: 1398 },
    { name: 'Week 3', organic: 5000, processed: 9800 },
    { name: 'Week 4', organic: 2780, processed: 3908 },
  ];

  const categoryData = [
    { name: 'Beverages', value: 400 },
    { name: 'Dairy', value: 300 },
    { name: 'Bakery', value: 300 },
    { name: 'Snacks', value: 200 },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Advanced Analytics</h2>
          <p className="text-dark-muted mt-2 font-medium">Deep dive into consumer behavior and market trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-card border border-dark-border rounded-xl p-1">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                  timeRange === range ? 'bg-primary text-black' : 'text-dark-muted hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-primary hover:border-primary/50 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase Patterns */}
        <div className="card p-8 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Purchase Patterns</h3>
              <p className="text-xs text-dark-muted font-bold tracking-widest uppercase mt-1">Consumer segment preference</p>
            </div>
            <BarChart3 className="text-accent" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchaseTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                />
                <Bar dataKey="organic" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="processed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-8 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Category Share</h3>
              <p className="text-xs text-dark-muted font-bold tracking-widest uppercase mt-1">Sales distribution by department</p>
            </div>
            <PieChartIcon className="text-primary" />
          </div>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #1A1A1A', borderRadius: '12px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Retention */}
        <div className="lg:col-span-2 card p-8 bg-dark-card border-dark-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Customer Engagement</h3>
              <p className="text-xs text-dark-muted font-bold tracking-widest uppercase mt-1">Retention and acquisition rate</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full">+18% Peak Engagement</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={purchaseTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #1A1A1A', borderRadius: '12px' }} />
                <Line type="stepAfter" dataKey="organic" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} />
                <Line type="monotone" dataKey="processed" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
