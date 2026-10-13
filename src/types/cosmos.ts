/**
 * Type definitions for Space Explorer: Deep Cosmos 3D
 */

export type SimulationMode =
  | 'solar'
  | 'exoplanet'
  | 'galaxy'
  | 'blackhole'
  | 'supernova'
  | 'cockpit'
  | 'sandbox';

export type SystemId = 'solar' | 'trappist' | 'alphacentauri';

export interface SandboxBodyConfig {
  name: string;
  type: 'star' | 'blackhole' | 'gas_giant' | 'planet' | 'moon';
  mass: number;
  radius: number;
  color: string;
}

export interface SandboxBodyState {
  id: string;
  name: string;
  type: 'star' | 'blackhole' | 'gas_giant' | 'planet' | 'moon';
  mass: number;
  radius: number;
  color: string;
  position: [number, number, number];
  velocity: [number, number, number];
  acceleration: [number, number, number];
  speed: number;
  hillSphereRadius: number;
  isHovered?: boolean;
  isSelected?: boolean;
}


export interface CelestialBody {
  id: string;
  name: string;
  system: SystemId;
  type: 'star' | 'planet' | 'dwarf' | 'moon' | 'pulsar' | 'blackhole';
  radius: number; // visual scale in scene units
  realRadiusKm: number;
  semiMajorAxisAU: number;
  orbitRadiusScene: number; // scene coordinate distance
  eccentricity: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  color: string;
  glowColor?: string;
  massEarthRelative: number;
  habitableZone?: boolean;
  rings?: {
    innerRadius: number;
    outerRadius: number;
    color: string;
    opacity: number;
  };
  moons?: {
    name: string;
    radius: number;
    orbitDist: number;
    speed: number;
    color: string;
  }[];
  atmosphere?: {
    color: string;
    composition: { gas: string; percentage: number }[];
    pressureAtm: number;
  };
  dossier: {
    summary: string;
    surfaceTempK: number;
    surfaceGravityG: number;
    discoveryYear?: number;
    distanceLightYears?: number;
    keyFact: string;
    scientificTrivia: string[];
  };
}

export interface MissionStep {
  title: string;
  bodyId: string;
  mode: SimulationMode;
  cameraDistance: number;
  briefing: string;
  telemetry: { label: string; value: string }[];
}

export interface Mission {
  id: string;
  title: string;
  tagline: string;
  difficulty: 'Beginner' | 'Scientific' | 'Advanced Pilot';
  steps: MissionStep[];
}

export interface CockpitTelemetry {
  speedKms: number;
  throttle: number; // 0 to 1
  warpEngaged: boolean;
  targetBodyId: string | null;
  targetDistanceKm: number;
  gravitationalPullG: number;
  headingPitch: number;
  headingYaw: number;
}
