import { Bell, Search, User, Menu, Globe, MessageSquare } from 'lucide-react';

export default function Navbar({ setMobileOpen }) {
  return (
    <header className="h-20 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border sticky top-0 z-30 px-6 sm:px-8 flex items-center justify-between">
      {/* Search Bar - Hidden on Mobile */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search analytics, products, or customers..."
            className="w-full bg-dark-card/50 border border-dark-border rounded-2xl py-2.5 pl-12 pr-4 text-white text-sm focus:border-primary/50 focus:bg-dark-card outline-none transition-all duration-300"
          />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 hover:bg-dark-card rounded-xl text-white transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-card border border-dark-border rounded-full mr-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-neon animate-pulse" />
          <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">System Live</span>
        </div>

        <button className="p-2.5 hover:bg-dark-card rounded-xl text-dark-muted hover:text-white transition-all relative group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-dark-bg" />
          <span className="absolute inset-0 rounded-xl bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
        </button>

        <button className="p-2.5 hover:bg-dark-card rounded-xl text-dark-muted hover:text-white transition-all group">
          <MessageSquare size={20} />
        </button>

        <div className="h-8 w-px bg-dark-border mx-1" />

        <button className="flex items-center gap-3 p-1.5 hover:bg-dark-card border border-transparent hover:border-dark-border rounded-2xl transition-all group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dark-border to-dark-card border border-dark-border flex items-center justify-center text-primary group-hover:shadow-neon transition-all">
            <User size={20} />
          </div>
          <div className="hidden sm:block text-left pr-2">
            <p className="text-sm font-bold text-white leading-none">Admin User</p>
            <p className="text-[10px] text-dark-muted mt-1 uppercase tracking-tighter">Premium Owner</p>
          </div>
        </button>
      </div>
    </header>
  );
}
