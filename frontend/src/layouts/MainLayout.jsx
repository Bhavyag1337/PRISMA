import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout({ children, activeTab, setActiveTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-dark-text font-sans selection:bg-primary/30 selection:text-primary">
      {/* Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Background Gradients / Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
          
          {/* Footer Space */}
          <div className="h-20" />
        </main>
      </div>
    </div>
  );
}
