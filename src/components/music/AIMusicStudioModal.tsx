import React, { useState } from 'react';
import { AIMusicGenerationResult } from '../../types/musicCosmos';
import { Sparkles, Wand2, Music, Layers, Zap, X, Copy, Check, Play } from 'lucide-react';

interface AIMusicStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PROMPTS = [
  'Hypnotic melodic techno with rolling 16th bassline and ethereal vocal chops in F Minor at 128 BPM',
  'Cyberpunk synthwave with saturated 80s gated drums, analog brass leads, and neon nostalgia',
  'Liquid atmospheric Drum & Bass with crisp rolling breaks and deep sub-bass reese in E Minor',
  'Deep hypnotic afro-house with organic congas, warm Rhodes piano, and uplifting groove',
];

export const AIMusicStudioModal: React.FC<AIMusicStudioModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0]);
  const [genre, setGenre] = useState<string>('Melodic Techno');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [result, setResult] = useState<AIMusicGenerationResult>({
    title: 'Neon Odyssey (Astra 128)',
    genre: 'Melodic Techno',
    bpm: 128,
    key: 'F Minor (Fm)',
    mood: 'Hypnotic, Ethereal, Driving Peak-Time',
    arrangement: [
      {
        section: '1. Atmospheric Intro',
        bars: 16,
        energy: 3,
        description: 'Ambient space drone with filtered kick on every 4 beats and sweeping white noise riser.',
        instrumentation: ['Sub Kick (Lowpassed 120Hz)', 'Pulsar Reverb Pad', 'Subtle Shaker'],
      },
      {
        section: '2. Hypnotic Verse',
        bars: 16,
        energy: 5,
        description: 'Rolling 16th-note saw bassline enters with quantized rim clicks and delayed vocal whispers.',
        instrumentation: ['Saw Bass (16th notes)', 'Clap on 2 & 4', 'Vocal Chop Echo', 'Closed Hi-Hat'],
      },
      {
        section: '3. Tension Buildup',
        bars: 8,
        energy: 7,
        description: 'Snare roll accelerates from 8ths to 16ths to 32nds; highpass filter sweeps the master bus up.',
        instrumentation: ['Pitching Snare Roll', 'White Noise Riser', 'Acid Pluck Lead', 'Sub Drop Down'],
      },
      {
        section: '4. Peak Drop 1',
        bars: 32,
        energy: 9,
        description: 'Full unconstrained sub kick and screaming unison supersaw hook; maximum dancefloor kinetic drive.',
        instrumentation: ['Full 909 Kick', 'Unison Supersaw Lead', 'Driving Off-beat Open Hat', '808 Sub-Rumble'],
      },
      {
        section: '5. Melodic Breakdown',
        bars: 16,
        energy: 4,
        description: 'Beats cut out completely; lush 7th-chord progression shines with emotional arpeggiated piano.',
        instrumentation: ['Lush Detuned Pad (Fm - Db - Ab - Eb)', 'Celestial Arpeggio', 'Sidechained Reverb Tail'],
      },
      {
        section: '6. Climax Clustered Drop',
        bars: 32,
        energy: 10,
        description: 'Second drop with added syncopated counter-melodies and heavy tape saturation grit.',
        instrumentation: ['Master Bus Saturator', 'Twin Lead Synths', 'Layered Crash Cymbals', 'Sub Punch'],
      },
      {
        section: '7. Outro DJ Tool',
        bars: 16,
        energy: 4,
        description: 'Stripped back to rhythmic kick and rolling hat for seamless DJ set crossfade mixing.',
        instrumentation: ['Stripped Kick', 'Minimal Hat', 'Filtering Low-pass Pad'],
      },
    ],
    chordProgression: 'i - VI - III - VII (Fm7 → Dbmaj7 → Abmaj7 → Eb7)',
    synthRecipe: 'Osc 1: Sawtooth (16-voice unison, 18% detune). Filter: 24dB Moog Ladder Lowpass with envelope decay at 340ms. FX: Ping-pong delay on 3/16 dotted note + Shimmer Reverb.',
    mixingNotes: 'Sidechain compress the rolling bassline to the kick with 4:1 ratio and 45ms release to create that hypnotic pump. Boost 3.2kHz on the lead pluck for club presence.',
  });

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        title: `Cosmic Pulse ${Math.floor(Math.random() * 900 + 100)}`,
        genre: genre,
        bpm: genre === 'Liquid D&B' ? 174 : genre === 'Cyberpunk Synthwave' ? 112 : 128,
        key: 'D Minor (Dm)',
        mood: 'Electrifying, Cinematic, Deep Cybernetic',
        arrangement: [
          {
            section: '1. Nebula Intro',
            bars: 16,
            energy: 3,
            description: 'Low-frequency sub-bass drone and isolated atmospheric tape delay swells.',
            instrumentation: ['Sub Drone', 'Analog Tape Chords', 'Lowpass Shakers'],
          },
          {
            section: '2. Melodic Groove',
            bars: 16,
            energy: 6,
            description: 'Main melodic theme establishes with syncopated bass and punchy rim clicks.',
            instrumentation: ['Analog Bassline', 'Rim Click', 'Arpeggio Lead', '16th Hi-Hats'],
          },
          {
            section: '3. High-Voltage Buildup',
            bars: 8,
            energy: 8,
            description: 'Filter sweeps high; stuttering vocal motif speeds into laser sweep drop.',
            instrumentation: ['Stutter Gate Vocal', 'Tension Snare', 'Laser Sweep', 'Sub Lifter'],
          },
          {
            section: '4. Main Drop',
            bars: 32,
            energy: 10,
            description: 'Heavy bass impact with stereo detuned lead riffs driving peak euphoria.',
            instrumentation: ['Hard Punch Kick', 'Screaming Hook Synth', 'Sub Saturated Bass', 'Open Hats'],
          },
          {
            section: '5. Space Breakdown',
            bars: 16,
            energy: 4,
            description: 'All percussion mutes; rich choral pad voices ring out in cavernous reverb space.',
            instrumentation: ['Choir Pad', 'Reverb Tails', 'Single Note Pluck'],
          },
          {
            section: '6. Climax Final Drop',
            bars: 32,
            energy: 10,
            description: 'Total sonic power with all layers active plus rhythmic acid sequence.',
            instrumentation: ['Acid 303 Resonance', 'Full Drums', 'Hook Lead', 'Sub Boom'],
          },
          {
            section: '7. Outro DJ Extender',
            bars: 16,
            energy: 3,
            description: 'Percussive groove tailored for DJ mix-outs.',
            instrumentation: ['Dry Kick', 'Minimal Hat'],
          },
        ],
        chordProgression: 'i - iv - VII - III (Dm → Gm → C → F)',
        synthRecipe: 'Dual Wavetable Oscillator (PWM & Acid Saw). LFO 1 mapped to Cutoff and Stereo Pan. Distortion: Tube overdrive drive at 22%.',
        mixingNotes: 'Cut below 30Hz on master bus. Brickwall limit at -0.3 dB True Peak. Target -14 LUFS for streaming release.',
      });
    }, 900);
  };

  const handleCopy = () => {
    const text = `TITLE: ${result.title}\nGENRE: ${result.genre} (${result.bpm} BPM) in ${result.key}\nCHORDS: ${result.chordProgression}\nSYNTH RECIPE: ${result.synthRecipe}\n\nARRANGEMENT:\n${result.arrangement.map((a) => `${a.section} (${a.bars} bars): ${a.description}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-[#030712]/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Earth & Moon Node
                </span>
                <span className="text-xs text-slate-400 font-mono">Composition Studio</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Music Generator & Track Blueprint Architect
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

        {/* Prompt Input Bar */}
        <div className="p-4 md:p-6 border-b border-white/10 bg-black/40 space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your musical vision (genre, mood, instrumentation, tempo, key)..."
                className="w-full px-4 py-3 bg-white/5 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
              />
              <Wand2 className="w-4 h-4 text-cyan-400 absolute right-3 top-3.5" />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Blueprint'}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-slate-400">
            <span className="font-mono text-[10px] uppercase text-slate-500 shrink-0">Inspire:</span>
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg whitespace-nowrap text-slate-300 truncate max-w-[220px]"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Output Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Track Summary Card */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                COMPOSITION ARCHITECTURE
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{result.title}</h3>
              <p className="text-xs text-cyan-200">{result.mood}</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-cyan-300">
                {result.bpm} BPM
              </span>
              <span className="px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-amber-300">
                KEY: {result.key}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Arrangement Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arrangement Structure ({result.arrangement.reduce((a, s) => a + s.bars, 0)} Total Bars)</span>
            </h4>

            <div className="space-y-2">
              {result.arrangement.map((section, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{section.section}</span>
                      <span className="px-2 py-0.5 bg-black/40 border border-white/10 rounded text-cyan-300 font-mono text-[11px]">
                        {section.bars} Bars
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Energy: {section.energy}/10
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{section.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 shrink-0 max-w-xs">
                    {section.instrumentation.map((inst, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 rounded text-[10px] font-mono"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Harmonic Progression & Sound Design Recipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="font-bold text-slate-200 uppercase font-mono text-[11px] text-cyan-400">
                Harmonic Progression & Chord Chart
              </div>
              <p className="font-mono text-white text-sm bg-black/40 p-2.5 rounded-lg border border-white/10">
                {result.chordProgression}
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Perfect cadence for dark, melodic club tension. Resolves seamlessly across 8-bar cycles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="font-bold text-slate-200 uppercase font-mono text-[11px] text-cyan-400">
                Synthesizer Patch Recipe
              </div>
              <p className="text-slate-300 text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/10 leading-relaxed">
                {result.synthRecipe}
              </p>
              <p className="text-slate-400 text-[11px]">
                {result.mixingNotes}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
