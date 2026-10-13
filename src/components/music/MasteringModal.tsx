import React, { useState } from 'react';
import { Sliders, Activity, Zap, X, Volume2, ShieldCheck, Waves } from 'lucide-react';

interface MasteringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasteringModal: React.FC<MasteringModalProps> = ({ isOpen, onClose }) => {
  const [targetPreset, setTargetPreset] = useState<string>('Spotify (-14 LUFS)');
  const [stereoWidth, setStereoWidth] = useState<number>(120); // 100% is normal
  const [tubeWarmth, setTubeWarmth] = useState<number>(24);
  const [limiterCeiling, setLimiterCeiling] = useState<number>(-0.3);
  const [currentLufs, setCurrentLufs] = useState<number>(-14.2);

  // 8-Band Parametric EQ Gains (-6 to +6 dB)
  const [eqBands, setEqBands] = useState<number[]>([1.5, 0.5, -1.0, 0, 1.2, -0.5, 2.0, 1.8]);
  const frequencies = ['30Hz', '65Hz', '160Hz', '400Hz', '1kHz', '2.5kHz', '6kHz', '16kHz'];

  if (!isOpen) return null;

  const handleSelectPreset = (preset: string, lufs: number, ceiling: number) => {
    setTargetPreset(preset);
    setCurrentLufs(lufs);
    setLimiterCeiling(ceiling);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-[#030712]/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Saturn Node
                </span>
                <span className="text-xs text-slate-400 font-mono">Precision Mastering</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Audio Mastering & Real-Time Spectral Suite
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

        {/* Target Platforms Presets */}
        <div className="flex items-center justify-between gap-3 px-6 py-2.5 border-b border-white/10 bg-black/40 text-xs">
          <span className="font-mono text-[11px] text-slate-400 uppercase">
            Streaming Target Standards:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { label: 'Spotify (-14 LUFS)', lufs: -14.0, ceiling: -1.0 },
              { label: 'Beatport / Club (-9 LUFS)', lufs: -9.2, ceiling: -0.1 },
              { label: 'Apple Music (-16 LUFS)', lufs: -16.0, ceiling: -1.0 },
              { label: 'YouTube (-13 LUFS)', lufs: -13.0, ceiling: -0.5 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(p.label, p.lufs, p.ceiling)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  targetPreset === p.label
                    ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Animated Spectral Display & EQ Curve */}
          <div className="p-4 rounded-2xl bg-black/70 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 animate-pulse" />
                REAL-TIME FFT SPECTRAL ANALYZER
              </span>
              <span className="text-emerald-400 font-bold">
                INTEGRATED LOUDNESS: {currentLufs.toFixed(1)} LUFS
              </span>
            </div>

            {/* Visualizer Wave Bars */}
            <div className="h-32 rounded-xl bg-slate-950/80 border border-white/10 p-3 flex items-end gap-1.5 overflow-hidden relative">
              {/* Subtle background grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b20f_1px,transparent_1px),linear-gradient(to_bottom,#0891b20f_1px,transparent_1px)] bg-[size:16px_16px]" />

              {Array.from({ length: 48 }).map((_, idx) => {
                const heightPercent = 20 + Math.sin(idx * 0.35) * 35 + Math.cos(idx * 0.7) * 20;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-cyan-600 via-cyan-400 to-white rounded-t-sm transition-all duration-150 relative z-10"
                    style={{ height: `${Math.max(12, Math.min(95, heightPercent))}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* 8-Band Parametric Equalizer Faders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>8-Band Precision Mastering Equalizer</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Range: -6dB to +6dB</span>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 p-4 rounded-xl bg-white/5 border border-white/5">
              {frequencies.map((freq, idx) => (
                <div key={freq} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-300">
                    {eqBands[idx] > 0 ? `+${eqBands[idx].toFixed(1)}` : eqBands[idx].toFixed(1)} dB
                  </span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.5"
                    value={eqBands[idx]}
                    onChange={(e) => {
                      const updated = [...eqBands];
                      updated[idx] = Number(e.target.value);
                      setEqBands(updated);
                    }}
                    className="h-28 w-2 appearance-none bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                    style={{ writingMode: 'vertical-lr' }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{freq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamics & Enhancer Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Stereo Width */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">Stereo Field Expansion:</span>
                <span className="text-cyan-300 font-bold">{stereoWidth}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="160"
                value={stereoWidth}
                onChange={(e) => setStereoWidth(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Expands high-frequency side-bands without phase cancellation.
              </p>
            </div>

            {/* Analog Tube Warmth */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">Harmonic Tube Drive:</span>
                <span className="text-amber-300 font-bold">{tubeWarmth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={tubeWarmth}
                onChange={(e) => setTubeWarmth(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Adds 2nd-order even harmonics for analog desk console warmth.
              </p>
            </div>

            {/* True Peak Limiter */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">Brickwall Limiter Ceiling:</span>
                <span className="text-rose-300 font-bold">{limiterCeiling.toFixed(1)} dBTP</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="0.0"
                step="0.1"
                value={limiterCeiling}
                onChange={(e) => setLimiterCeiling(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                4x oversampled lookahead prevents inter-sample peak distortion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
