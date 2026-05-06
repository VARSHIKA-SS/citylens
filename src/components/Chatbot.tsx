import React, { useState, useRef, useEffect } from 'react';
import { useCity } from '../contexts/CityContext';
import { useAuth } from '../contexts/AuthContext';
import { chatWithGuide } from '../lib/gemini';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function Chatbot() {
  const { intelligence } = useCity();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: `Hey ${user?.name || 'there'}! I'm your street-smart guide. Ask me anything about ${intelligence?.city || 'India'}!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await chatWithGuide(userMsg, intelligence, user || { name: 'Traveler', gender: 'other' });
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having a bit of a brain freeze. Try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px]"
          >
            <Card className="border-none shadow-2xl shadow-primary/20 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-primary p-6 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black">CityLens Guide</p>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Online & Street Smart</p>
                  </div>
                </CardTitle>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/10 rounded-xl"
                >
                  <X size={20} />
                </Button>
              </CardHeader>
              <CardContent className="p-0 bg-gray-50">
                <ScrollArea className="h-[400px] p-6" viewportRef={scrollRef}>
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-primary shadow-sm'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                          </div>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm rounded-tl-none'}`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                          <div className="w-8 h-8 rounded-xl bg-white text-primary shadow-sm flex items-center justify-center">
                            <Bot size={16} />
                          </div>
                          <div className="p-4 rounded-2xl bg-white shadow-sm rounded-tl-none">
                            <Loader2 className="animate-spin text-primary" size={18} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about local spots, fares..."
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="rounded-xl shrink-0"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl shadow-2xl transition-all duration-500 ${isOpen ? 'rotate-90 bg-gray-900' : 'bg-primary hover:scale-110 shadow-primary/30'}`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </Button>
    </div>
  );
}
