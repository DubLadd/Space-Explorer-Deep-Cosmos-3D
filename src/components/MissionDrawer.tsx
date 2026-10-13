import React from 'react';
import { Mission, MissionStep } from '../types/cosmos';
import { MISSIONS } from '../data/missions';
import { ChevronRight, ChevronLeft, X, Compass, CheckCircle2, Award } from 'lucide-react';

interface MissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeMission: Mission | null;
  currentStepIndex: number;
  onSelectMission: (mission: Mission) => void;
  onStepChange: (stepIndex: number) => void;
}

export const MissionDrawer: React.FC<MissionDrawerProps> = ({
  isOpen,
  onClose,
  activeMission,
  currentStepIndex,
  onSelectMission,
  onStepChange,
}) => {
  if (!isOpen) return null;

  const currentStep: MissionStep | null =
    activeMission && activeMission.steps[currentStepIndex] ? activeMission.steps[currentStepIndex] : null;

  return (
    <div className="fixed top-20 left-4 z-30 w-80 md:w-96 max-h-[calc(100vh-120px)] overflow-y-auto p-5 bg-[#030712]/92 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl shadow-black/80 select-none animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Guided Space Missions
            </h2>
            <div className="text-[11px] text-slate-400">
              Interactive Astrophysical Expeditions
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Close Mission Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* If No Active Mission: Show Mission Catalog */}
      {!activeMission ? (
        <div className="py-3 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select an Expedition
          </div>
          {MISSIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMission(m)}
              className="w-full text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                <span>{m.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{m.steps.length} Steps</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {m.tagline}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <span>Difficulty: <strong className="text-slate-200">{m.difficulty}</strong></span>
                <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  Launch →
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Active Mission Progress View */
        <div className="py-3 space-y-4">
          {/* Mission Title & Step Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
              <span>{activeMission.title}</span>
              <span className="font-mono text-cyan-300">
                Step {currentStepIndex + 1} of {activeMission.steps.length}
              </span>
            </div>
            {/* Step progress pills */}
            <div className="flex gap-1.5 mt-2">
              {activeMission.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    idx <= currentStepIndex ? 'bg-cyan-400' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Step Briefing */}
          {currentStep && (
            <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/20 rounded-xl space-y-2">
              <div className="text-xs font-bold text-cyan-300">
                {currentStep.title}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {currentStep.briefing}
              </p>
            </div>
          )}

          {/* Telemetry Highlights */}
          {currentStep && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Telemetry Readout
              </div>
              <div className="grid grid-cols-1 gap-2">
                {currentStep.telemetry.map((t) => (
                  <div
                    key={t.label}
                    className="flex justify-between p-2 bg-white/5 border border-white/5 rounded-lg text-xs"
                  >
                    <span className="text-slate-400">{t.label}:</span>
                    <span className="font-mono-numbers text-white font-semibold">
                      {t.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-medium rounded-xl border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentStepIndex < activeMission.steps.length - 1 ? (
              <button
                onClick={() => onStepChange(currentStepIndex + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                <span>Next Target</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onSelectMission(null as unknown as Mission)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mission Complete</span>
              </button>
            )}
          </div>

          <div className="text-center pt-1">
            <button
              onClick={() => onSelectMission(null as unknown as Mission)}
              className="text-[11px] text-slate-400 hover:text-white underline transition-colors"
            >
              Back to Mission Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
