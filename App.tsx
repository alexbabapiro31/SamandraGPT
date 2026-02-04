import React, { useState, useRef, useEffect } from 'react';
import { generateTextResponse, generateImageResponse } from './services/geminiService';
import { Message, MessageRole, ModelMode } from './types';
import MessageBubble from './components/MessageBubble';
import { IconSparkles, IconImage, IconSend, IconCode } from './components/Icons';

export default function App() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.Model,
      content: "**Merhaba! Ben Gemini Omega.**\n\nGemini 3 Pro mimarisi üzerine inşa edilmiş, gelişmiş Nano Banana Pro görsel yetenekleri ve üstün kodlama becerileriyle donatılmış yapay zekayım. \n\nTürkçe konuşuyorum ve en karmaşık görevlerde size yardımcı olmaya hazırım.\n\nBugün ne yaratmak istersiniz?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ModelMode>(ModelMode.Text);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: MessageRole.User,
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    // Create a placeholder for the response
    const botMsgId = (Date.now() + 1).toString();
    const placeholderMessage: Message = {
      id: botMsgId,
      role: MessageRole.Model,
      content: '',
      isThinking: true,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      if (mode === ModelMode.Image) {
        // Nano Banana Pro Logic
        const result = await generateImageResponse(newUserMessage.content);
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { 
                ...msg, 
                content: `**Nano Banana Pro** tarafından oluşturulan görsel:\n\n"${result.prompt}"`, 
                imageUrl: result.imageUrl,
                isThinking: false 
              } 
            : msg
        ));
      } else {
        // Gemini 3 Pro (Omega) Logic
        // Construct history for context
        const history = messages.map(m => ({
            role: m.role === MessageRole.User ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const responseText = await generateTextResponse(history, newUserMessage.content);
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, content: responseText, isThinking: false } 
            : msg
        ));
      }
    } catch (error: any) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, content: `**Hata:** ${error.message}`, isThinking: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative selection:bg-primary-500/30 selection:text-primary-200">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-primary-500 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <span className="text-black font-bold text-lg">Ω</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">GEMINI <span className="text-primary-400">OMEGA</span></h1>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                    System Online • {mode === ModelMode.Text ? 'G-3 PRO' : 'NANO BANANA PRO'}
                </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => setMode(ModelMode.Text)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${mode === ModelMode.Text ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
                <IconCode className="w-3.5 h-3.5" />
                <span>Omega Logic</span>
            </button>
            <button 
                onClick={() => setMode(ModelMode.Image)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${mode === ModelMode.Image ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
            >
                <IconImage className="w-3.5 h-3.5" />
                <span>Banana Pro</span>
            </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="relative z-20 flex-shrink-0 p-4 bg-gradient-to-t from-black via-gray-950 to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <div className={`
            bg-gray-900 border transition-colors duration-300 rounded-2xl flex items-end p-2 shadow-2xl
            ${isLoading ? 'border-gray-700 opacity-50' : 'border-gray-700 hover:border-gray-600 focus-within:border-primary-500/50'}
            ${mode === ModelMode.Image ? 'ring-1 ring-purple-500/20' : ''}
          `}>
            
            {/* Context Icon */}
            <div className="p-3 text-gray-400">
                {mode === ModelMode.Text ? <IconSparkles className="w-5 h-5" /> : <IconImage className="w-5 h-5" />}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={mode === ModelMode.Text ? "Gemini Omega ile Türkçe kodlayın veya tartışın..." : "Nano Banana Pro ile ne çizmek istersiniz?..."}
              className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm md:text-base p-3 focus:outline-none resize-none max-h-32 min-h-[48px]"
              rows={1}
              style={{ minHeight: '48px' }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`
                p-3 rounded-xl m-1 transition-all duration-200
                ${!input.trim() || isLoading 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : mode === ModelMode.Text 
                    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                }
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <IconSend className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600 font-mono">
              POWERED BY GEMINI 3 PRO & NANO BANANA PRO
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}