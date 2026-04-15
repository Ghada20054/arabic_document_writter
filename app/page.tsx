"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, X } from 'lucide-react';


export default function MinimalistAIChat() {
  // We initialize the state with the exact conversation from your image
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hello. How can I help you today?' },
    { id: 2, role: 'user', text: 'Can you explain the concept of minimalism?' },
    { 
      id: 3, 
      role: 'assistant', 
      text: 'Minimalism is about focusing on the essential. In design, it means using only the necessary elements—limiting color palettes, maximizing white space, and prioritizing function over ornament.' 
    },
    { id: 4, role: 'user', text: 'That makes sense. This interface is a good example.' },
    { 
      id: 5, 
      role: 'assistant', 
      text: 'Exactly. By removing distractions like bright colors or complex shadows, the user can focus entirely on the conversation.' 
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

const scrollRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior: "smooth",
  });
}, [messages]);

  const handleSendMessage = (e: { preventDefault: () => void; }) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = { id: Date.now(), role: 'user', text: inputValue };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col items-center">
      {/* Header - Matching "AI ASSISTANT" style */}
      <header className="w-full max-w-4xl pt-12 px-6 flex justify-between items-center bg-white sticky top-0 z-10">
        <span className="text-[11px] tracking-[0.2em] text-gray-400 font-bold uppercase">AI Assistant</span>
        <div className="flex gap-4 text-gray-300">
          <Settings 
            size={18} 
            className="cursor-pointer hover:text-black transition" 
            onClick={() => setIsModalOpen(true)} 
          />
        </div>
      </header>

      {/* Main Chat Content */}
      <main 
        ref={scrollRef}
        className="flex-1 w-full max-w-3xl overflow-y-auto px-6 py-16 space-y-10"
      >
        <div className="w-full h-px bg-gray-50 mb-4" /> {/* Visual separator from image */}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-5 py-3 rounded-lg text-[16px] leading-snug shadow-sm transition-all ${
                msg.role === 'user' 
                ? 'bg-white border border-gray-100 text-gray-800' 
                : 'bg-[#F1F3F5] text-gray-900 border border-transparent'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </main>

      {/* Input Field - Exact replica of the black border box */}
      <footer className="w-full max-w-3xl p-6 mb-10 bg-white">
        <div className="w-full h-px bg-gray-50 mb-12" /> {/* Bottom separator from image */}
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            placeholder="Type a message..."
            className="w-full border border-black rounded-none p-4 pr-20 text-[16px] outline-none placeholder:text-gray-300"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-4 text-black font-normal text-sm hover:opacity-50 transition"
          >
            Send
          </button>
        </form>
      </footer>

      {/* Modal - Themed to match the minimalist style */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-sm bg-white border border-gray-200 shadow-xl p-8 rounded-none">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Settings</h3>
              <X 
                size={18} 
                className="cursor-pointer text-gray-300 hover:text-black transition" 
                onClick={() => setIsModalOpen(false)} 
              />
            </div>
            
            <div className="space-y-6 mb-10">
              <p className="text-sm border-b border-gray-50 pb-2 flex justify-between">
                Model <span>GPT-4 Minimal</span>
              </p>
              <p 
                className="text-sm text-red-400 cursor-pointer hover:text-red-600"
                onClick={() => setMessages([])}
              >
                Clear History
              </p>
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full border border-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}