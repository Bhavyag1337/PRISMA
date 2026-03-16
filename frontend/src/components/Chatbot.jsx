import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import api from '../api';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm PRISMA AI. I can help you with store info, recommendations, and stock availability." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-dark-bg">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-accent'}`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              
              <div className={`p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-dark-card border border-dark-border text-dark-text rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[85%]">
               <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
               </div>
               <div className="p-4 rounded-2xl bg-dark-card border border-dark-border rounded-tl-none flex gap-1">
                  <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-dark-muted rounded-full animate-bounce [animation-delay:-.5s]"></div>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-dark-border bg-dark-card">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PRISMA anything..."
            className="input-field pr-12 rounded-full border-dark-border bg-dark-bg focus:ring-accent focus:border-accent"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 bg-accent hover:bg-violet-600 text-white rounded-full transition-colors disabled:opacity-50"
          >
             <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
