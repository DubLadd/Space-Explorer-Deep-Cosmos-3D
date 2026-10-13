import React, { useState } from 'react';
import { SandboxBodyConfig, SandboxBodyState } from '../types/cosmos';
import { SANDBOX_PRESETS } from '../data/sandboxPresets';
import {
  Orbit,
  Compass,
  Plus,
  Trash2,
  Crosshair,
  Sparkles,
  Zap,
  RotateCcw,
  Globe,
  Info,
} from 'lucide-react';

interface SandboxControlsProps {
  sandboxG: number;
  onSetSandboxG: (g: number) => void;
  showVectors: boolean;
  onToggleVectors: () => void;
  showTrails: boolean;
  onToggleTrails: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showHillSpheres: boolean;
  onToggleHillSpheres: () => void;
  onLoadPreset: (presetId: string) => void;
  onResetToDefault: () => void;
  onClearBodies: () => void;
  onSpawnBody: (config: SandboxBodyConfig) => void;
  onSelectBodyId: (id: string | null) => void;
  isPlacementMode: boolean;
  onTogglePlacementMode: () => void;
  activeBodies: SandboxBodyState[];
}

export const SandboxControls: React.FC<SandboxControlsProps> = ({
  sandboxG,
  onSetSandboxG,
  showVectors,
  onToggleVectors,
  showTrails,
  onToggleTrails,
  showGrid,
  onToggleGrid,
  showHillSpheres,
  onToggleHillSpheres,
  onLoadPreset,
  onResetToDefault,
  onClearBodies,
  onSpawnBody,
  onSelectBodyId,
  isPlacementMode,
  onTogglePlacementMode,
  activeBodies,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('figure8');
  const [bodyType, setBodyType] = useState<SandboxBodyConfig['type']>('planet');
  const [bodyName, setBodyName] = useState<string>('Custom World');
  const [mass, setMass] = useState<number>(20);
  const [radius, setRadius] = useState<number>(0.4);
  const [color, setColor] = useState<string>('#06b6d4');

  const presetTypes: {
    type: SandboxBodyConfig['type'];
    label: string;
    defaultMass: number;
    defaultRadius: number;
    defaultColor: string;
  }[] = [
    { type: 'star', label: 'Star', defaultMass: 400, defaultRadius: 0.85, defaultColor: '#f59e0b' },
    { type: 'blackhole', label: 'Black Hole', defaultMass: 1000, defaultRadius: 0.5, defaultColor: '#38bdf8' },
    { type: 'gas_giant', label: 'Gas Giant', defaultMass: 60, defaultRadius: 0.65, defaultColor: '#a855f7' },
    { type: 'planet', label: 'Terrestrial', defaultMass: 15, defaultRadius: 0.38, defaultColor: '#06b6d4' },
    { type: 'moon', label: 'Moon / Comet', defaultMass: 2, defaultRadius: 0.22, defaultColor: '#94a3b8' },
  ];

  const handleSelectType = (t: (typeof presetTypes)[0]) => {
    setBodyType(t.type);
    setBodyName(`New ${t.label}`);
    setMass(t.defaultMass);
    setRadius(t.defaultRadius);
    setColor(t.defaultColor);
  };

  const handleManualSpawn = () => {
    onSpawnBody({
      name: bodyName,
      type: bodyType,
      mass,
      radius,
      color,
    });
  };

  const hoveredOrSelectedBody = activeBodies.find((b) => b.isHovered || b.isSelected);

  return (
    <div className="fixed top-20 left-4 z-30 w-80 md:w-96 max-h-[calc(100vh-120px)] overflow-y-auto p-5 bg-[#030712]/92 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/80 select-none space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono tracking-wider uppercase mb-0.5">
            <Orbit className="w-3.5 h-3.5" />
            <span>N-Body Gravitational Laboratory</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Orbital Sandbox
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
          {activeBodies.length} Bodies
        </span>
      </div>

      {/* Reset to Default Button */}
      <button
        onClick={onResetToDefault}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 hover:text-white border border-amber-400/40 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-amber-500/10 active:scale-98"
        title="Quickly restore initial planetary configuration, masses, velocities, and G constant"
      >
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        <span>Reset to Default Configuration</span>
      </button>

      {/* Preset Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Orbital Presets:</span>
          <span className="text-[10px] text-slate-400 font-mono">Solutions</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SANDBOX_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPresetId(p.id);
                  onLoadPreset(p.id);
                }}
                className={`p-2 rounded-xl text-left text-xs transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="font-semibold truncate">{p.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Drag-to-Launch Mode Toggle */}
      <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Interactive Placement</span>
          </div>
          <button
            onClick={onTogglePlacementMode}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              isPlacementMode
                ? 'bg-cyan-500 text-black font-semibold shadow-sm'
                : 'bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {isPlacementMode ? 'Aiming Active' : 'Enable Click-Launch'}
          </button>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {isPlacementMode
            ? 'Click and drag on the 3D grid plane to set initial launch position and release to slingshot into orbit.'
            : 'Toggle on to place custom masses directly inside the 3D viewport with initial velocity arrows.'}
        </p>
      </div>

      {/* Hill Sphere Gravitational Influence Callout (when body is hovered or selected) */}
      {hoveredOrSelectedBody && (
        <div className="p-3 bg-cyan-950/50 border border-cyan-400/40 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-cyan-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hill Sphere Zone</span>
            </div>
            <span className="font-mono text-cyan-200 font-bold">
              r_H = {hoveredOrSelectedBody.hillSphereRadius.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed">
            Targeting <strong className="text-white">{hoveredOrSelectedBody.name}</strong> (Mass: {hoveredOrSelectedBody.mass}). Within this boundary radius, its gravitational field dominates over surrounding stellar attractors, allowing stable satellite capture and stable moon orbits.
          </p>
        </div>
      )}

      {/* Custom Body Parameter Config */}
      <div className="space-y-3 p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Configure Custom Body
        </div>

        {/* Body Type Presets */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {presetTypes.map((pt) => (
            <button
              key={pt.type}
              onClick={() => handleSelectType(pt)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                bodyType === pt.type
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                  : 'bg-black/30 text-slate-400 hover:text-white'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {/* Mass Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Mass:</span>
            <span className="font-mono text-cyan-300">{mass}</span>
          </div>
          <input
            type="range"
            min="1"
            max="1200"
            step="1"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Radius Slider & Color */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Radius:</span>
              <span className="font-mono text-cyan-300">{radius.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="1.8"
              step="0.05"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Color:</span>
              <span className="font-mono text-slate-400">{color}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-7 rounded border-0 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Manual Spawn Button */}
        <button
          onClick={handleManualSpawn}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg shadow-sm transition-colors mt-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Spawn Body in Orbit</span>
        </button>
      </div>

      {/* Physics & Visualization Controls */}
      <div className="space-y-2 pt-1 border-t border-white/10 text-xs">
        {/* Gravitational Constant Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Gravitational Constant (G):</span>
            <span className="font-mono text-amber-300">{sandboxG.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.05"
            value={sandboxG}
            onChange={(e) => onSetSandboxG(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Visual Toggles (Vectors, Trails, Grid, Hill Spheres) */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          <button
            onClick={onToggleVectors}
            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
              showVectors
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/5 border-white/5 text-slate-400'
            }`}
            title="Toggle Gravitational Acceleration Vectors"
          >
            <Zap className="w-3 h-3" />
            <span>Vectors</span>
          </button>

          <button
            onClick={onToggleTrails}
            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
              showTrails
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/5 border-white/5 text-slate-400'
            }`}
            title="Toggle Live Orbital Trajectories"
          >
            <Sparkles className="w-3 h-3" />
            <span>Trails</span>
          </button>

          <button
            onClick={onToggleGrid}
            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
              showGrid
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/5 border-white/5 text-slate-400'
            }`}
            title="Toggle Ecliptic Reference Grid"
          >
            <Compass className="w-3 h-3" />
            <span>Grid</span>
          </button>

          <button
            onClick={onToggleHillSpheres}
            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
              showHillSpheres
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/5 border-white/5 text-slate-400'
            }`}
            title="Highlight Hill Spheres (Gravitational Influence Zones)"
          >
            <Globe className="w-3 h-3" />
            <span>Hill Spheres</span>
          </button>
        </div>

        {/* Clear All Bodies */}
        <button
          onClick={onClearBodies}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded-xl transition-colors mt-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Sandbox Bodies</span>
        </button>
      </div>

      {/* Live Bodies Interaction Readout */}
      {activeBodies.length > 0 && (
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Live Bodies & Gravity Zones</span>
            <span className="text-[10px] text-cyan-400">Hover / Click to Inspect</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {activeBodies.map((b) => {
              const isTargeted = b.isHovered || b.isSelected;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBodyId(b.isSelected ? null : b.id)}
                  className={`w-full text-left p-2 rounded-xl border transition-all text-xs ${
                    isTargeted
                      ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: b.color }}
                      />
                      <span className="font-semibold truncate">{b.name}</span>
                    </div>
                    <span className="font-mono text-cyan-300 text-[11px]">
                      {b.speed.toFixed(1)} km/s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Mass: {b.mass}</span>
                    <span className="text-cyan-400">
                      Hill Sphere: {b.hillSphereRadius.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
