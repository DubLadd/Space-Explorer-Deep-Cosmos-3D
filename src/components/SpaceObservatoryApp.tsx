import { useEffect, useRef, useState } from 'react';
import { SpaceEngine } from '../scene/SpaceEngine';
import {
  CelestialBody,
  CockpitTelemetry,
  Mission,
  SandboxBodyConfig,
  SandboxBodyState,
  SimulationMode,
} from '../types/cosmos';
import { SOLAR_SYSTEM_BODIES, TRAPPIST_SYSTEM_BODIES } from '../data/celestialBodies';
import { cosmicAudio } from '../audio/CosmicAudio';
import { TopNav } from './TopNav';
import { TimeController } from './TimeController';
import { CockpitHUD } from './CockpitHUD';
import { CelestialDossier } from './CelestialDossier';
import { MissionDrawer } from './MissionDrawer';
import { GalaxyColorPanel } from './GalaxyColorPanel';
import { PlanetListSidebar } from './PlanetListSidebar';
import { SandboxControls } from './SandboxControls';
import { Globe } from 'lucide-react';

interface SpaceObservatoryAppProps {
  onSwitchToMusicDashboard: () => void;
}

export const SpaceObservatoryApp: React.FC<SpaceObservatoryAppProps> = ({
  onSwitchToMusicDashboard,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SpaceEngine | null>(null);

  // Simulation State
  const [currentMode, setCurrentMode] = useState<SimulationMode>('solar');
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(SOLAR_SYSTEM_BODIES[0]);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [timeDirection, setTimeDirection] = useState<1 | -1>(1);
  const [orbitsVisible, setOrbitsVisible] = useState<boolean>(true);
  const [constellationsVisible, setConstellationsVisible] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(true);
  const [flashActive, setFlashActive] = useState<boolean>(false);

  // Galaxy Mode Customization
  const [currentShapeName, setCurrentShapeName] = useState<string>('Spiral Galaxy');
  const [coreColor, setCoreColor] = useState<string>('#ffffff');
  const [midColor, setMidColor] = useState<string>('#6ee7ff');
  const [edgeColor, setEdgeColor] = useState<string>('#1450a8');

  // Mission State
  const [missionsOpen, setMissionsOpen] = useState<boolean>(false);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [missionStepIndex, setMissionStepIndex] = useState<number>(0);

  // Cockpit Flight Telemetry State
  const [cockpitTelemetry, setCockpitTelemetry] = useState<CockpitTelemetry>({
    speedKms: 0,
    throttle: 0,
    warpEngaged: false,
    targetBodyId: null,
    targetDistanceKm: 0,
    gravitationalPullG: 1.0,
    headingPitch: 0,
    headingYaw: 0,
  });

  // Orbital Sandbox State
  const [sandboxG, setSandboxG] = useState<number>(1.0);
  const [showSandboxVectors, setShowSandboxVectors] = useState<boolean>(true);
  const [showSandboxTrails, setShowSandboxTrails] = useState<boolean>(true);
  const [showSandboxGrid, setShowSandboxGrid] = useState<boolean>(true);
  const [showHillSpheres, setShowHillSpheres] = useState<boolean>(false);
  const [isPlacementMode, setIsPlacementMode] = useState<boolean>(false);
  const [activeSandboxBodies, setActiveSandboxBodies] = useState<SandboxBodyState[]>([]);
  const [inspectedSandboxBody, setInspectedSandboxBody] = useState<SandboxBodyState | null>(null);

  // Initialize SpaceEngine on Mount
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new SpaceEngine(containerRef.current, {
      onSelectBody: (body) => {
        setSelectedBody(body);
      },
      onUpdateCockpitTelemetry: (telemetry) => {
        setCockpitTelemetry(telemetry);
      },
      onShapeChange: (name) => {
        setCurrentShapeName(name);
      },
      onSandboxBodiesChange: (bodies) => {
        setActiveSandboxBodies(bodies);
        const targeted = bodies.find((b) => b.isSelected || b.isHovered);
        setInspectedSandboxBody(targeted || null);
      },
      onHoverSandboxBody: (body) => {
        if (body) setInspectedSandboxBody(body);
      },
      onSelectSandboxBody: (body) => {
        setInspectedSandboxBody(body);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Handle Mode Change
  const handleSelectMode = (mode: SimulationMode) => {
    setCurrentMode(mode);
    if (engineRef.current) {
      engineRef.current.setMode(mode);
    }
    if (mode === 'solar') {
      setSelectedBody(SOLAR_SYSTEM_BODIES[0]);
    } else if (mode === 'exoplanet') {
      setSelectedBody(TRAPPIST_SYSTEM_BODIES[0]);
    } else {
      setSelectedBody(null);
    }
  };

  // Capture Cosmic Moment: Browser-native WebGL Snapshot Download without UI overlays
  const handleCaptureMoment = () => {
    if (!engineRef.current) return;

    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    cosmicAudio.playTargetLockSound();

    const dataUrl = engineRef.current.captureSnapshot();

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `cosmic_moment_${timestamp}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Time Controls
  const handleSetTimeScale = (scale: number, dir: 1 | -1) => {
    setTimeScale(scale);
    setTimeDirection(dir);
    if (engineRef.current) {
      engineRef.current.setTimeScale(scale);
      engineRef.current.setTimeDirection(dir);
    }
  };

  // Toggle Orbits
  const handleToggleOrbits = () => {
    const next = !orbitsVisible;
    setOrbitsVisible(next);
    if (engineRef.current) {
      engineRef.current.toggleOrbits(next);
    }
  };

  // Toggle Constellations
  const handleToggleConstellations = () => {
    const next = !constellationsVisible;
    setConstellationsVisible(next);
    if (engineRef.current) {
      engineRef.current.toggleConstellations(next);
    }
  };

  // Handle Body Selection
  const handleSelectBody = (body: CelestialBody) => {
    setSelectedBody(body);
    if (engineRef.current) {
      engineRef.current.focusOnBody(body);
    }
  };

  // Handle System Overview
  const handleOverview = () => {
    setSelectedBody(null);
    if (engineRef.current) {
      engineRef.current.requestFocus(currentMode === 'solar' ? 24 : 16);
    }
  };

  // Handle Galaxy Colors
  const handleChangeGalaxyColors = (core: string, mid: string, edge: string) => {
    setCoreColor(core);
    setMidColor(mid);
    setEdgeColor(edge);
    if (engineRef.current) {
      engineRef.current.setGalaxyColors(core, mid, edge);
    }
  };

  // Handle Audio
  const handleToggleAudio = () => {
    const nextMute = !audioMuted;
    setAudioMuted(nextMute);
    cosmicAudio.setMuted(nextMute);
  };

  // Mission Step Progression
  const handleMissionStepChange = (newIndex: number) => {
    if (!activeMission) return;
    setMissionStepIndex(newIndex);
    const step = activeMission.steps[newIndex];
    if (step) {
      const allBodies = [...SOLAR_SYSTEM_BODIES, ...TRAPPIST_SYSTEM_BODIES];
      const targetBody = allBodies.find((b) => b.id === step.bodyId);

      if (step.mode !== currentMode) {
        handleSelectMode(step.mode);
      }

      if (targetBody && engineRef.current) {
        setSelectedBody(targetBody);
        engineRef.current.focusOnBody(targetBody);
      } else if (engineRef.current) {
        engineRef.current.requestFocus(step.cameraDistance);
      }
    }
  };

  const handleSelectMission = (mission: Mission | null) => {
    setActiveMission(mission);
    setMissionStepIndex(0);
    if (mission && mission.steps.length > 0) {
      const step = mission.steps[0];
      if (step.mode !== currentMode) {
        handleSelectMode(step.mode);
      }
      handleMissionStepChange(0);
    }
  };

  // Sandbox Handlers
  const handleSetSandboxG = (g: number) => {
    setSandboxG(g);
    if (engineRef.current) {
      engineRef.current.setSandboxG(g);
    }
  };

  const handleToggleSandboxVectors = () => {
    const next = !showSandboxVectors;
    setShowSandboxVectors(next);
    if (engineRef.current) {
      engineRef.current.toggleSandboxVectors(next);
    }
  };

  const handleToggleSandboxTrails = () => {
    const next = !showSandboxTrails;
    setShowSandboxTrails(next);
    if (engineRef.current) {
      engineRef.current.toggleSandboxTrails(next);
    }
  };

  const handleToggleSandboxGrid = () => {
    const next = !showSandboxGrid;
    setShowSandboxGrid(next);
    if (engineRef.current) {
      engineRef.current.toggleSandboxGrid(next);
    }
  };

  const handleToggleHillSpheres = () => {
    const next = !showHillSpheres;
    setShowHillSpheres(next);
    if (engineRef.current) {
      engineRef.current.toggleAllHillSpheres(next);
    }
  };

  const handleLoadSandboxPreset = (presetId: string) => {
    if (engineRef.current) {
      engineRef.current.loadSandboxPreset(presetId);
      setSandboxG(engineRef.current.sandboxG);
    }
  };

  const handleResetSandboxToDefault = () => {
    if (engineRef.current) {
      engineRef.current.resetSandboxToDefault();
      setSandboxG(engineRef.current.sandboxG);
    }
  };

  const handleClearSandboxBodies = () => {
    if (engineRef.current) {
      engineRef.current.clearSandboxBodies();
    }
  };

  const handleSpawnSandboxBody = (config: SandboxBodyConfig) => {
    if (engineRef.current) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 8;
      const speed = Math.sqrt((sandboxG * 400) / dist);
      engineRef.current.spawnSandboxBody(
        config,
        [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        [-Math.sin(angle) * speed, 0, Math.cos(angle) * speed]
      );
      cosmicAudio.playTargetLockSound();
    }
  };

  const handleSelectSandboxBodyId = (id: string | null) => {
    if (engineRef.current) {
      engineRef.current.selectSandboxBodyById(id);
    }
  };

  const handleTogglePlacementMode = () => {
    const next = !isPlacementMode;
    setIsPlacementMode(next);
    if (engineRef.current) {
      engineRef.current.isInteractivePlacementMode = next;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#010206] text-slate-100 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Camera Shutter Flash Overlay */}
      {flashActive && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-white/75 backdrop-blur-xs transition-opacity duration-200" />
      )}

      {/* Top Telemetry & Navigation Bar with Capture Moment Button */}
      <TopNav
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        audioMuted={audioMuted}
        onToggleAudio={handleToggleAudio}
        onOpenMissions={() => setMissionsOpen(!missionsOpen)}
        missionsOpen={missionsOpen}
        onCaptureMoment={handleCaptureMoment}
        onSwitchToMusicDashboard={onSwitchToMusicDashboard}
      />

      {/* Mode Sub-Banner Overlay (Center Top) */}
      {currentMode !== 'cockpit' && (
        <div className="pointer-events-none fixed top-16 left-0 right-0 z-10 flex flex-col items-center text-center px-4">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
            {currentMode === 'solar' && 'The Solar System'}
            {currentMode === 'exoplanet' && 'Alien Exoplanet Systems (TRAPPIST-1 & Proxima)'}
            {currentMode === 'galaxy' && 'Spiral Galactic Topologies'}
            {currentMode === 'blackhole' && 'Gargantua Black Hole & Relativistic Pulsar'}
            {currentMode === 'supernova' && 'Core-Collapse Supernova Shockwave'}
            {currentMode === 'sandbox' && 'Orbital Gravitational Sandbox'}
          </h1>
          <p className="text-[11px] text-cyan-300/80 font-mono tracking-wider uppercase mt-0.5">
            {currentMode === 'solar' && 'Drag to orbit · Scroll to zoom · Click planet to inspect'}
            {currentMode === 'exoplanet' && 'Seven Earth-sized worlds orbiting an ultra-cool red dwarf star'}
            {currentMode === 'galaxy' && '40,000 particles morphing across mathematical manifolds'}
            {currentMode === 'blackhole' && 'Keplerian accretion disk · Gravitational photon sphere'}
            {currentMode === 'supernova' && 'Catastrophic iron-core collapse releasing expanding shockwave'}
            {currentMode === 'sandbox' && 'Real-time N-body gravitational interaction vectors & orbital trajectories'}
          </p>

          {/* Floating Hill Sphere Indicator in Sandbox Mode */}
          {currentMode === 'sandbox' && inspectedSandboxBody && (
            <div className="pointer-events-auto mt-2 inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md rounded-full shadow-lg shadow-black/60 text-xs text-cyan-200 animate-in fade-in zoom-in-95 duration-200">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-white">{inspectedSandboxBody.name}</strong> Hill Sphere Radius: <strong className="font-mono text-cyan-300">{inspectedSandboxBody.hillSphereRadius.toFixed(2)}</strong> (Zone of Dominant Gravitational Capture)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Planet List Sidebar (Solar & Exoplanet modes) */}
      {currentMode !== 'cockpit' && currentMode !== 'sandbox' && (
        <PlanetListSidebar
          currentMode={currentMode}
          selectedBody={selectedBody}
          onSelectBody={handleSelectBody}
          onOverview={handleOverview}
        />
      )}

      {/* Orbital Sandbox Controls (When in Sandbox Mode) */}
      {currentMode === 'sandbox' && (
        <SandboxControls
          sandboxG={sandboxG}
          onSetSandboxG={handleSetSandboxG}
          showVectors={showSandboxVectors}
          onToggleVectors={handleToggleSandboxVectors}
          showTrails={showSandboxTrails}
          onToggleTrails={handleToggleSandboxTrails}
          showGrid={showSandboxGrid}
          onToggleGrid={handleToggleSandboxGrid}
          showHillSpheres={showHillSpheres}
          onToggleHillSpheres={handleToggleHillSpheres}
          onLoadPreset={handleLoadSandboxPreset}
          onResetToDefault={handleResetSandboxToDefault}
          onClearBodies={handleClearSandboxBodies}
          onSpawnBody={handleSpawnSandboxBody}
          onSelectBodyId={handleSelectSandboxBodyId}
          isPlacementMode={isPlacementMode}
          onTogglePlacementMode={handleTogglePlacementMode}
          activeBodies={activeSandboxBodies}
        />
      )}

      {/* Deep Celestial Dossier (Right drawer) */}
      {currentMode !== 'cockpit' && currentMode !== 'sandbox' && selectedBody && (
        <CelestialDossier
          body={selectedBody}
          onClose={() => setSelectedBody(null)}
          onFocus={handleSelectBody}
        />
      )}

      {/* Galaxy Color Customization (Galaxy mode) */}
      {currentMode === 'galaxy' && (
        <GalaxyColorPanel
          currentShapeName={currentShapeName}
          coreColor={coreColor}
          midColor={midColor}
          edgeColor={edgeColor}
          onChangeColors={handleChangeGalaxyColors}
        />
      )}

      {/* Guided Mission Expeditions (Left Drawer) */}
      <MissionDrawer
        isOpen={missionsOpen}
        onClose={() => setMissionsOpen(false)}
        activeMission={activeMission}
        currentStepIndex={missionStepIndex}
        onSelectMission={handleSelectMission}
        onStepChange={handleMissionStepChange}
      />

      {/* Cockpit HUD (When Flight Deck is active) */}
      {currentMode === 'cockpit' && (
        <CockpitHUD
          telemetry={cockpitTelemetry}
          onExitCockpit={() => handleSelectMode('solar')}
          targetName={selectedBody?.name || 'Open Void'}
        />
      )}

      {/* Time Scrubbing & Trajectory Controls (Bottom Tray) */}
      {currentMode !== 'cockpit' && (
        <TimeController
          timeScale={timeScale}
          timeDirection={timeDirection}
          onSetTimeScale={handleSetTimeScale}
          orbitsVisible={orbitsVisible}
          onToggleOrbits={handleToggleOrbits}
          constellationsVisible={constellationsVisible}
          onToggleConstellations={handleToggleConstellations}
        />
      )}
    </div>
  );
};
