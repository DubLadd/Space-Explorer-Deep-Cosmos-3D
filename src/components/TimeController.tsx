import React from 'react';
import { Play, Pause, FastForward, Rewind, RotateCcw, Orbit, Sparkles } from 'lucide-react';

interface TimeControllerProps {
  timeScale: number;
  timeDirection: 1 | -1;
  onSetTimeScale: (scale: number, dir: 1 | -1) => void;
  orbitsVisible: boolean;
  onToggleOrbits: () => void;
  constellationsVisible: boolean;
  onToggleConstellations: () => void;
}

export const TimeController: React.FC<TimeControllerProps> = ({
  timeScale,
  timeDirection,
  onSetTimeScale,
  orbitsVisible,
  onToggleOrbits,
  constellationsVisible,
  onToggleConstellations,
}) => {
  const isPaused = timeScale === 0;

  const currentMultiplierText = isPaused
    ? 'PAUSED'
    : `${timeDirection < 0 ? '-' : ''}${timeScale}x`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-[#030712]/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/60 select-none max-w-[95vw] overflow-x-auto">
      {/* Reverse Warp */}
      <button
        onClick={() => onSetTimeScale(5, -1)}
        className={`p-2 rounded-xl transition-colors ${
          !isPaused && timeDirection === -1 && timeScale === 5
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
        title="Reverse Fast 5x"
      >
        <Rewind className="w-3.5 h-3.5" />
      </button>

      {/* Play / Pause Toggle */}
      <button
        onClick={() => {
          if (isPaused) {
            onSetTimeScale(1, 1);
          } else {
            onSetTimeScale(0, 1);
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-colors ${
          isPaused
            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
        }`}
        title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
      >
        {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
        <span className="font-mono-numbers">{isPaused ? 'PAUSED' : 'PLAY'}</span>
      </button>

      {/* Forward Speed Selectors */}
      <div className="flex items-center gap-1 px-1 border-x border-white/10">
        {[1, 5, 25, 100].map((s) => {
          const isActive = !isPaused && timeDirection === 1 && timeScale === s;
          return (
            <button
              key={s}
              onClick={() => onSetTimeScale(s, 1)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-500 text-black font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s}x
            </button>
          );
        })}
      </div>

      {/* Layer Toggles: Orbits & Constellations */}
      <div className="flex items-center gap-1.5 pl-1">
        <button
          onClick={onToggleOrbits}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            orbitsVisible
              ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Keplerian Orbit Trails"
        >
          <Orbit className="w-3 h-3" />
          <span className="hidden sm:inline">Orbits</span>
        </button>

        <button
          onClick={onToggleConstellations}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            constellationsVisible
              ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle 88-Constellation Celestial Wireframe"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">Constellations</span>
        </button>

        <button
          onClick={() => onSetTimeScale(1, 1)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors ml-0.5"
          title="Reset to 1x Real Simulation"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
