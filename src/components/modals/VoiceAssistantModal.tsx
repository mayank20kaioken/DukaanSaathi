import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  PhoneCall, 
  ArrowRight,
  Info
} from 'lucide-react';
import { VoiceAssistantResponse } from '../../services/voiceAssistantEngine';
import { formatINR } from '../../utils/formatters';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView
}) => {
  const { voiceEngine, language } = useApp();
  const isHi = language === 'hi';

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<VoiceAssistantResponse[]>([]);

  const recognitionRef = useRef<any>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setInputText(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && history.length === 0) {
      const welcome: VoiceAssistantResponse = {
        query: 'Namaste',
        matchedIntent: 'WELCOME',
        textEn: "Namaste! I am your AI Business Partner. Ask me anything about your today's sales, product cost & selling prices, customer udhaar khata, or supplier contacts in Hindi or English.",
        textHi: "नमस्ते! मैं आपका दुकान साथी एआई हूँ। मुझसे आज की बिक्री, किसी सामान का खरीद व बिक्री रेट, ग्राहकों की उधारी या सप्लायर के नंबर के बारे में हिंदी या इंग्लिश में पूछें।",
        spokenText: "नमस्ते! मैं आपका दुकान साथी हूँ। आप मुझसे आज की बिक्री या किसी सामान के रेट के बारे में पूछ सकते हैं।",
        evidenceType: 'GENERAL',
        suggestedFollowUps: [
          'Aaj ki total sale kitni hui?',
          'Maggi ka khareedne ka rate aur selling price batao',
          'Sabse zyada munafa kis product mein hai?',
          'Kis customer ka sabse zyada udhaar baaki hai?',
          'Kaunse products dobara order karne hain?',
          'Mere supplier Sharma Traders ka number kya hai?'
        ]
      };
      setHistory([welcome]);
      if (voiceEnabled) speakText(welcome.spokenText);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  // Text-To-Speech function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Speech recognition isn't supported in this browser. Please type your query in the text box below.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputText;
    if (!q.trim()) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsProcessing(true);
    setInputText('');

    // Brief processing delay for lifelike interaction
    setTimeout(() => {
      const response = voiceEngine.processQuery(q);
      setHistory(prev => [...prev, response]);
      setIsProcessing(false);
      if (voiceEnabled) {
        speakText(response.spokenText);
      }
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[720px] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-navy-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-accent/20 to-mint-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent shadow-lime-glow">
              <Mic className="w-5 h-5" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-lime-accent ring-2 ring-navy-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {isHi ? 'दुकान साथी हिंदी वॉयस AI' : 'Hindi Voice Business Assistant'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent/20 text-lime-accent border border-lime-accent/30">
                  LIVE AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHi ? 'हिंदी, हिंग्लिश या इंग्लिश में अपनी दुकान के बारे में पूछें' : 'Speaks & understands Hindi, Hinglish & English'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice toggle */}
            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className={`p-2 rounded-xl border transition-colors ${
                voiceEnabled 
                  ? 'bg-navy-800 border-lime-accent/40 text-lime-accent' 
                  : 'bg-navy-800 border-slate-700 text-slate-500'
              }`}
              title={voiceEnabled ? "Mute voice playback" : "Enable voice response"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-2">
              {/* User question bubble if not initial greeting */}
              {item.matchedIntent !== 'WELCOME' && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy-700 px-4 py-2.5 text-xs text-white border border-slate-600/60 shadow">
                    <p className="font-medium">{item.query}</p>
                  </div>
                </div>
              )}

              {/* AI Answer Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-lime-accent/15 border border-lime-accent/30 text-lime-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-2.5 max-w-[92%]">
                  <div className="rounded-2xl rounded-tl-sm bg-navy-800/90 border border-slate-700/80 p-4 text-xs shadow-lg space-y-2">
                    {/* Hindi Main Text */}
                    <p className="font-hindi text-sm text-slate-100 font-medium leading-relaxed">
                      {item.textHi}
                    </p>
                    {/* English Translation */}
                    <p className="text-[11px] text-slate-400 border-t border-slate-700/50 pt-1.5 leading-normal">
                      {item.textEn}
                    </p>
                  </div>

                  {/* EVIDENCE PANEL: Shows underlying database records! */}
                  {item.evidenceData && (
                    <div className="rounded-xl bg-navy-950/90 border border-slate-800 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-lime-accent">
                        <span className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-lime-accent" />
                          <span>Shop Record Evidence</span>
                        </span>
                        <span className="text-slate-500 font-mono">Real-time DB query</span>
                      </div>

                      {/* Product Evidence Card */}
                      {item.evidenceType === 'PRODUCT' && item.evidenceData.product && (
                        <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-xs">{item.evidenceData.product.name}</p>
                            <p className="text-[11px] text-slate-400">
                              SKU: {item.evidenceData.product.sku} • Stock: {item.evidenceData.product.stock} {item.evidenceData.product.unit}s
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">Cost: <strong className="text-white">{formatINR(item.evidenceData.product.costPrice)}</strong></span>
                              <span className="text-[11px] text-slate-400">MRP: <strong className="text-lime-accent">{formatINR(item.evidenceData.product.sellingPrice)}</strong></span>
                            </div>
                            <p className="text-[10px] text-mint-accent font-semibold mt-0.5">
                              Profit: {formatINR(item.evidenceData.margins?.margin)} ({item.evidenceData.margins?.marginPercent}%)
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Customer Evidence Card */}
                      {item.evidenceType === 'CUSTOMER' && item.evidenceData.topDebtor && (
                        <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-xs">{item.evidenceData.topDebtor.name}</p>
                            <p className="text-[11px] text-slate-400">Phone: {item.evidenceData.topDebtor.phone} • {item.evidenceData.topDebtor.overdueDays} days overdue</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-rose-500/20 text-rose-300">
                              {formatINR(item.evidenceData.topDebtor.computedBalance)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Supplier Evidence Card */}
                      {item.evidenceType === 'SUPPLIER' && item.evidenceData.supplier && (
                        <div className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-xs">{item.evidenceData.supplier.name}</p>
                            <p className="text-[11px] text-slate-400">Contact: {item.evidenceData.supplier.contactPerson}</p>
                          </div>
                          <div className="text-right">
                            <a 
                              href={`tel:${item.evidenceData.supplier.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-lime-accent/20 text-lime-accent font-bold text-xs hover:bg-lime-accent/30"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{item.evidenceData.supplier.phone}</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Reorder Evidence List */}
                      {item.evidenceType === 'REORDER' && item.evidenceData.lowStockProducts && (
                        <div className="space-y-1">
                          {item.evidenceData.lowStockProducts.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-navy-900/60">
                              <span className="text-slate-200">{p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}</span>
                              <span className="text-amber-400 font-mono">Stock: {p.stock} (Min: {p.minStockThreshold})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contextual Action / Follow-Up Chips */}
                  {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.suggestedFollowUps.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSend(chip)}
                          className="px-2.5 py-1 rounded-full text-[11px] bg-navy-800 hover:bg-navy-700 text-lime-accent border border-lime-accent/20 transition-all active:scale-95 text-left"
                        >
                          💬 {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Animated Processing State */}
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center animate-spin">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-navy-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <span>DukaanSaathi AI thinking...</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>

        {/* Sound Wave Animation when microphone is listening */}
        {isListening && (
          <div className="px-5 py-2.5 bg-navy-950 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-semibold text-rose-400">
                Listening in Hindi / English... Bolte rahiye
              </span>
            </div>
            {/* Audio frequency wave bars */}
            <div className="flex items-center gap-1 h-6">
              <div className="w-1 bg-lime-accent rounded-full h-3 animate-voice-bar-1" />
              <div className="w-1 bg-lime-accent rounded-full h-5 animate-voice-bar-2" />
              <div className="w-1 bg-lime-accent rounded-full h-6 animate-voice-bar-3" />
              <div className="w-1 bg-lime-accent rounded-full h-4 animate-voice-bar-4" />
              <div className="w-1 bg-lime-accent rounded-full h-2 animate-voice-bar-5" />
            </div>
          </div>
        )}

        {/* Input & Microphone Bar */}
        <div className="p-4 bg-navy-950 border-t border-slate-800 flex items-center gap-2.5">
          {/* Animated Microphone Toggle Button */}
          <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg ring-4 ring-rose-500/30 scale-105'
                : 'bg-lime-accent text-navy-950 hover:bg-lime-hover shadow-lime-glow'
            }`}
            title={isListening ? "Stop listening" : "Start speaking Hindi/English"}
          >
            {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Fallback */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isHi ? "हिंदी या इंग्लिश में टाइप करें या माइक दबाकर बोलें..." : "Type or speak: 'Maggi ka selling price batao', 'Today's sales'..."}
              className="w-full pl-4 pr-11 py-3 rounded-2xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-lime-accent/80 focus:ring-1 focus:ring-lime-accent/40"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-lime-accent text-navy-950 disabled:opacity-30 disabled:pointer-events-none hover:bg-lime-hover transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
