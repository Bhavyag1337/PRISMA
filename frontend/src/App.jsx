import { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Recommendations from './pages/Recommendations';
import Chatbot from './components/Chatbot';
import { MessageSquareText } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <Analytics />;
      case 'inventory': return <Inventory />;
      case 'customers': return <Customers />;
      case 'recommendations': return <Recommendations />;
      default: return <Dashboard />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}

      {/* Modern Chatbot Integration */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-5 rounded-3xl shadow-neon transition-all duration-500 hover:scale-110 active:scale-95 flex items-center gap-3 group ${
            isChatOpen ? 'bg-white text-black rotate-90' : 'bg-primary text-black'
          }`}
        >
          <MessageSquareText size={28} className="group-hover:rotate-12 transition-transform" />
          {!isChatOpen && <span className="font-black text-xs uppercase tracking-widest mr-2 hidden sm:block">AI Assistant</span>}
        </button>

        {isChatOpen && (
          <div className="absolute bottom-24 right-0 w-96 max-h-[600px] h-[70vh] bg-dark-card border border-dark-border rounded-[2rem] shadow-neon-strong z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="p-6 border-b border-dark-border bg-dark-bg/50 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-neon" />
                <h3 className="font-black text-white uppercase tracking-widest text-sm">PRISMA AI</h3>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="text-dark-muted hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-dark-border flex items-center justify-center">✕</div>
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-dark-card/30">
              <Chatbot />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default App;
