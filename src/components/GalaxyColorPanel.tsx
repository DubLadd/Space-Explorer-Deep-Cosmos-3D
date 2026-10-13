import React from 'react';
import { Palette, RefreshCw } from 'lucide-react';

interface GalaxyColorPanelProps {
  currentShapeName: string;
  coreColor: string;
  midColor: string;
  edgeColor: string;
  onChangeColors: (core: string, mid: string, edge: string) => void;
}

export const GalaxyColorPanel: React.FC<GalaxyColorPanelProps> = ({
  currentShapeName,
  coreColor,
  midColor,
  edgeColor,
  onChangeColors,
}) => {
  const presets = [
    { name: 'Cyan Nebula', core: '#ffffff', mid: '#6ee7ff', edge: '#1450a8' },
    { name: 'Rose Pulsar', core: '#ffffff', mid: '#ff6ec7', edge: '#7a0e6e' },
    { name: 'Deep Violet', core: '#ffffff', mid: '#b388ff', edge: '#3a0ca3' },
    { name: 'Solar Gold', core: '#ffffff', mid: '#ffd166', edge: '#a85200' },
    { name: 'Emerald Aurora', core: '#ffffff', mid: '#6effa3', edge: '#0a6e3a' },
    { name: 'Supernova Red', core: '#ffffff', mid: '#ff6e6e', edge: '#7a0e0e' },
  ];

  return (
    <div className="fixed top-20 right-4 z-30 w-72 p-4 bg-[#030712]/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/80 select-none space-y-3">
      {/* Morphing Topology State Indicator */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Topology</span>
        </div>
        <span className="text-white font-mono font-medium truncate max-w-[140px]">
          {currentShapeName}
        </span>
      </div>

      {/* Color Inputs */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <label className="text-slate-300">Core Star:</label>
          <input
            type="color"
            value={coreColor}
            onChange={(e) => onChangeColors(e.target.value, midColor, edgeColor)}
            className="w-8 h-6 rounded border-0 bg-transparent cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-slate-300">Glow Mid:</label>
          <input
            type="color"
            value={midColor}
            onChange={(e) => onChangeColors(coreColor, e.target.value, edgeColor)}
            className="w-8 h-6 rounded border-0 bg-transparent cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-slate-300">Outer Edge:</label>
          <input
            type="color"
            value={edgeColor}
            onChange={(e) => onChangeColors(coreColor, midColor, e.target.value)}
            className="w-8 h-6 rounded border-0 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Preset Swatches */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
          <Palette className="w-3 h-3" />
          <span>Astrophotography Palettes</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => onChangeColors(p.core, p.mid, p.edge)}
              title={p.name}
              style={{
                background: `linear-gradient(135deg, ${p.core}, ${p.mid}, ${p.edge})`,
              }}
              className="w-7 h-7 rounded-full border border-white/30 hover:scale-110 active:scale-95 transition-transform"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
