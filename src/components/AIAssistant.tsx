import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AIAssistant = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startChat = () => {
    if (!chatRef.current) {
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are the Homi.JProjects AI Engineering Assistant. You help clients and engineers with technical queries about electrical contracting, industrial automation, and project planning. Be professional, technical, and helpful. Keep your answers short, concise, and to the point.",
        },
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      startChat();
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMsg: Message = { role: 'model', content: response.text || "I'm sorry, I couldn't process that." };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[100]" />
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        className="fixed bottom-8 right-8 z-[101] pointer-events-auto"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-[350px] md:w-[400px] h-[500px] rounded-[2rem] mb-6 flex flex-col overflow-hidden shadow-2xl border transition-colors duration-500 ${
                theme === 'dark' 
                  ? 'bg-[#0a0a0a]/90 backdrop-blur-lg border-white/10 text-white' 
                  : 'bg-white/90 backdrop-blur-lg border-gray-200 text-gray-900'
              }`}
            >
              <div className={`p-6 border-b flex justify-between items-center cursor-move transition-colors duration-500 ${
                theme === 'dark' ? 'border-white/10 bg-electric-blue/10' : 'border-gray-100 bg-electric-blue/5'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center glow">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">AI Engineering Assistant</h3>
                    <Badge variant="outline" className={`text-[10px] h-4 border-electric-blue/30 text-electric-blue`}>Powered by Gemini</Badge>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                  className={`transition-colors p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full p-6" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <MessageSquare className="text-gray-500 w-6 h-6" />
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Ask me anything about our engineering services.</p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-electric-blue text-white' 
                            : theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className={`p-3 rounded-2xl flex gap-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className={`p-4 border-t transition-colors duration-500 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="Type your query..."
                    className={`flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-electric-blue transition-colors ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                  <Button type="submit" size="icon" className="bg-electric-blue hover:bg-electric-blue/80 text-white rounded-xl">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-electric-blue rounded-full flex items-center justify-center shadow-2xl glow group cursor-move"
        >
          <Sparkles className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
        </motion.button>
      </motion.div>
    </>
  );
};
