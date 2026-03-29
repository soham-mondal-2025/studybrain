import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// FIXED: Added explicit v1 apiVersion to prevent the 404/v1beta error
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
}, { apiVersion: 'v1' });

const ChatScanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({ id: null, name: 'Student', roll: 'N/A' });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // Tracking background logic
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        const roll = user.user_metadata?.roll_number || 'N/A';
        setUserData({ id: user.id, name, roll });

        const { data: history } = await supabase
          .from('chat_messages')
          .select('role, text')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([{ role: 'ai', text: `Hey ${name}! I'm your StudyBuddy. How can I help with Math or Physics?` }]);
        }
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleClearChat = async () => {
    if (!window.confirm("Clear history?")) return;
    try {
      await supabase.from('chat_messages').delete().eq('user_id', userData.id);
      setMessages([{ role: 'ai', text: "Chat cleared! Ready for new problems." }]);
    } catch (err) { alert("Error: " + err.message); }
  };

  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  // RETRY LOGIC: Handles 429 errors in the background
  const generateWithRetry = async (payload, attempt = 0) => {
    try {
      setStatus(attempt > 0 ? `Retrying (Attempt ${attempt})...` : "Thinking...");
      const result = await model.generateContent(payload);
      return result.response.text();
    } catch (error) {
      if (error.message.includes("429") && attempt < 3) {
        setStatus("Traffic heavy. Waiting 3s to retry...");
        await new Promise(res => setTimeout(res, 3000));
        return generateWithRetry(payload, attempt + 1);
      }
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !file) || loading) return;

    const userMsg = { role: 'user', text: input || (file ? "Sent an attachment" : "") };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    
    const currentInput = input;
    const currentFile = file;
    setInput('');
    setFile(null);

    try {
      setStatus("Connecting to Gemini 1.5...");
      const prompt = `User: ${userData.name}. Role: Expert Student Assistant. Question: ${currentInput}. Use LaTeX for all Math/Physics equations.`;

      let aiText;
      if (currentFile) {
        setStatus("Analyzing file content...");
        const filePart = await fileToGenerativePart(currentFile);
        aiText = await generateWithRetry([prompt, filePart]);
      } else {
        aiText = await generateWithRetry(prompt);
      }

      // Save to Supabase
      await supabase.from('chat_messages').insert([
        { user_id: userData.id, role: 'user', text: currentInput || "Uploaded a file" },
        { user_id: userData.id, role: 'ai', text: aiText }
      ]);

      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "❌ **Connection Error:** I couldn't reach the brain. Check your internet or API key." 
      }]);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] no-print">
      {isOpen && (
        <div className="bg-white w-96 h-[550px] rounded-3xl shadow-2xl border border-indigo-100 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-sm">StudyBuddy AI</p>
                <p className="text-[10px] opacity-70">Status: Stable (v1)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleClearChat} className="hover:text-red-300 transition-colors">🗑️</button>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  m.role === 'ai' ? 'bg-white text-gray-800 border' : 'bg-indigo-600 text-white'
                }`}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            
            {/* BACKGROUND STATUS LOG */}
            {loading && (
              <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-xl w-fit">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                  {status || "Syncing..."}
                </span>
              </div>
            )}
          </div>

          {file && (
            <div className="px-4 py-2 bg-indigo-50 border-t flex items-center justify-between">
              <span className="text-xs text-indigo-600 truncate">📎 {file.name}</span>
              <button onClick={() => setFile(null)} className="text-red-500 text-xs font-bold">Remove</button>
            </div>
          )}

          <div className="p-3 bg-white border-t flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current.click()} className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200">📎</button>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden" accept="image/*,application/pdf" />
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your physics problem..."
                className="flex-1 p-3 bg-gray-100 rounded-2xl outline-none text-sm"
              />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white px-4 rounded-xl">➤</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all border-4 border-white">
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
};

export default ChatScanner;