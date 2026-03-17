import { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRight, 
  ShoppingBag, 
  CreditCard, 
  Award,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const CustomerCard = ({ name, id, orders, spent, segment }) => (
  <div className="card bg-dark-card border-dark-border hover:border-accent/40 transition-all group cursor-pointer overflow-hidden p-6">
    <div className="absolute top-0 right-0 w-24 h-24 blur-[60px] -mr-12 -mt-12 bg-accent/10 pointer-events-none group-hover:bg-accent/20 transition-colors" />
    <div className="flex items-center gap-5 relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-accent group-hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] transition-all">
        <Users size={24} />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-black text-white group-hover:text-accent transition-colors">{name || 'Anonymous'}</h4>
        <p className="text-[10px] text-dark-muted font-bold tracking-widest uppercase mt-0.5">{id}</p>
      </div>
      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
        segment === 'VIP' ? 'bg-accent/20 text-accent shadow-[0_0_10px_rgba(0,245,255,0.2)]' : 'bg-dark-bg text-dark-muted border border-dark-border'
      }`}>
        {segment}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
      <div className="p-3 rounded-xl bg-dark-bg/50 border border-dark-border/50">
        <p className="text-[10px] text-dark-muted uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
          <ShoppingBag size={12} className="text-accent" /> Orders
        </p>
        <p className="text-xl font-black text-white">{orders}</p>
      </div>
      <div className="p-3 rounded-xl bg-dark-bg/50 border border-dark-border/50">
        <p className="text-[10px] text-dark-muted uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
          <CreditCard size={12} className="text-success" /> Spent
        </p>
        <p className="text-xl font-black text-white">${spent.toFixed(2)}</p>
      </div>
    </div>

    <button className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-xs font-black text-dark-muted hover:text-white uppercase tracking-widest transition-all">
      Full Profile <ChevronRight size={14} />
    </button>
  </div>
);

export default function Customers() {
  const [search, setSearch] = useState('');

  const mockCustomers = [
    { id: 'CUST-001', name: 'James Wilson', orders: 14, spent: 1240.50, segment: 'VIP' },
    { id: 'CUST-002', name: 'Elena Rodriguez', orders: 8, spent: 420.25, segment: 'Regular' },
    { id: 'CUST-003', name: 'Marcus Chen', orders: 3, spent: 156.00, segment: 'New' },
    { id: 'CUST-004', name: 'Sarah Miller', orders: 22, spent: 3105.75, segment: 'VIP' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Customer Intelligence</h2>
          <p className="text-dark-muted mt-2 font-medium">Deep segmentation and loyalty analytics.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-6 py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent font-black text-sm">
             <UserCheck size={18} /> {mockCustomers.length} Total Users
           </div>
        </div>
      </div>

      {/* Stats Mini Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-accent/5 to-transparent border-accent/10 p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent"><Award size={20} /></div>
          <div>
            <p className="text-[10px] text-dark-muted uppercase font-black tracking-widest">VIP Segment</p>
            <p className="text-xl font-black text-white">24.5%</p>
          </div>
        </div>
        <div className="card border-dark-border p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><ShoppingBag size={20} /></div>
          <div>
            <p className="text-[10px] text-dark-muted uppercase font-black tracking-widest">Avg orders/mo</p>
            <p className="text-xl font-black text-white">4.2</p>
          </div>
        </div>
        <div className="card border-dark-border p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success"><CreditCard size={20} /></div>
          <div>
            <p className="text-[10px] text-dark-muted uppercase font-black tracking-widest">Avg LTV</p>
            <p className="text-xl font-black text-white">$842.10</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID or customer name..."
            className="w-full bg-dark-card border border-dark-border rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:border-accent outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-dark-card border border-dark-border rounded-2xl text-dark-muted font-bold text-sm hover:text-white transition-all">
          <Filter size={18} /> Segments
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {mockCustomers.map((cust) => (
          <CustomerCard key={cust.id} {...cust} />
        ))}
        {/* Add Button */}
        <button className="card border-dashed border-dark-border bg-transparent hover:border-accent/40 transition-all flex flex-col items-center justify-center py-12 gap-4 group">
          <div className="w-12 h-12 rounded-full border border-dark-border flex items-center justify-center text-dark-muted group-hover:text-accent group-hover:border-accent/40 transition-all">
            <Plus size={24} />
          </div>
          <span className="text-xs font-black text-dark-muted uppercase tracking-widest group-hover:text-white transition-colors">Add Customer</span>
        </button>
      </div>
    </div>
  );
}

const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
