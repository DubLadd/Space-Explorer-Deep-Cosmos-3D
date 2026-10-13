import React, { useState, useEffect } from 'react';
import { musicAudio } from '../../audio/MusicAudioEngine';
import { SequencerTrack, SequencerTrackName } from '../../types/musicCosmos';
import {
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Grid,
  Zap,
} from 'lucide-react';

interface BeatSequencerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TRACKS: SequencerTrack[] = [
  {
    name: 'Kick',
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    volume: 0.9,
    muted: false,
    solo: false,
    pitch: 0,
  },
  {
    name: 'Snare',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    volume: 0.8,
    muted: false,
    solo: false,
    pitch: 0,
  },
  {
    name: 'HiHat Closed',
    steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    volume: 0.7,
    muted: false,
    solo: false,
    pitch: 0,
  },
  {
    name: 'HiHat Open',
    steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    volume: 0.65,
    muted: false,
    solo: false,
    pitch: 0,
  },
  {
    name: 'Clap',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
    volume: 0.75,
    muted: false,
    solo: false,
    pitch: 0,
  },
  {
    name: 'Perc / Rim',
    steps: [false, true, false, false, false, false, true, false, false, true, false, false, false, false, true, false],
    volume: 0.7,
    muted: false,
    solo: false,
    pitch: 0,
  },
  {
    name: '808 Sub',
    steps: [true, false, false, true, false, false, false, false, true, false, false, false, false, true, false, false],
    volume: 0.95,
    muted: false,
    solo: false,
    pitch: 0,
  },
];

