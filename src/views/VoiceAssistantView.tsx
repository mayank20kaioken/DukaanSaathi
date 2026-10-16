import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  Users, 
  Package, 
  PhoneCall, 
  Info, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { VoiceAssistantResponse } from '../services/voiceAssistantEngine';
import { formatINR } from '../utils/formatters';

export const VoiceAssistantView: React.FC = () => {
  const { voiceEngine, language, activeShop, theme } = useApp();
  const isHi = language === 'hi';
  const isDark = theme === 'dark';

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<VoiceAssistantResponse[]>([]);

  const recognitionRef = useRef<any>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        setInputText(current);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    if (history.length === 0) {
      const initial: VoiceAssistantResponse = {
        query: 'Namaste',
        matchedIntent: 'WELCOME',
        textEn: "Namaste! I am your AI Business Partner. Ask me in Hindi or English: 'Aaj ki total sale kitni hui?', 'Maggi ka buying aur selling price batao', 'Sabse zyada munafa kis product mein hai?', or 'Sharma Traders ka contact kya hai?'",
        textHi: "नमस्ते! मैं आपका दुकान साथी एआई हूँ। आप मुझसे हिंदी में पूछ सकते हैं: 'आज की कुल बिक्री कितनी हुई?', 'मैगी का खरीद और बिक्री रेट बताओ', 'सबसे ज्यादा मुनाफा किस सामान में है?', या 'शर्मा ट्रेडर्स का नंबर क्या है?'",
        spokenText: "नमस्ते! मैं आपका दुकान साथी हूँ। आप आज की बिक्री, किसी सामान का रेट या उधारी के बारे में पूछ सकते हैं।",
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
      setHistory([initial]);
    }
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Microphone speech recognition is not supported in this browser engine. You can type queries below in Hindi or English.");
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
        console.warn('Recognition start failed:', err);
      }
    }
  };

  const handleSend = (text?: string) => {
    const q = text || inputText;
    if (!q.trim()) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsProcessing(true);
    setInputText('');

    setTimeout(() => {
      const res = voiceEngine.processQuery(q);
      setHistory(prev => [...prev, res]);
      setIsProcessing(false);
      if (voiceEnabled) speakText(res.spokenText);
    }, 350);
  };

  const topicPresets = [
    { label: '💰 आज की बिक्री', query: 'Aaj ki total sale kitni hui?' },
    { label: '📦 मैगी का मार्जिन', query: 'Maggi ka buying aur selling price batao' },
    { label: '📈 सबसे ज्यादा मुनाफा', query: 'Sabse zyada munafa kis product mein hai?' },
    { label: '📕 टॉप उधारी ग्राहक', query: 'Kis customer ka sabse zyada udhaar baaki hai?' },
    { label: '⚠️ कम स्टॉक अलर्ट', query: 'Kaunse products dobara order karne hain?' },
    { label: '📞 सप्लायर नंबर', query: 'Mere supplier Sharma Traders ka number kya hai?' }
  ];

  return (
    <div className={`p-4 lg:p-7 space-y-5 max-w-5xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col transition-colors ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* Studio Header */}
      <div className={`flex items-center justify-between pb-3 border-b shrink-0 ${
        isDark ? 'border-navy-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lime-accent/20 to-mint-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent shadow-lime-glow">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl lg:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-navy-950'}`}>
                {isHi ? 'दुकान साथी — हिंदी वॉयस AI स्टूडियो' : 'DukaanSaathi — Hindi Voice AI Studio'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-accent/20 text-lime-accent border border-lime-accent/30">
                Web Speech AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Speak or ask in colloquial Hindi / Hinglish. Queries query your store's live ledger and inventory.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            voiceEnabled 
              ? isDark ? 'bg-navy-800 border-lime-accent/40 text-lime-accent' : 'bg-white border-emerald-500 text-emerald-700 shadow-sm'
              : isDark ? 'bg-navy-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-500'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-lime-accent" /> : <VolumeX className="w-4 h-4" />}
          <span>{voiceEnabled ? 'Audio Voice On' : 'Voice Muted'}</span>
        </button>
      </div>

      {/* Suggested Topic Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggestions:
        </span>
        {topicPresets.map((t, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(t.query)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              isDark 
                ? 'bg-navy-800/80 hover:bg-navy-700 border-slate-700 text-slate-200 hover:text-white hover:border-lime-accent/40' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 shadow-xs'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Conversation Stream */}
      <div className={`flex-1 overflow-y-auto rounded-3xl p-5 space-y-4 border shadow-surface-dark transition-colors ${
        isDark ? 'bg-navy-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        {history.map((item, idx) => (
          <div key={idx} className="space-y-3">
            {/* User message bubble */}
            {item.matchedIntent !== 'WELCOME' && (
              <div className="flex justify-end">
                <div className={`max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs font-medium shadow-sm border ${
                  isDark ? 'bg-navy-800 text-white border-slate-700' : 'bg-navy-900 text-white border-navy-800'
                }`}>
                  <p>{item.query}</p>
                </div>
              </div>
            )}

            {/* DukaanSaathi AI Assistant response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime-accent/20 border border-lime-accent/40 text-lime-accent flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-lime-accent" />
              </div>
              <div className="flex-1 space-y-3 max-w-[92%]">
                <div className={`p-4 rounded-2xl rounded-tl-sm border text-xs shadow-md space-y-2 ${
                  isDark ? 'bg-navy-950/90 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <p className="font-hindi text-sm lg:text-base text-slate-100 font-semibold leading-relaxed">
                    {item.textHi}
                  </p>
                  <p className={`text-xs border-t pt-2 leading-relaxed ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                  }`}>
                    {item.textEn}
                  </p>
                </div>

                {/* Verifiable Database Record Evidence Card */}
                {item.evidenceData && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2 border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lime-accent flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime-accent" />
                        <span>Verifiable Database Record Evidence</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Source: {activeShop.name} Active Ledger
                      </span>
                    </div>

                    {/* PRODUCT EVIDENCE WITH MARGIN BREAKDOWN */}
                    {item.evidenceType === 'PRODUCT' && item.evidenceData.product && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm text-white">{item.evidenceData.product.name}</p>
                            <p className="text-[11px] text-slate-400">
                              SKU: {item.evidenceData.product.sku} • In Stock: <strong className="text-white">{item.evidenceData.product.stock} {item.evidenceData.product.unit}s</strong>
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            item.evidenceData.product.stock <= item.evidenceData.product.minStock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-mint-accent/20 text-mint-accent border border-mint-accent/30'
                          }`}>
                            {item.evidenceData.product.stock <= item.evidenceData.product.minStock ? 'Low Stock Warning' : 'Optimal Stock'}
                          </span>
                        </div>

                        {/* Financial Rate Card */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block uppercase">Wholesale Buy Rate</span>
                            <span className="text-xs font-extrabold text-slate-200 font-mono">
                              {formatINR(item.evidenceData.product.costPrice)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block uppercase">Retail Selling Price</span>
                            <span className="text-xs font-extrabold text-lime-accent font-mono">
                              {formatINR(item.evidenceData.product.sellingPrice)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block uppercase">Profit Margin (₹)</span>
                            <span className="text-xs font-extrabold text-mint-accent font-mono">
                              +{formatINR(item.evidenceData.margins?.margin)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block uppercase">Margin Rate (%)</span>
                            <span className="text-xs font-black text-lime-accent font-mono">
                              {item.evidenceData.margins?.marginPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CUSTOMER UDHAAR EVIDENCE */}
                    {item.evidenceType === 'CUSTOMER' && item.evidenceData.topDebtor && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-navy-900 border border-slate-800">
                        <div>
                          <p className="font-bold text-white text-sm">{item.evidenceData.topDebtor.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Phone: {item.evidenceData.topDebtor.phone} • Status: <strong className="text-rose-400">{item.evidenceData.topDebtor.overdueDays} days overdue</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1.5 rounded-xl text-sm font-black bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 inline-block">
                            Outstanding: {formatINR(item.evidenceData.topDebtor.computedBalance)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* SUPPLIER CONTACT EVIDENCE */}
                    {item.evidenceType === 'SUPPLIER' && item.evidenceData.supplier && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-navy-900 border border-slate-800">
                        <div>
                          <p className="font-bold text-white text-sm">{item.evidenceData.supplier.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Category: {item.evidenceData.supplier.category} • Rep: {item.evidenceData.supplier.contactPerson}
                          </p>
                        </div>
                        <a
                          href={`tel:${item.evidenceData.supplier.phone}`}
                          className="px-3.5 py-2 rounded-xl bg-lime-accent/20 text-lime-accent font-bold text-xs flex items-center justify-center gap-1.5 border border-lime-accent/30 hover:bg-lime-accent hover:text-navy-950 transition-all"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call: {item.evidenceData.supplier.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Follow up suggestion chips */}
                {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.suggestedFollowUps.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSend(chip)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all text-left ${
                          isDark 
                            ? 'bg-navy-950 hover:bg-navy-900 text-lime-accent border-lime-accent/20 hover:border-lime-accent/50' 
                            : 'bg-white hover:bg-slate-50 text-emerald-700 border-emerald-500/30 shadow-xs'
                        }`}
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

        {isProcessing && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-lime-accent/20 text-lime-accent flex items-center justify-center animate-spin">
              <Sparkles className="w-4 h-4 text-lime-accent" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-navy-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-accent animate-ping" />
              <span>Analyzing store database records...</span>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Listening Waveform Indicator Banner (Shows during recording) */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between text-xs animate-in fade-in shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold text-rose-300">
              Listening... Speak in Hindi or English (e.g. "आज की कुल बिक्री कितनी हुई?")
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-rose-500 animate-waveform-1 rounded-full" />
            <span className="w-1 h-5 bg-rose-500 animate-waveform-2 rounded-full" />
            <span className="w-1 h-4 bg-rose-500 animate-waveform-3 rounded-full" />
            <span className="w-1 h-6 bg-rose-500 animate-waveform-4 rounded-full" />
          </div>
        </div>
      )}

      {/* Input Console Bar */}
      <div className={`p-3.5 rounded-3xl border flex items-center gap-3 shrink-0 shadow-surface-dark transition-colors ${
        isDark ? 'bg-navy-950 border-slate-800' : 'bg-white border-slate-200 shadow-md'
      }`}>
        {/* Animated Mic Button */}
        <div className="relative shrink-0">
          <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 scale-105 shadow-lg' 
                : 'bg-lime-accent text-navy-950 shadow-lime-glow hover:bg-lime-hover active:scale-95'
            }`}
            title={isListening ? "Stop listening" : "Tap to speak Hindi or English"}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
          {isListening && (
            <div className="absolute -inset-1 rounded-2xl bg-rose-500/20 animate-radar -z-10" />
          )}
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isHi ? "हिंदी में बोलें या टाइप करें (उदा. 'मैगी का सेलिंग प्राइस बताओ')..." : "Speak or type in Hindi/English: 'Maggi ka selling price', 'Today's sales'..."}
            className={`w-full pl-4 pr-11 py-3 rounded-2xl text-xs placeholder-slate-400 focus:outline-none transition-colors border ${
              isDark 
                ? 'bg-navy-900 border-slate-700 text-white focus:border-lime-accent' 
                : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-emerald-500'
            }`}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-lime-accent text-navy-950 disabled:opacity-30 hover:bg-lime-hover transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
