// src/components/HealthChatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApp } from '../context/AppContext';

// Initialize Gemini
// Using gemini-1.5-flash as it is the top-tier free and fast model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export default function HealthChatbot() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello! I am the ResQScan Health Assistant. How can I help you with your health or medical queries today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // 1. Check if API key exists
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing! Make sure VITE_GEMINI_API_KEY is set in Vercel.");
      }

      // Setup the model with strict guardrails
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: "You are a specialized medical and health assistant for the ResQScan app. Your ONLY purpose is to answer questions related to health, medicine, fitness, first aid, and medical emergencies. GUARDRAIL: If the user asks a question about ANY topic outside of health, medicine, or wellness (e.g., coding, politics, math, general knowledge, movies), you MUST firmly but politely refuse to answer. Reply with exactly: 'I am a specialized health assistant. I can only answer medical and health-related questions. Please consult me for health queries only.' Never break this rule. Keep answers concise, empathetic, and always add a disclaimer to consult a real doctor for serious issues."
      });

      // Format previous messages for chat history
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error: any) {
      // 2. Log the exact error to the browser console for debugging
      console.error("Chatbot Error Details:", error);
      
      // Show specific error to user if it's an API key issue
      if (error.message.includes("API Key is missing")) {
         setMessages(prev => [...prev, { role: 'model', text: 'Configuration Error: API Key is missing. Please check Vercel Environment Variables.' }]);
      } else {
         setMessages(prev => [...prev, { role: 'model', text: `Sorry, I am having trouble connecting right now. (${error.message || 'Unknown error'})` }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 w-[90vw] max-w-[360px] h-[500px] max-h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
              isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-sm">Health Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-red-500 text-white rounded-br-none' 
                      : isDark ? 'bg-slate-700 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[80%] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-3 border-t ${isDark ? 'border-white/10 bg-slate-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a health question..."
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-red-500/50 transition-all ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-md flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xl shadow-red-500/30 flex items-center justify-center relative z-50 border-2 border-white/20"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </motion.button>
    </div>
  );
}