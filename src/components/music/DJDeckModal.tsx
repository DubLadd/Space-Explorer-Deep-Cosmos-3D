import React, { useState } from 'react';
import { musicAudio } from '../../audio/MusicAudioEngine';
import { DJDeckState } from '../../types/musicCosmos';
import {
  Disc,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sliders,
  Zap,
  X,
  Radio,
  Flame,
} from 'lucide-react';

interface DJDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DJDeckModal: React.FC<DJDeckModalProps> = ({ isOpen, onClose }) => {
  // Deck A State
  const [deckA, setDeckA] = useState<DJDeckState>({
    trackTitle: 'Cyber Horizon (Extended Club Mix)',
    artist: 'Astra Protocol',
    bpm: 128,
    currentBpm: 128,
    pitchPercent: 0,
    isPlaying: true,
    playbackProgress: 0.35,
    highEq: 0,
    midEq: 0,
    lowEq: 0,
    filter: 0,
    volume: 0.9,
    cueActive: false,
    stems: { drums: true, bass: true, vocals: true, melody: true },
  });

  // Deck B State
  const [deckB, setDeckB] = useState<DJDeckState>({
    trackTitle: 'Event Horizon (Techno Dub)',
    artist: 'Pulsar FX',
    bpm: 130,
    currentBpm: 130,
    pitchPercent: -1.5,
    isPlaying: false,
    playbackProgress: 0.12,
    highEq: 0,
    midEq: 0,
    lowEq: -3,
    filter: 0,
    volume: 0.85,
    cueActive: true,
    stems: { drums: true, bass: false, vocals: true, melody: true },
  });

  // Crossfader: -1 (Deck A) to 0 (Center) to +1 (Deck B)
  const [crossfader, setCrossfader] = useState<number>(0);

  if (!isOpen) return null;

