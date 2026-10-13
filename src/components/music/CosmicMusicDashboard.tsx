import React, { useEffect, useRef, useState } from 'react';
import { MusicCosmosEngine } from '../../scene/MusicCosmosEngine';
import { MusicPlanetNode, MusicToolId } from '../../types/musicCosmos';
import { MUSIC_PLANET_NODES } from '../../data/musicPlanets';
import { musicAudio } from '../../audio/MusicAudioEngine';

import { BeatSequencerModal } from './BeatSequencerModal';
import { DJDeckModal } from './DJDeckModal';
import { AIMusicStudioModal } from './AIMusicStudioModal';
import { PromoAgentModal } from './PromoAgentModal';
import { BrainstormChatModal } from './BrainstormChatModal';
import { MasteringModal } from './MasteringModal';

import {
  Compass,
  Play,
  Square,
  Sparkles,
  Bot,
  Disc,
  Grid,
  Sliders,
  MessageSquare,
  Radio,
  Layers,
  Volume2,
  VolumeX,
  RotateCcw,
  Rocket,
  ExternalLink,
} from 'lucide-react';

interface CosmicMusicDashboardProps {
  onSwitchToSpaceSim: () => void;
}

export const CosmicMusicDashboard: React.FC<CosmicMusicDashboardProps> = ({
  onSwitchToSpaceSim,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MusicCosmosEngine | null>(null);

  // Active Tool Modal
  const [activeModal, setActiveModal] = useState<MusicToolId | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MusicPlanetNode | null>(null);

  // Sequencer Quick Play
  const [isSequencerPlaying, setIsSequencerPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(126);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize MusicCosmosEngine on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new MusicCosmosEngine(containerRef.current, {
      onSelectTool: (toolId) => {
        setActiveModal(toolId);
      },
      onHoverTool: (node) => {
        setHoveredNode(node);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
      musicAudio.stopSequencer();
    };
  }, []);

  const handleToggleSequencer = () => {
    if (isSequencerPlaying) {
      musicAudio.stopSequencer();
      setIsSequencerPlaying(false);
    } else {
      musicAudio.startSequencer();
      setIsSequencerPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    musicAudio.setMuted(nextMute);
  };

  const handleOpenTool = (toolId: MusicToolId) => {
    setActiveModal(toolId);
    if (engineRef.current) {
      engineRef.current.selectTool(toolId);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#01030b] text-slate-100 select-none">
      {/* 3D Holographic Orrery Viewport (Three.js WebGL) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header & Tool Ribbon */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 md:px-8 py-3 bg-[#030712]/92 backdrop-blur-xl border-b border-cyan-500/20 select-none">
        {/* Brand & Moniker */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-sm shadow-cyan-500/20">
            <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                CYBERNETIC ORRERY
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
              Cosmic Music Studio & DJ Ecosystem
            </h1>
          </div>
        </div>

        {/* Center Quick Planetary Tool Launcher Dock */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-2xl">
          <button
            onClick={() => handleOpenTool('mercury')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeModal === 'mercury'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Beat Sequencer</span>
          </button>

          <button
            onClick={() => handleOpenTool('earth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeModal === 'earth'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI Music Studio</span>
          </button>

          <button
            onClick={() => handleOpenTool('mars')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeModal === 'mars'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-300 hover:text-rose-300 hover:bg-white/10'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-rose-400" />
            <span>DJ Decks & Stems</span>
          </button>

          <button
            onClick={() => handleOpenTool('jupiter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeModal === 'jupiter'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI Brainstorm</span>
          </button>

          <button
            onClick={() => handleOpenTool('saturn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeModal === 'saturn'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-300" />
            <span>Mastering</span>
          </button>

          <button
            onClick={() => handleOpenTool('neptune')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeModal === 'neptune'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-white/10'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Promo AI Agent</span>
          </button>
        </div>

        {/* Right Master Actions & Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Sequencer Play Toggle */}
          <button
            onClick={handleToggleSequencer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isSequencerPlaying
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25'
            }`}
            title="Start / Stop 16-Step Beat Sequencer"
          >
            {isSequencerPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isSequencerPlaying ? 'Stop Beat' : 'Play Beat'}</span>
          </button>

          {/* Mute Audio */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
            }`}
            title={isMuted ? 'Unmute Audio Engine' : 'Mute Audio Engine'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Switch to Space Simulator Environment */}
          <button
            onClick={onSwitchToSpaceSim}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-400/40 text-purple-200 hover:text-white text-xs font-semibold transition-all shadow-sm shadow-purple-900/30 active:scale-95"
            title="Switch back into Deep Space Observatory Simulator (Solar System, Exoplanets, Black Holes)"
          >
            <Rocket className="w-3.5 h-3.5 text-purple-300" />
            <span>Space Simulator</span>
          </button>
        </div>
      </header>

      {/* Floating Center Sub-Banner */}
      <div className="pointer-events-none fixed top-18 left-0 right-0 z-10 flex flex-col items-center text-center px-4">
        <h2 className="text-base md:text-lg font-bold text-white tracking-tight drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
          Planetary Music Production & Promotional Orrery
        </h2>
        <p className="text-[11px] text-cyan-300/80 font-mono tracking-wider uppercase mt-0.5">
          Click any holographic celestial node to open its music tool · Drag to rotate orrery · Scroll to zoom
        </p>
      </div>

      {/* Hovered Planet Card Callout (Bottom Left) */}
      {hoveredNode && (
        <div className="fixed bottom-6 left-6 z-30 w-80 md:w-96 p-4 rounded-2xl bg-[#030712]/92 backdrop-blur-xl border border-cyan-400/40 shadow-2xl shadow-cyan-950/80 animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {hoveredNode.astronomicalName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{hoveredNode.shortLabel}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">
                {hoveredNode.toolTitle}
              </h3>
            </div>
            <button
              onClick={() => handleOpenTool(hoveredNode.id)}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Launch</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{hoveredNode.tagline}</p>
        </div>
      )}

      {/* Modals for Each Musical Tool */}
      {/* 1. Beat Sequencer (Mercury) */}
      <BeatSequencerModal
        isOpen={activeModal === 'mercury'}
        onClose={() => setActiveModal(null)}
      />

      {/* 2. DJ Decks & Stems (Mars) */}
      <DJDeckModal
        isOpen={activeModal === 'mars'}
        onClose={() => setActiveModal(null)}
      />

      {/* 3. AI Music Generator (Earth & Moon) */}
      <AIMusicStudioModal
        isOpen={activeModal === 'earth'}
        onClose={() => setActiveModal(null)}
      />

      {/* 4. Promotional AI Agent (Neptune) */}
      <PromoAgentModal
        isOpen={activeModal === 'neptune'}
        onClose={() => setActiveModal(null)}
      />

      {/* 5. AI Brainstorm & Production Chat (Jupiter) */}
      <BrainstormChatModal
        isOpen={activeModal === 'jupiter'}
        onClose={() => setActiveModal(null)}
      />

      {/* 6. Mastering Suite (Saturn) */}
      <MasteringModal
        isOpen={activeModal === 'saturn'}
        onClose={() => setActiveModal(null)}
      />

      {/* 7. Core DAW (Sun) & Other Nodes Fallback Details */}
      {(activeModal === 'sun' || activeModal === 'venus' || activeModal === 'asteroid' || activeModal === 'uranus') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl p-6 rounded-2xl bg-[#030712]/95 border border-cyan-500/30 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {MUSIC_PLANET_NODES.find((n) => n.id === activeModal)?.astronomicalName}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                  {MUSIC_PLANET_NODES.find((n) => n.id === activeModal)?.toolTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {MUSIC_PLANET_NODES.find((n) => n.id === activeModal)?.summary}
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                Integrated Capabilities:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {MUSIC_PLANET_NODES.find((n) => n.id === activeModal)?.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Return to Orrery View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
