import React from 'react';
import { CelestialBody } from '../types/cosmos';
import { X, Target, Thermometer, Compass, Globe, Info } from 'lucide-react';

interface CelestialDossierProps {
  body: CelestialBody | null;
  onClose: () => void;
  onFocus: (body: CelestialBody) => void;
}

export const CelestialDossier: React.FC<CelestialDossierProps> = ({
  body,
  onClose,
  onFocus,
}) => {
  if (!body) return null;

  return (
    <div className="fixed top-20 right-4 z-30 w-80 md:w-96 max-h-[calc(100vh-120px)] overflow-y-auto p-5 bg-[#030712]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/80 select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono tracking-wider uppercase">
            <span>{body.system.toUpperCase()} SYSTEM</span>
            <span aria-hidden="true">·</span>
            <span>{body.type.toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {body.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Close Dossier"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Zero-Pill Quick Metadata Ribbon */}
      <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 py-3 text-xs text-slate-300 font-mono border-b border-white/10">
        <div>
          <span className="text-slate-400">Radius: </span>
          <span className="font-mono-numbers text-white font-semibold">
            {body.realRadiusKm.toLocaleString()} km
          </span>
        </div>
        <span className="text-slate-600" aria-hidden="true">·</span>
        {body.semiMajorAxisAU > 0 && (
          <>
            <div>
              <span className="text-slate-400">Dist: </span>
              <span className="font-mono-numbers text-white font-semibold">
                {body.semiMajorAxisAU} AU
              </span>
            </div>
            <span className="text-slate-600" aria-hidden="true">·</span>
          </>
        )}
        <div>
          <span className="text-slate-400">Gravity: </span>
          <span className="font-mono-numbers text-white font-semibold">
            {body.dossier.surfaceGravityG} G
          </span>
        </div>
      </div>

      {/* Core Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 py-3 border-b border-white/10">
        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Surface Temp</span>
          </div>
          <div className="text-base font-bold font-mono-numbers text-amber-300">
            {body.dossier.surfaceTempK.toLocaleString()} K
          </div>
          <div className="text-[10px] text-slate-400">
            ({Math.round(body.dossier.surfaceTempK - 273.15)}°C)
          </div>
        </div>

        <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Orbital Period</span>
          </div>
          <div className="text-base font-bold font-mono-numbers text-cyan-300">
            {body.orbitalPeriodDays > 0 ? `${body.orbitalPeriodDays.toLocaleString()} d` : 'Host Star'}
          </div>
          <div className="text-[10px] text-slate-400">
            Rot: {Math.abs(body.rotationPeriodHours).toFixed(1)} hrs
          </div>
        </div>
      </div>

      {/* Atmosphere Composition Bar (if applicable) */}
      {body.atmosphere && (
        <div className="py-3 border-b border-white/10">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Atmospheric Composition ({body.atmosphere.pressureAtm} atm)
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {body.atmosphere.composition.map((gas, idx) => {
              const colors = ['bg-cyan-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'];
              return (
                <div
                  key={gas.gas}
                  style={{ width: `${gas.percentage}%` }}
                  className={`h-full ${colors[idx % colors.length]}`}
                  title={`${gas.gas}: ${gas.percentage}%`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-400">
            {body.atmosphere.composition.map((gas) => (
              <span key={gas.gas}>
                {gas.gas}: <strong className="text-slate-200">{gas.percentage}%</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Narrative & Key Fact */}
      <div className="py-3 space-y-2.5 border-b border-white/10">
        <p className="text-xs text-slate-300 leading-relaxed">
          {body.dossier.summary}
        </p>

        <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 leading-relaxed">
          <strong className="text-cyan-300 block mb-1">Key Astrophysical Fact:</strong>
          {body.dossier.keyFact}
        </div>
      </div>

      {/* Scientific Trivia */}
      <div className="py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Scientific Field Notes</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
          {body.dossier.scientificTrivia.map((note, idx) => (
            <li key={idx} className="leading-relaxed">
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button
          onClick={() => onFocus(body)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-xl shadow-md transition-colors"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Center & Lock Camera</span>
        </button>
      </div>
    </div>
  );
};
