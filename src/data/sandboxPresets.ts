export interface SandboxPresetDef {
  id: string;
  name: string;
  description: string;
  gConstant: number;
  bodies: {
    name: string;
    type: 'star' | 'blackhole' | 'gas_giant' | 'planet' | 'moon';
    mass: number;
    radius: number;
    color: string;
    position: [number, number, number];
    velocity: [number, number, number];
  }[];
}

export const SANDBOX_PRESETS: SandboxPresetDef[] = [
  {
    id: 'figure8',
    name: 'Figure-8 Three-Body Solution',
    description: 'The famous stable choreography discovered by Cris Moore (1993) where three equal masses trace a single figure-eight loop in perpetual harmony.',
    gConstant: 1.0,
    bodies: [
      {
        name: 'Sol Alpha',
        type: 'star',
        mass: 120,
        radius: 0.65,
        color: '#f59e0b',
        position: [-5.82, 0, 1.45],
        velocity: [0.65, 0, 0.60],
      },
      {
        name: 'Sol Beta',
        type: 'star',
        mass: 120,
        radius: 0.65,
        color: '#06b6d4',
        position: [5.82, 0, -1.45],
        velocity: [0.65, 0, 0.60],
      },
      {
        name: 'Sol Gamma',
        type: 'star',
        mass: 120,
        radius: 0.65,
        color: '#ec4899',
        position: [0, 0, 0],
        velocity: [-1.30, 0, -1.20],
      },
    ],
  },
  {
    id: 'binary_circumbinary',
    name: 'Binary Star & Circumbinary Planet',
    description: 'Two massive stars mutual orbiting a central barycenter with a rocky planet in a stable outer circumbinary orbit.',
    gConstant: 1.2,
    bodies: [
      {
        name: 'Primary Star (A)',
        type: 'star',
        mass: 400,
        radius: 0.9,
        color: '#fbbf24',
        position: [-3.5, 0, 0],
        velocity: [0, 0, 4.2],
      },
      {
        name: 'Companion Star (B)',
        type: 'star',
        mass: 400,
        radius: 0.85,
        color: '#f97316',
        position: [3.5, 0, 0],
        velocity: [0, 0, -4.2],
      },
      {
        name: 'Tatooine Prime',
        type: 'planet',
        mass: 8,
        radius: 0.35,
        color: '#38bdf8',
        position: [14.0, 0, 0],
        velocity: [0, 0, -7.5],
      },
      {
        name: 'Outer Gas Giant',
        type: 'gas_giant',
        mass: 35,
        radius: 0.55,
        color: '#a855f7',
        position: [-22.0, 0, 0],
        velocity: [0, 0, 6.0],
      },
    ],
  },
  {
    id: 'lagrange_system',
    name: 'Lagrange Equilibrium (Sun-Jupiter-Trojans)',
    description: 'Massive central star, orbital gas giant, and stable Trojan asteroids hovering at the L4 and L5 gravitational equilibrium points (60° ahead and behind).',
    gConstant: 1.0,
    bodies: [
      {
        name: 'Central Star',
        type: 'star',
        mass: 1000,
        radius: 1.1,
        color: '#fef08a',
        position: [0, 0, 0],
        velocity: [0, 0, 0],
      },
      {
        name: 'Jovian Giant',
        type: 'gas_giant',
        mass: 60,
        radius: 0.7,
        color: '#ca8a04',
        position: [12.0, 0, 0],
        velocity: [0, 0, 9.1],
      },
      {
        name: 'Trojan Cluster L4',
        type: 'moon',
        mass: 2,
        radius: 0.22,
        color: '#10b981',
        position: [6.0, 0, 10.39], // 60° ahead
        velocity: [-7.88, 0, 4.55],
      },
      {
        name: 'Trojan Cluster L5',
        type: 'moon',
        mass: 2,
        radius: 0.22,
        color: '#34d399',
        position: [6.0, 0, -10.39], // 60° behind
        velocity: [7.88, 0, 4.55],
      },
    ],
  },
  {
    id: 'chaotic_dance',
    name: 'Chaotic 4-Body Cluster',
    description: 'Four bodies of comparable mass released in close proximity. Non-linear gravitational perturbations lead to dramatic close passes, ejections, and slingshots.',
    gConstant: 1.1,
    bodies: [
      {
        name: 'Star Epsilon',
        type: 'star',
        mass: 220,
        radius: 0.6,
        color: '#ef4444',
        position: [-4.0, 0, -3.0],
        velocity: [1.2, 0, -1.0],
      },
      {
        name: 'Star Zeta',
        type: 'star',
        mass: 200,
        radius: 0.58,
        color: '#3b82f6',
        position: [4.0, 0, 3.0],
        velocity: [-1.0, 0, 1.2],
      },
      {
        name: 'Rogue Giant',
        type: 'gas_giant',
        mass: 140,
        radius: 0.5,
        color: '#10b981',
        position: [-3.0, 0, 4.0],
        velocity: [1.5, 0, -0.8],
      },
      {
        name: 'Kerr Singularity',
        type: 'blackhole',
        mass: 320,
        radius: 0.45,
        color: '#000000',
        position: [3.0, 0, -4.0],
        velocity: [-0.9, 0, 1.4],
      },
    ],
  },
];
