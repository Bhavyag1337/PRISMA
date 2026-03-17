import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Users, 
  Sparkles, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-primary/10 text-primary shadow-neon' 
        : 'text-dark-muted hover:bg-dark-border/50 hover:text-white'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      <Icon size={22} />
    </div>
    {!collapsed && (
      <span className="font-medium tracking-wide animate-in fade-in slide-in-from-left-2 duration-300">
        {label}
      </span>
    )}
    {active && !collapsed && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-neon animate-pulse" />
    )}
  </button>
);

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'recommendations', label: 'AI Engine', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-dark-card border-r border-dark-border transition-all duration-500 ease-in-out flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-24' : 'w-72'}`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center font-black text-xl text-black shadow-neon-strong transform hover:rotate-12 transition-transform duration-300">
              P
            </div>
            {!collapsed && (
              <h1 className="text-2xl font-black tracking-tighter text-white animate-in zoom-in-95 duration-500">
                PRISMA
              </h1>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 hover:bg-dark-border rounded-lg text-dark-muted hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-3">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              collapsed={collapsed}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setMobileOpen(false);
              }}
            />
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dark-border space-y-2">
          <NavItem 
            icon={Settings} 
            label="Settings" 
            collapsed={collapsed}
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <div className="pt-2">
            <button className="flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 w-full rounded-xl transition-all group">
              <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
              {!collapsed && <span className="font-medium tracking-wide">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
