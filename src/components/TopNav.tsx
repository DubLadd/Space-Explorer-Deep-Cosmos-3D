import React from 'react';
import { SimulationMode } from '../types/cosmos';
import { Volume2, VolumeX, Rocket, Compass, BookOpen, Camera, Orbit, Layers, Disc } from 'lucide-react';

interface TopNavProps {
  currentMode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onOpenMissions: () => void;
  missionsOpen: boolean;
  onCaptureMoment: () => void;
  onSwitchToMusicDashboard: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentMode,
  onSelectMode,
  audioMuted,
  onToggleAudio,
  onOpenMissions,
  missionsOpen,
  onCaptureMoment,
  onSwitchToMusicDashboard,
}) => {
  const modes: { id: SimulationMode; label: string }[] = [
    { id: 'solar', label: 'Solar System' },
    { id: 'exoplanet', label: 'Exoplanets' },
    { id: 'galaxy', label: 'Spiral Galaxy' },
    { id: 'blackhole', label: 'Black Hole & Pulsar' },
    { id: 'supernova', label: 'Supernova' },
    { id: 'sandbox', label: 'Orbital Sandbox' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 md:gap-6 px-3 md:px-8 py-2.5 bg-[#030712]/90 backdrop-blur-md border-b border-white/10 select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
          <Compass className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm md:text-base font-bold tracking-tight text-white whitespace-nowrap">
            Space Explorer
          </span>
          <span className="text-[9px] md:text-[10px] text-cyan-300/80 font-mono tracking-wider uppercase">
            Deep Cosmos 3D
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Desktop bar + Mobile dropdown selector) */}
      <div className="flex items-center">
        {/* Desktop View: Full Segmented Tabs */}
        <nav className="hidden xl:flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </nav>

        {/* Medium & Small View: Clean Mode Dropdown Picker */}
        <div className="xl:hidden flex items-center gap-1.5 bg-black/50 border border-white/15 rounded-xl px-2.5 py-1 text-xs">
          <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            value={currentMode}
            onChange={(e) => onSelectMode(e.target.value as SimulationMode)}
            className="bg-transparent text-cyan-200 font-medium text-xs focus:outline-none cursor-pointer pr-1"
          >
            {modes.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 3: Actions & Quick-Switches */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {/* Dedicated Orbital Sandbox Switch */}
        <button
          onClick={() => onSelectMode(currentMode === 'sandbox' ? 'solar' : 'sandbox')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 shadow-sm ${
            currentMode === 'sandbox'
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-cyan-500/20'
              : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-cyan-400/40'
          }`}
          title={currentMode === 'sandbox' ? 'Exit Sandbox Mode' : 'Switch into Orbital Sandbox Mode'}
        >
          <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span className="hidden sm:inline">
            {currentMode === 'sandbox' ? 'Exit Sandbox' : 'Orbital Sandbox'}
          </span>
          <span className="sm:hidden">Sandbox</span>
        </button>

        {/* Capture Cosmic Moment Snapshot Button */}
        <button
          onClick={onCaptureMoment}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-lg border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 hover:text-white transition-all shadow-sm shadow-cyan-500/10 active:scale-95 whitespace-nowrap"
          title="Capture Cosmic Moment (Snapshot pure WebGL canvas without UI overlays)"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden md:inline">Capture Moment</span>
        </button>

        {/* Missions Drawer Toggle */}
        <button
          onClick={onOpenMissions}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            missionsOpen
              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Guided Missions & Expeditions"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Missions</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-lg border transition-colors ${
            audioMuted
              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              : 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
          }`}
          title={audioMuted ? 'Unmute Ambient Soundscape' : 'Mute Soundscape'}
          aria-label="Toggle Cosmic Audio"
        >
          {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Cockpit Mode Toggle */}
        <button
          onClick={() => onSelectMode(currentMode === 'cockpit' ? 'solar' : 'cockpit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm ${
            currentMode === 'cockpit'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {currentMode === 'cockpit' ? 'Exit Cockpit' : 'Flight Deck'}
          </span>
          <span className="sm:hidden">{currentMode === 'cockpit' ? 'Exit' : 'Flight'}</span>
        </button>

        {/* Launch Cosmic Music Studio Dashboard */}
        <button
          onClick={onSwitchToMusicDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-cyan-500/30 active:scale-95"
          title="Launch Cosmic Music Studio & DJ Ecosystem (Beat Sequencer, DJ Decks, AI Music Gen, Promo Agent)"
        >
          <Disc className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Music Studio</span>
        </button>
      </div>
    </header>
  );
};