  const toggleStem = (deck: 'A' | 'B', stemKey: keyof DJDeckState['stems']) => {
    if (deck === 'A') {
      setDeckA((prev) => ({
        ...prev,
        stems: { ...prev.stems, [stemKey]: !prev.stems[stemKey] },
      }));
    } else {
      setDeckB((prev) => ({
        ...prev,
        stems: { ...prev.stems, [stemKey]: !prev.stems[stemKey] },
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-[#030712]/95 border border-rose-500/30 rounded-2xl shadow-2xl shadow-rose-950/60 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-500/20 bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-300">
              <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                  Mars Node
                </span>
                <span className="text-xs text-slate-400 font-mono">Dual Turntables & Stems</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                DJ Performance Decks & Live Stems Mixer
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

        {/* Instant DJ Performance Sampler Pads */}
        <div className="flex items-center justify-between gap-2 px-6 py-2.5 border-b border-white/10 bg-black/40 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>LIVE SAMPLER PADS:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => musicAudio.playDJAirhorn()}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-lg font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>AIRHORN</span>
            </button>
            <button
              onClick={() => musicAudio.playVinylBrake()}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 rounded-lg font-bold transition-all active:scale-95"
            >
              VINYL BRAKE
            </button>
            <button
              onClick={() => musicAudio.playLaserSweep()}
              className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-lg font-bold transition-all active:scale-95"
            >
              LASER DROP
            </button>
            <button
              onClick={() => musicAudio.playDubSiren()}
              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 rounded-lg font-bold transition-all active:scale-95"
            >
              DUB SIREN
            </button>
          </div>
        </div>

        {/* Main Decks Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DECK A */}
          <div className="p-5 rounded-2xl bg-white/5 border border-cyan-500/20 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  DECK A · MASTER
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-[240px]">
                  {deckA.trackTitle}
                </h3>
                <p className="text-xs text-slate-400">{deckA.artist}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold text-cyan-300">
                  {deckA.currentBpm.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">BPM</span>
              </div>
            </div>

            {/* Rotating Vinyl Platter */}
            <div className="relative h-44 rounded-2xl bg-black/60 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
              <div
                className={`w-36 h-36 rounded-full border-4 border-slate-700 bg-radial from-slate-900 to-black shadow-inner flex items-center justify-center transition-transform ${
                  deckA.isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '2.5s' }}
              >
                <div className="w-16 h-16 rounded-full bg-cyan-900/60 border-2 border-cyan-400/60 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-2 left-4 right-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${deckA.playbackProgress * 100}%` }}
                />
              </div>
            </div>

            {/* Transport & Pitch */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeckA((p) => ({ ...p, isPlaying: !p.isPlaying }))}
                  className={`p-3 rounded-xl font-bold transition-all shadow-md ${
                    deckA.isPlaying
                      ? 'bg-cyan-500 text-black shadow-cyan-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {deckA.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeckA((p) => ({ ...p, cueActive: !p.cueActive }))}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    deckA.cueActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-black/30 text-slate-400 border-white/10'
                  }`}
                >
                  CUE
                </button>
              </div>

              {/* Pitch Fader */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span>PITCH:</span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.1"
                  value={deckA.pitchPercent}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setDeckA((prev) => ({
                      ...prev,
                      pitchPercent: p,
                      currentBpm: prev.bpm * (1 + p / 100),
                    }));
                  }}
                  className="w-24 accent-cyan-400 cursor-pointer"
                />
                <span className="w-12 text-right">
                  {deckA.pitchPercent > 0 ? `+${deckA.pitchPercent}` : deckA.pitchPercent}%
                </span>
              </div>
            </div>

            {/* Real-time Stems Isolator */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Live Stems Isolation:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['drums', 'bass', 'vocals', 'melody'] as (keyof DJDeckState['stems'])[]).map((stem) => (
                  <button
                    key={stem}
                    onClick={() => toggleStem('A', stem)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      deckA.stems[stem]
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-sm'
                        : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {stem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DECK B */}
          <div className="p-5 rounded-2xl bg-white/5 border border-rose-500/20 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">
                  DECK B · CUE
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-[240px]">
                  {deckB.trackTitle}
                </h3>
                <p className="text-xs text-slate-400">{deckB.artist}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold text-rose-300">
                  {deckB.currentBpm.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">BPM</span>
              </div>
            </div>

            {/* Rotating Vinyl Platter */}
            <div className="relative h-44 rounded-2xl bg-black/60 border border-rose-500/30 flex items-center justify-center overflow-hidden">
              <div
                className={`w-36 h-36 rounded-full border-4 border-slate-700 bg-radial from-slate-900 to-black shadow-inner flex items-center justify-center transition-transform ${
                  deckB.isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '2.5s' }}
              >
                <div className="w-16 h-16 rounded-full bg-rose-900/60 border-2 border-rose-400/60 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-2 left-4 right-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${deckB.playbackProgress * 100}%` }}
                />
              </div>
            </div>

            {/* Transport & Pitch */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeckB((p) => ({ ...p, isPlaying: !p.isPlaying }))}
                  className={`p-3 rounded-xl font-bold transition-all shadow-md ${
                    deckB.isPlaying
                      ? 'bg-rose-500 text-white shadow-rose-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {deckB.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeckB((p) => ({ ...p, cueActive: !p.cueActive }))}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    deckB.cueActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-black/30 text-slate-400 border-white/10'
                  }`}
                >
                  CUE
                </button>
              </div>

              {/* Pitch Fader */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span>PITCH:</span>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.1"
                  value={deckB.pitchPercent}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setDeckB((prev) => ({
                      ...prev,
                      pitchPercent: p,
                      currentBpm: prev.bpm * (1 + p / 100),
                    }));
                  }}
                  className="w-24 accent-rose-400 cursor-pointer"
                />
                <span className="w-12 text-right">
                  {deckB.pitchPercent > 0 ? `+${deckB.pitchPercent}` : deckB.pitchPercent}%
                </span>
              </div>
            </div>

            {/* Real-time Stems Isolator */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Live Stems Isolation:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['drums', 'bass', 'vocals', 'melody'] as (keyof DJDeckState['stems'])[]).map((stem) => (
                  <button
                    key={stem}
                    onClick={() => toggleStem('B', stem)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      deckB.stems[stem]
                        ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 shadow-sm'
                        : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {stem}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Master DJ Mixer Crossfader Dock */}
        <div className="p-4 bg-black/70 border-t border-white/10 flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-md text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">DECK A (CH 1)</span>
            <span>CROSSFADER BLEND</span>
            <span className="text-rose-400 font-bold">DECK B (CH 2)</span>
          </div>

          <div className="w-full max-w-md flex items-center gap-3">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={crossfader}
              onChange={(e) => setCrossfader(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