export const BeatSequencerModal: React.FC<BeatSequencerModalProps> = ({ isOpen, onClose }) => {
  const [tracks, setTracks] = useState<SequencerTrack[]>(DEFAULT_TRACKS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [bpm, setBpm] = useState<number>(126);
  const [selectedGenre, setSelectedGenre] = useState<string>('Cyber House');

  useEffect(() => {
    musicAudio.setTracks(tracks);
  }, [tracks]);

  useEffect(() => {
    musicAudio.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    musicAudio.setOnStepCallback((step) => {
      setCurrentStep(step);
    });

    return () => {
      musicAudio.stopSequencer();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleStep = (trackIdx: number, stepIdx: number) => {
    const updated = [...tracks];
    const willBeActive = !updated[trackIdx].steps[stepIdx];
    updated[trackIdx].steps[stepIdx] = willBeActive;
    setTracks(updated);

    // Immediate acoustic preview on step enable
    if (willBeActive) {
      musicAudio.triggerDrumSound(
        updated[trackIdx].name,
        0,
        updated[trackIdx].volume,
        updated[trackIdx].pitch
      );
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      musicAudio.stopSequencer();
      setIsPlaying(false);
    } else {
      musicAudio.startSequencer();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = (trackIdx: number) => {
    const updated = [...tracks];
    updated[trackIdx].muted = !updated[trackIdx].muted;
    setTracks(updated);
  };

  const handleToggleSolo = (trackIdx: number) => {
    const updated = [...tracks];
    updated[trackIdx].solo = !updated[trackIdx].solo;
    setTracks(updated);
  };

  const handleClear = () => {
    const cleared = tracks.map((t) => ({
      ...t,
      steps: new Array(16).fill(false),
    }));
    setTracks(cleared);
  };

  const handleRandomize = () => {
    const randomized = tracks.map((t) => {
      const density = t.name === 'HiHat Closed' ? 0.6 : t.name === 'Kick' ? 0.3 : 0.22;
      return {
        ...t,
        steps: Array.from({ length: 16 }, () => Math.random() < density),
      };
    });
    setTracks(randomized);
  };

  const handleLoadPreset = (name: string, newBpm: number) => {
    setSelectedGenre(name);
    setBpm(newBpm);

    let newTracks: SequencerTrack[];
    if (name === 'Peak-Time Techno') {
      newTracks = [
        { name: 'Kick', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], volume: 0.95, muted: false, solo: false, pitch: -2 },
        { name: 'Snare', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], volume: 0.8, muted: false, solo: false, pitch: 0 },
        { name: 'HiHat Closed', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], volume: 0.75, muted: false, solo: false, pitch: 2 },
        { name: 'HiHat Open', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], volume: 0.7, muted: false, solo: false, pitch: 0 },
        { name: 'Clap', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], volume: 0.8, muted: false, solo: false, pitch: 0 },
        { name: 'Perc / Rim', steps: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], volume: 0.65, muted: false, solo: false, pitch: 3 },
        { name: '808 Sub', steps: [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false], volume: 0.9, muted: false, solo: false, pitch: -1 },
      ];
    } else if (name === 'Liquid D&B') {
      newTracks = [
        { name: 'Kick', steps: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false], volume: 0.95, muted: false, solo: false, pitch: 0 },
        { name: 'Snare', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], volume: 0.9, muted: false, solo: false, pitch: 2 },
        { name: 'HiHat Closed', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], volume: 0.65, muted: false, solo: false, pitch: 1 },
        { name: 'HiHat Open', steps: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, false, true], volume: 0.6, muted: false, solo: false, pitch: 0 },
        { name: 'Clap', steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], volume: 0.7, muted: true, solo: false, pitch: 0 },
        { name: 'Perc / Rim', steps: [false, false, false, true, false, true, false, false, true, false, false, true, false, true, false, false], volume: 0.75, muted: false, solo: false, pitch: 4 },
        { name: '808 Sub', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], volume: 0.9, muted: false, solo: false, pitch: -2 },
      ];
    } else {
      newTracks = DEFAULT_TRACKS;
    }
    setTracks(newTracks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-[#030712]/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Mercury Node
                </span>
                <span className="text-xs text-slate-400 font-mono">16-Step Analog Matrix</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Cosmic Beat Sequencer & Drum Synth
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

        {/* Master Transport & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/10 bg-black/40">
          {/* Play/Pause & Transport */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Stop Engine' : 'Start Engine'}</span>
            </button>

            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-cyan-300 transition-colors"
              title="Generate Euclidean / Random Pattern"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Tempo BPM Slider & Readout */}
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-mono text-slate-400">TEMPO:</span>
            <input
              type="range"
              min="70"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-sm font-bold text-cyan-300 min-w-[54px]">
              {bpm} BPM
            </span>
          </div>

          {/* Genre Pattern Presets */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['Cyber House', 'Peak-Time Techno', 'Liquid D&B'].map((preset) => (
              <button
                key={preset}
                onClick={() => handleLoadPreset(preset, preset === 'Liquid D&B' ? 174 : preset === 'Peak-Time Techno' ? 134 : 126)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedGenre === preset
                    ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 16-Step Matrix Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2.5">
          {/* Step numbers indicator ruler */}
          <div className="flex items-center gap-2">
            <div className="w-36 md:w-44 shrink-0 text-[11px] font-mono text-slate-500 uppercase px-2">
              Drum Instrument
            </div>
            <div className="grid grid-cols-16 flex-1 gap-1">
              {Array.from({ length: 16 }).map((_, stepIdx) => {
                const isCurrent = currentStep === stepIdx;
                const isDownbeat = stepIdx % 4 === 0;
                return (
                  <div
                    key={stepIdx}
                    className={`h-4 rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                      isCurrent
                        ? 'bg-cyan-400 text-black font-bold shadow-sm shadow-cyan-400'
                        : isDownbeat
                        ? 'bg-white/15 text-slate-300'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {stepIdx + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Drum Tracks */}
          {tracks.map((track, trackIdx) => {
            return (
              <div
                key={track.name}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 transition-colors"
              >
                {/* Track Title, Mute, Solo */}
                <div className="w-36 md:w-44 shrink-0 flex items-center justify-between pr-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => musicAudio.triggerDrumSound(track.name, 0, track.volume, track.pitch)}
                      className="text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors truncate max-w-[80px] md:max-w-[100px] text-left"
                      title="Click to preview audition sound"
                    >
                      {track.name}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleMute(trackIdx)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                        track.muted
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                      title="Mute track"
                    >
                      M
                    </button>
                    <button
                      onClick={() => handleToggleSolo(trackIdx)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                        track.solo
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                      title="Solo track"
                    >
                      S
                    </button>
                  </div>
                </div>

                {/* 16 Step Buttons */}
                <div className="grid grid-cols-16 flex-1 gap-1">
                  {track.steps.map((isActive, stepIdx) => {
                    const isPlayhead = currentStep === stepIdx;
                    const isQuarter = stepIdx % 4 === 0;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => handleToggleStep(trackIdx, stepIdx)}
                        className={`h-9 md:h-10 rounded-lg transition-all flex items-center justify-center relative ${
                          isActive
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/25 border border-cyan-300'
                            : isQuarter
                            ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-white/10'
                            : 'bg-slate-900/60 hover:bg-slate-800/60 border border-white/5'
                        } ${isPlayhead ? 'ring-2 ring-white scale-102 z-10' : ''}`}
                      >
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-cyan-950 shadow-sm" />
                        )}
                        {isPlayhead && !isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-black/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pure Web Audio API zero-latency analog synthesis · 16th-note swing ready</span>
          </div>
          <span className="font-mono text-cyan-300">
            {tracks.reduce((acc, t) => acc + t.steps.filter(Boolean).length, 0)} Active Triggers
          </span>
        </div>
      </div>
    </div>
  );
};
