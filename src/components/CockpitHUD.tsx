import React from 'react';
import { CockpitTelemetry } from '../types/cosmos';
import { Crosshair, Zap, Shield, Navigation, Gauge } from 'lucide-react';

interface CockpitHUDProps {
  telemetry: CockpitTelemetry;
  onExitCockpit: () => void;
  targetName?: string;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  telemetry,
  onExitCockpit,
  targetName = 'None Selected',
}) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-6 select-none font-mono">
      {/* Top Cockpit Instrument Banner */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Telemetry Cluster */}
        <div className="pointer-events-auto p-3.5 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl max-w-xs shadow-lg shadow-black/80">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5" />
            <span>Flight Telemetry</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Velocity:</span>
              <span className="font-mono-numbers text-cyan-300 font-bold">
                {telemetry.speedKms.toLocaleString()} km/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Throttle:</span>
              <span className="font-mono-numbers text-white font-semibold">
                {Math.round(telemetry.throttle * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gravity:</span>
              <span className="font-mono-numbers text-amber-300">
                {telemetry.gravitationalPullG.toFixed(2)} G
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pitch / Yaw:</span>
              <span className="font-mono-numbers text-slate-300">
                {telemetry.headingPitch}° / {telemetry.headingYaw}°
              </span>
            </div>
          </div>
        </div>

        {/* Center Warp State */}
        <div className="flex flex-col items-center">
          <div
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold tracking-widest uppercase transition-all shadow-md ${
              telemetry.warpEngaged
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-fuchsia-500/30 animate-pulse'
                : 'bg-black/60 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {telemetry.warpEngaged ? 'WARP DRIVE ENGAGED (2,500 km/s)' : 'SUBLIGHT INERTIAL MODE'}
          </div>
        </div>

        {/* Right Target Lock Cluster */}
        <div className="pointer-events-auto p-3.5 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl max-w-xs shadow-lg shadow-black/80">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wider">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Target Lock</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Target:</span>
              <span className="text-amber-300 font-semibold truncate max-w-[120px]">
                {targetName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Distance:</span>
              <span className="font-mono-numbers text-cyan-300 font-bold">
                {telemetry.targetDistanceKm > 0
                  ? `${telemetry.targetDistanceKm.toLocaleString()} km`
                  : 'Out of Range'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deflector:</span>
              <span className="text-emerald-400 font-semibold">100% NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Flight Reticle & Artificial Horizon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center">
          {/* Inner Crosshairs */}
          <div className="w-8 h-[1px] bg-cyan-400/60" />
          <div className="h-8 w-[1px] bg-cyan-400/60 absolute" />
          <div className="w-2.5 h-2.5 rounded-full border border-cyan-400/80 absolute" />

          {/* Artificial Horizon Pitch Ticks */}
          <div className="absolute -top-6 text-[10px] text-cyan-500/70 font-mono-numbers">
            +10°
          </div>
          <div className="absolute -bottom-6 text-[10px] text-cyan-500/70 font-mono-numbers">
            -10°
          </div>
        </div>
      </div>

      {/* Bottom Flight Controls Helper & Exit Button */}
      <div className="flex items-end justify-between gap-4">
        {/* Keyboard Instructions Box */}
        <div className="pointer-events-auto p-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl text-[11px] text-slate-300 space-y-1 shadow-lg shadow-black/80">
          <div className="text-cyan-400 font-semibold uppercase tracking-wider mb-1">
            Flight Controls
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-white font-bold">W / S</span>: Pitch Down/Up
            </div>
            <div>
              <span className="text-white font-bold">A / D</span>: Turn Left/Right
            </div>
            <div>
              <span className="text-white font-bold">Q / E</span>: Bank Roll
            </div>
          </div>
          <div className="flex gap-4 pt-0.5">
            <div>
              <span className="text-white font-bold">Shift</span>: Main Thrusters
            </div>
            <div>
              <span className="text-white font-bold">Shift + W</span>: Toggle Warp
            </div>
          </div>
        </div>

        {/* Exit Flight Deck Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onExitCockpit}
            className="px-4 py-2 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl border border-rose-400/40 shadow-lg shadow-rose-900/40 transition-colors uppercase tracking-wider"
          >
            Disengage Flight Deck
          </button>
        </div>
      </div>
    </div>
  );
};
