import React from 'react';
import { CelestialBody, SimulationMode } from '../types/cosmos';
import { SOLAR_SYSTEM_BODIES, TRAPPIST_SYSTEM_BODIES, ALPHA_CENTAURI_BODIES } from '../data/celestialBodies';
import { Sparkles } from 'lucide-react';

interface PlanetListSidebarProps {
  currentMode: SimulationMode;
  selectedBody: CelestialBody | null;
  onSelectBody: (body: CelestialBody) => void;
  onOverview: () => void;
}

export const PlanetListSidebar: React.FC<PlanetListSidebarProps> = ({
  currentMode,
  selectedBody,
  onSelectBody,
  onOverview,
}) => {
  if (currentMode !== 'solar' && currentMode !== 'exoplanet') return null;

  const bodies =
    currentMode === 'solar'
      ? SOLAR_SYSTEM_BODIES
      : [...TRAPPIST_SYSTEM_BODIES, ...ALPHA_CENTAURI_BODIES];

  return (
    <div className="fixed top-20 left-4 z-20 w-44 md:w-48 max-h-[calc(100vh-160px)] overflow-y-auto p-2.5 bg-[#030712]/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/80 select-none space-y-1">
      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 py-1">
        {currentMode === 'solar' ? 'Sol System' : 'Exoplanet Worlds'}
      </div>

      {/* Overview Button */}
      <button
        onClick={onOverview}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
          !selectedBody
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
            : 'text-slate-300 hover:text-white hover:bg-white/5'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">System Overview</span>
      </button>

      {/* Body Buttons */}
      {bodies.map((b) => {
        const isSelected = selectedBody?.id === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onSelectBody(b)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors text-left ${
              isSelected
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor: b.glowColor || b.color,
                boxShadow: `0 0 6px ${b.glowColor || b.color}`,
              }}
            />
            <span className="truncate">{b.name}</span>
          </button>
        );
      })}
    </div>
  );
};
