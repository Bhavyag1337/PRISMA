import { useState } from 'react';
import { LayoutDashboard, PackageSearch, MessageSquareText, Settings, Bell } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-dark-text font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-lg shadow-lg">P</div>
          <h1 className="text-xl font-bold tracking-tight text-white">PRISMA</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary font-medium' : 'text-dark-muted hover:bg-dark-border/50 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-primary/10 text-primary font-medium' : 'text-dark-muted hover:bg-dark-border/50 hover:text-white'}`}
          >
            <PackageSearch size={20} />
            Products & ML
          </button>
        </nav>

        <div className="p-4 border-t border-dark-border text-sm text-dark-muted text-center">
          Smart Retail system
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold capitalize text-white">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-dark-muted hover:text-white transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border border-dark-border shadow-sm"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 min-w-0 overflow-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8 min-w-0">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'products' && <Products />}
          </div>
        </div>
        
        {/* Chatbot Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/20 transition-transform hover:scale-105 z-50 flex items-center gap-2"
        >
          <MessageSquareText size={24} />
        </button>

        {/* Chatbot Panel */}
        {isChatOpen && (
          <div className="fixed bottom-24 right-6 w-96 max-h-[600px] h-[80vh] bg-dark-card border border-dark-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div className="p-4 border-b border-dark-border bg-dark-bg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <h3 className="font-medium text-white">PRISMA Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-dark-muted hover:text-white">✕</button>
            </div>
            <Chatbot />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
