export interface ConstellationStar {
  name: string;
  raHours: number; // right ascension in hours (0 to 24)
  decDeg: number;  // declination in degrees (-90 to +90)
  mag: number;     // apparent magnitude
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  season: string;
  stars: ConstellationStar[];
  lines: [number, number][]; // pairs of indices into stars array
}

// Convert RA/Dec coordinates to 3D Cartesian points on a sphere of radius R
export function raDecToCartesian(raHours: number, decDeg: number, radius: number): [number, number, number] {
  const theta = (raHours / 24) * Math.PI * 2;
  const phi = (decDeg * Math.PI) / 180;
  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.sin(theta);
  return [x, y, z];
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion',
    latinName: 'The Hunter',
    season: 'Winter',
    stars: [
      { name: 'Betelgeuse', raHours: 5.92, decDeg: 7.41, mag: 0.5 },    // 0
      { name: 'Rigel', raHours: 5.24, decDeg: -8.20, mag: 0.18 },       // 1
      { name: 'Bellatrix', raHours: 5.42, decDeg: 6.35, mag: 1.64 },    // 2
      { name: 'Saiph', raHours: 5.79, decDeg: -9.67, mag: 2.07 },       // 3
      { name: 'Alnitak', raHours: 5.68, decDeg: -1.94, mag: 1.74 },     // 4 (Belt)
      { name: 'Alnilam', raHours: 5.60, decDeg: -1.20, mag: 1.69 },     // 5 (Belt)
      { name: 'Mintaka', raHours: 5.53, decDeg: -0.30, mag: 2.25 },     // 6 (Belt)
      { name: 'Meissa', raHours: 5.58, decDeg: 9.93, mag: 3.39 },       // 7 (Head)
    ],
    lines: [
      [0, 2], [2, 7], [7, 0], // shoulders & head
      [2, 6], [0, 4],         // shoulders to belt
      [6, 5], [5, 4],         // belt
      [6, 1], [4, 3],         // belt to feet
    ],
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major',
    latinName: 'Great Bear (Big Dipper)',
    season: 'Spring',
    stars: [
      { name: 'Dubhe', raHours: 11.06, decDeg: 61.75, mag: 1.8 },   // 0
      { name: 'Merak', raHours: 11.03, decDeg: 56.38, mag: 2.37 },  // 1
      { name: 'Phecda', raHours: 11.9, decDeg: 53.69, mag: 2.44 },  // 2
      { name: 'Megrez', raHours: 12.25, decDeg: 57.03, mag: 3.31 }, // 3
      { name: 'Alioth', raHours: 12.9, decDeg: 55.96, mag: 1.77 },  // 4
      { name: 'Mizar', raHours: 13.4, decDeg: 54.92, mag: 2.23 },   // 5
      { name: 'Alkaid', raHours: 13.79, decDeg: 49.31, mag: 1.86 }, // 6
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 0], // bowl
      [3, 4], [4, 5], [5, 6],         // handle
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    latinName: 'The Queen',
    season: 'Autumn',
    stars: [
      { name: 'Schedar', raHours: 0.68, decDeg: 56.54, mag: 2.24 },   // 0
      { name: 'Caph', raHours: 0.15, decDeg: 59.15, mag: 2.28 },      // 1
      { name: 'Navi', raHours: 0.94, decDeg: 60.72, mag: 2.15 },      // 2
      { name: 'Ruchbah', raHours: 1.43, decDeg: 60.23, mag: 2.68 },   // 3
      { name: 'Segin', raHours: 1.9, decDeg: 63.67, mag: 3.35 },      // 4
    ],
    lines: [
      [1, 0], [0, 2], [2, 3], [3, 4], // the famous 'W' shape
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    latinName: 'The Scorpion',
    season: 'Summer',
    stars: [
      { name: 'Antares', raHours: 16.49, decDeg: -26.43, mag: 1.06 }, // 0 (Red Supergiant)
      { name: 'Graffias', raHours: 16.09, decDeg: -19.8, mag: 2.56 }, // 1
      { name: 'Dschubba', raHours: 16.01, decDeg: -22.62, mag: 2.29 },// 2
      { name: 'Fang', raHours: 15.98, decDeg: -26.11, mag: 2.89 },    // 3
      { name: 'Sargas', raHours: 17.62, decDeg: -43.0, mag: 1.86 },   // 4
      { name: 'Shaula', raHours: 17.56, decDeg: -37.1, mag: 1.62 },   // 5 (Stinger)
    ],
    lines: [
      [1, 2], [2, 3], [2, 0], [0, 4], [4, 5],
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    latinName: 'Northern Cross / The Swan',
    season: 'Summer',
    stars: [
      { name: 'Deneb', raHours: 20.69, decDeg: 45.28, mag: 1.25 },   // 0 (Tail)
      { name: 'Albireo', raHours: 19.51, decDeg: 27.96, mag: 3.05 }, // 1 (Beak / Binary)
      { name: 'Sadr', raHours: 20.37, decDeg: 40.26, mag: 2.23 },    // 2 (Chest)
      { name: 'Gienah', raHours: 20.77, decDeg: 33.97, mag: 2.48 },  // 3 (Wing 1)
      { name: 'Rukh', raHours: 19.61, decDeg: 45.13, mag: 2.86 },    // 4 (Wing 2)
    ],
    lines: [
      [0, 2], [2, 1], // backbone
      [4, 2], [2, 3], // wings
    ],
  },
  {
    id: 'crux',
    name: 'Crux',
    latinName: 'The Southern Cross',
    season: 'Spring / Southern Hemisphere',
    stars: [
      { name: 'Acrux', raHours: 12.44, decDeg: -63.1, mag: 0.77 },   // 0
      { name: 'Gacrux', raHours: 12.52, decDeg: -57.11, mag: 1.64 }, // 1
      { name: 'Mimosa', raHours: 12.79, decDeg: -59.69, mag: 1.25 }, // 2
      { name: 'Imai', raHours: 12.25, decDeg: -58.75, mag: 2.79 },   // 3
    ],
    lines: [
      [0, 1], // vertical beam
      [3, 2], // horizontal beam
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    latinName: 'The Lion',
    season: 'Spring',
    stars: [
      { name: 'Regulus', raHours: 10.14, decDeg: 11.97, mag: 1.36 },  // 0
      { name: 'Denebola', raHours: 11.82, decDeg: 14.57, mag: 2.14 }, // 1
      { name: 'Algieba', raHours: 10.33, decDeg: 19.84, mag: 2.01 },  // 2
      { name: 'Zosma', raHours: 11.24, decDeg: 20.52, mag: 2.56 },    // 3
      { name: 'Ras Elased', raHours: 9.76, decDeg: 23.77, mag: 2.97 },// 4
    ],
    lines: [
      [0, 2], [2, 4], [2, 3], [3, 1], [1, 0],
    ],
  },
];
