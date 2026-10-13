import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Bot, User, Disc, Wand2 } from 'lucide-react';

interface BrainstormChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'Suggest 3 unexpected 128 BPM mashups for tech-house drops',
  'Serum sound design recipe for an aggressive rolling 808 bass',
  'Camelot Wheel transition from 8A (A Minor) to build peak club tension',
  '5 cybernetic electronic EP titles with dark sci-fi branding',
];

export const BrainstormChatModal: React.FC<BrainstormChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Greetings, Producer. I am your Jupiter Production & DJ Brainstorm Copilot. Ask me for mashup combinations, Camelot wheel harmonic mixing transitions, Serum synth patch recipes, or club set arrangements.',
      time: '12:00',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('mashup')) {
        reply = `Here are 3 unexpected high-impact 128 BPM mashups tailored for peak-time energy:
1. **Classic R&B Vocal x Hypnotic Melodic Techno**:
   - Acapella: TLC "No Scrubs" (pitched down 1 semitone to F Minor)
   - Instrumental: Adam Beyer / Bart Skils "Your Mind"
   - Transition: Filter out TLC at bar 15, let the heavy sub kick drop solo at the 16th bar.
2. **Indie Rock Hook x Rolling Peak Acid**:
   - Acapella: The Killers "Somebody Told Me" (BPM stretched to 128)
   - Instrumental: Enrico Sangiuliano "Astral Projection"
   - Impact: Maximum nostalgia sing-along abruptly crushed by aggressive 303 acid resonance.
3. **90s Rave Vocal x Modern Cyber Tech**:
   - Acapella: Robin S "Show Me Love"
   - Instrumental: Eli Brown / HI-LO style rolling sub bass.`;
      } else if (lower.includes('serum') || lower.includes('sound design') || lower.includes('bass')) {
        reply = `**Aggressive Rolling 808 / Tech Bass Patch Recipe**:
- **Osc A**: 'Basic Shapes' (Square wave, Table Pos 2). Octave -1, Semi 0.
- **Osc B**: 'Jnk Saw' (Wavetable). Octave -2, Level 65%, Detune 8%.
- **Sub Osc**: Pure Sine, Octave -1, Direct Out enabled.
- **Filter**: MG Low 18dB. Cutoff at 140 Hz, Res at 25%, Drive at 18%.
- **LFO 1**: Set to 1/16 rate in 'Trigger' mode. Shape a steep exponential decay curve and route to Filter Cutoff (depth +35) for that signature hypnotic rolling gallop.
- **FX Rack**: Hyper/Dimension (low mix), Distortion (Tube Drive at 30%), Multiband Compressor (OTT upward comp +2dB).`;
      } else if (lower.includes('camelot') || lower.includes('transition') || lower.includes('wheel')) {
        reply = `**Harmonic Energy Shift from 8A (A Minor)**:
- **Standard Harmonic Mix (Smooth)**: 7A (D Minor) or 9A (E Minor) maintains harmonious continuity.
- **Energy Boost (+1 Step Energy)**: Modulate to **3A (G Minor)** or shift +2 to **10A (B Minor)**. The pitch lift creates a palpable psychoacoustic adrenaline surge on the dancefloor.
- **Dark Dominant Jump (+7 Semitones)**: Jump from 8A to **5A (C Minor)** right before the breakdown. The unexpected harmonic shift commands instant audience attention.`;
      } else {
        reply = `**Creative Music Concept & Execution Plan**:
- **Concept**: Integrate industrial metallic transients with warm analog Rhodes keys to contrast cybernetic grit with human emotion.
- **Rhythmic Blueprint**: Syncopated 16th-note hi-hat groove at 128 BPM, with off-beat claps and dynamic velocity ghost notes.
- **Actionable Step**: Try layering a low-passed vinyl crackle texture on your breakdown to give your digital synths analog tape warmth before the climax drop.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[88vh] flex flex-col bg-[#030712]/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Jupiter Node
                </span>
                <span className="text-xs text-slate-400 font-mono">Creative Studio Copilot</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Brainstorm & Songwriting Chat Hub
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-black/40 border-b border-white/10 overflow-x-auto text-xs">
          <span className="font-mono text-[10px] uppercase text-cyan-400 shrink-0">Fast Ask:</span>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg whitespace-nowrap text-slate-300 truncate max-w-[240px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-500 text-black font-medium shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div
                    className={`text-[10px] mt-2 font-mono text-right ${
                      isUser ? 'text-black/60' : 'text-slate-500'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Jupiter AI is formulating production recipe...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about mashups, sound design recipes, harmonic transitions, or track concepts..."
            className="flex-1 px-4 py-3 bg-white/5 border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleSend()}
            className="p-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold transition-all shadow-md shadow-cyan-500/25 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
