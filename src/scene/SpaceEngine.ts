import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import {
  CelestialBody,
  CockpitTelemetry,
  SimulationMode,
  SandboxBodyConfig,
  SandboxBodyState,
} from '../types/cosmos';
import { SOLAR_SYSTEM_BODIES, TRAPPIST_SYSTEM_BODIES, ALPHA_CENTAURI_BODIES } from '../data/celestialBodies';
import { CONSTELLATIONS, raDecToCartesian } from '../data/constellations';
import { SANDBOX_PRESETS } from '../data/sandboxPresets';
import { TextureFactory } from './TextureFactory';
import { cosmicAudio } from '../audio/CosmicAudio';

export interface SpaceEngineCallbacks {
  onSelectBody: (body: CelestialBody | null) => void;
  onUpdateCockpitTelemetry: (telemetry: CockpitTelemetry) => void;
  onShapeChange?: (name: string) => void;
  onSandboxBodiesChange?: (bodies: SandboxBodyState[]) => void;
  onHoverSandboxBody?: (body: SandboxBodyState | null) => void;
  onSelectSandboxBody?: (body: SandboxBodyState | null) => void;
}

export interface SandboxBodyInstance {
  id: string;
  name: string;
  type: 'star' | 'blackhole' | 'gas_giant' | 'planet' | 'moon';
  mass: number;
  radius: number;
  color: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  acc: THREE.Vector3;
  mesh: THREE.Mesh;
  haloMesh?: THREE.Mesh;
  arrow: THREE.ArrowHelper;
  trailLine: THREE.Line;
  trailPositions: THREE.Vector3[];
  hillSphereGroup: THREE.Group;
  hillSphereMesh: THREE.Mesh;
  hillSphereRadius: number;
}

export class SpaceEngine {
  private container: HTMLElement;
  private callbacks: SpaceEngineCallbacks;

  // Core Three.js components
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  public composer: EffectComposer;

  // Animation & Clock
  private clock: THREE.Clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  private simTime: number = 0;
  private timeScale: number = 1.0;
  private timeDirection: number = 1;

  // Active state
  private currentMode: SimulationMode = 'solar';
  private selectedBody: CelestialBody | null = null;
  private focusDistance: number = 18;
  private focusTimer: number = 0;

  // Starfield & Constellations
  private starfieldGroup: THREE.Group = new THREE.Group();
  private constellationGroup: THREE.Group = new THREE.Group();
  private celestialGridGroup: THREE.Group = new THREE.Group();

  // Mode Groups
  private solarGroup: THREE.Group = new THREE.Group();
  private exoplanetGroup: THREE.Group = new THREE.Group();
  private blackholeGroup: THREE.Group = new THREE.Group();
  private supernovaGroup: THREE.Group = new THREE.Group();
  private galaxyPoints!: THREE.Points;
  private galaxyBokehPoints!: THREE.Points;

  // Celestial Meshes tracking
  private solarMeshes: Map<
    string,
    {
      mesh: THREE.Object3D;
      data: CelestialBody;
      orbitR: number;
      speed: number;
      angle: number;
      moons?: { mesh: THREE.Mesh; orbitDist: number; speed: number; angle: number }[];
    }
  > = new Map();
  private exoplanetMeshes: Map<
    string,
    { mesh: THREE.Object3D; data: CelestialBody; orbitR: number; speed: number; angle: number }
  > = new Map();
  private orbitTrailsGroup: THREE.Group = new THREE.Group();

  // Galaxy Morphing State (40,000 particles)
  private GALAXY_COUNT = 40000;
  private galaxyGeometry!: THREE.BufferGeometry;
  private galaxyLivePositions!: Float32Array;
  private galaxyLiveColors!: Float32Array;
  private galaxyShapes: {
    name: string;
    data: { positions: Float32Array; colors: Float32Array; tVals: Float32Array };
  }[] = [];
  private galCurrent: number = 0;
  private galNext: number = 1;
  private galMorphing: boolean = false;
  private galMorphT: number = 0;
  private galHoldTimer: number = 3.5;
  public colorCore: THREE.Color = new THREE.Color(0xffffff);
  public colorMid: THREE.Color = new THREE.Color(0x6ee7ff);
  public colorEdge: THREE.Color = new THREE.Color(0x1450a8);

  // Black Hole & Accretion Disk State (16,000 particles)
  private DISK_COUNT = 16000;
  private diskGeometry!: THREE.BufferGeometry;
  private diskRadius!: Float32Array;
  private diskAngle0!: Float32Array;
  private diskSpeed!: Float32Array;
  private diskHeight!: Float32Array;
  private diskPositions!: Float32Array;
  private diskPoints!: THREE.Points;
  private pulsarBeams!: THREE.Group;

  // Supernova State
  private supernovaBlastGroup: THREE.Group = new THREE.Group();
  private supernovaActive: boolean = false;
  private supernovaProgress: number = 0;
  private supernovaParticles!: THREE.Points;
  private supernovaShockwaveMesh!: THREE.Mesh;
  private supernovaRemnantMesh!: THREE.Mesh;

  // Cockpit Flight Rig
  private cockpitRig: THREE.Group = new THREE.Group();
  private shipPosition: THREE.Vector3 = new THREE.Vector3(0, 2, 12);
  private shipVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private shipRotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private shipThrottle: number = 0;
  private shipWarp: boolean = false;
  private keyState: { [key: string]: boolean } = {};
  private activeTargetBody: CelestialBody | null = null;

  // Orbital Sandbox State
  private sandboxGroup: THREE.Group = new THREE.Group();
  private sandboxGridMesh!: THREE.GridHelper;
  private sandboxPlacementPlane!: THREE.Mesh;
  private sandboxBodies: SandboxBodyInstance[] = [];
  public sandboxG: number = 1.0;
  public showGravityVectors: boolean = true;
  public showSandboxTrails: boolean = true;
  public showSandboxGrid: boolean = true;
  public showAllHillSpheres: boolean = false;
  public isInteractivePlacementMode: boolean = false;
  public activePresetId: string = 'figure8';
  public hoveredSandboxBodyId: string | null = null;
  public selectedSandboxBodyId: string | null = null;

  public pendingSpawnConfig: SandboxBodyConfig = {
    name: 'Custom Planet',
    type: 'planet',
    mass: 15,
    radius: 0.4,
    color: '#06b6d4',
  };

  // Launch Aim Gizmo
  private isAimingLaunch: boolean = false;
  private aimOrigin: THREE.Vector3 = new THREE.Vector3();
  private aimVelocity: THREE.Vector3 = new THREE.Vector3();
  private aimArrowHelper!: THREE.ArrowHelper;
  private aimGhostMesh!: THREE.Mesh;

  // Shared Sprites
  private glowSprite: THREE.CanvasTexture;
  private dotSprite: THREE.CanvasTexture;

  constructor(container: HTMLElement, callbacks: SpaceEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Renderer Setup with preserveDrawingBuffer for crystal-clear snapshots
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.set(0, 4.5, 16);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x010206);
    this.container.appendChild(this.renderer.domElement);

    // 2. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 220;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.35;

    // 3. Post-processing Bloom
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.65,
      0.4,
      0.3
    );
    this.composer.addPass(bloomPass);
    this.composer.addPass(new OutputPass());

    // 4. Sprites
    this.glowSprite = TextureFactory.makeGlowSprite();
    this.dotSprite = TextureFactory.makeDotSprite();

    // 5. Lighting
    this.setupLighting();

    // 6. Build Systems
    this.buildStarfield();
    this.buildConstellations();
    this.buildGalaxyShapes();
    this.buildBlackHole();
    this.buildSolarSystem();
    this.buildExoplanetSystems();
    this.buildSupernova();
    this.buildCockpitRig();
    this.buildSandbox();

    // 7. Event Listeners
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);

    // Start in Solar mode
    this.setMode('solar');

    // Run animation loop
    this.animate();
  }

  /* ==================================================================
     LIGHTING
  ================================================================== */
  private setupLighting() {
    const ambient = new THREE.AmbientLight(0x223355, 1.2);
    this.scene.add(ambient);

    const sunLight = new THREE.PointLight(0xfff5db, 3.5, 90, 1.2);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);
  }

  /* ==================================================================
     STARFIELD & CONSTELLATIONS
  ================================================================== */
  private buildStarfield() {
    this.starfieldGroup = new THREE.Group();

    // Layer 1: Dense Pinprick Stars (9,000)
    const dimCount = 9000;
    const dimPos = new Float32Array(dimCount * 3);
    for (let i = 0; i < dimCount; i++) {
      const r = 60 + Math.random() * 220;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dimPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dimPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      dimPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const dimGeo = new THREE.BufferGeometry();
    dimGeo.setAttribute('position', new THREE.BufferAttribute(dimPos, 3));
    const dimMat = new THREE.PointsMaterial({
      size: 0.032,
      map: this.glowSprite,
      transparent: true,
      depthWrite: false,
      color: 0xbae6fd,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.starfieldGroup.add(new THREE.Points(dimGeo, dimMat));

    // Layer 2: Bright Beacon Stars (600)
    const brightCount = 600;
    const brightPos = new Float32Array(brightCount * 3);
    for (let i = 0; i < brightCount; i++) {
      const r = 50 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      brightPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      brightPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      brightPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const brightGeo = new THREE.BufferGeometry();
    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPos, 3));
    const brightMat = new THREE.PointsMaterial({
      size: 0.11,
      map: this.glowSprite,
      transparent: true,
      depthWrite: false,
      color: 0xffffff,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.starfieldGroup.add(new THREE.Points(brightGeo, brightMat));

    // Layer 3: Soft Bokeh Halo Orbs (45)
    const bokehCount = 45;
    const bokehPos = new Float32Array(bokehCount * 3);
    for (let i = 0; i < bokehCount; i++) {
      const r = 12 + Math.random() * 32;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      bokehPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bokehPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      bokehPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const bokehGeo = new THREE.BufferGeometry();
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    const bokehMat = new THREE.PointsMaterial({
      size: 0.7,
      map: this.glowSprite,
      transparent: true,
      depthWrite: false,
      color: 0x7dd3fc,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.starfieldGroup.add(new THREE.Points(bokehGeo, bokehMat));

    this.scene.add(this.starfieldGroup);
  }

  private buildConstellations() {
    this.constellationGroup = new THREE.Group();
    const R = 75;

    CONSTELLATIONS.forEach((c) => {
      const starPositions: THREE.Vector3[] = c.stars.map((s) => {
        const [x, y, z] = raDecToCartesian(s.raHours, s.decDeg, R);
        return new THREE.Vector3(x, y, z);
      });

      c.lines.forEach(([i1, i2]) => {
        if (starPositions[i1] && starPositions[i2]) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([starPositions[i1], starPositions[i2]]);
          const lineMat = new THREE.LineBasicMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.45,
          });
          this.constellationGroup.add(new THREE.Line(lineGeo, lineMat));
        }
      });

      const ptsGeo = new THREE.BufferGeometry().setFromPoints(starPositions);
      const ptsMat = new THREE.PointsMaterial({
        size: 0.16,
        color: 0x38bdf8,
        map: this.glowSprite,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      this.constellationGroup.add(new THREE.Points(ptsGeo, ptsMat));
    });

    this.celestialGridGroup = new THREE.Group();
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.3 });
    [-60, -30, 0, 30, 60].forEach((dec) => {
      const radius = R * Math.cos((dec * Math.PI) / 180);
      const y = R * Math.sin((dec * Math.PI) / 180);
      const circleCurve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      const pts = circleCurve.getPoints(64).map((p) => new THREE.Vector3(p.x, y, p.y));
      const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), gridMat);
      this.celestialGridGroup.add(line);
    });

    this.constellationGroup.add(this.celestialGridGroup);
    this.constellationGroup.visible = false;
    this.scene.add(this.constellationGroup);
  }

  /* ==================================================================
     GALAXY MODE
  ================================================================== */
  private lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
    return a.clone().lerp(b, t);
  }

  private colorForT(t: number): THREE.Color {
    return t < 0.5
      ? this.lerpColor(this.colorCore, this.colorMid, t * 2)
      : this.lerpColor(this.colorMid, this.colorEdge, (t - 0.5) * 2);
  }

  private buildGalaxyShapes() {
    const n = this.GALAXY_COUNT;

    const buildSpiral = () => {
      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const tVals = new Float32Array(n);
      const branches = 4;
      const radius = 5.6;
      const spin = 1.6;
      const randomness = 0.32;
      const randomnessPower = 2.6;

      for (let i = 0; i < n; i++) {
        const r = Math.pow(Math.random(), 0.7) * radius;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2;
        const spinAngle = r * spin;
        const rand = () => Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const rx = rand() * randomness * r;
        const ry = rand() * randomness * r * 0.25;
        const rz = rand() * randomness * r;
        const angle = branchAngle + spinAngle;

        positions[i * 3] = Math.cos(angle) * r + rx;
        positions[i * 3 + 1] = ry;
        positions[i * 3 + 2] = Math.sin(angle) * r + rz;

        const t = r / radius;
        tVals[i] = t;
        const col = this.colorForT(t);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      return { positions, colors, tVals };
    };

    const buildCollapsingStar = () => {
      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const tVals = new Float32Array(n);
      const jetCount = Math.floor(n * 0.35);
      const sphereCount = n - jetCount;

      for (let i = 0; i < n; i++) {
        let x, y, z, t;
        if (i < sphereCount) {
          const rad = 0.65 + Math.random() * 0.75;
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          x = rad * Math.sin(phi) * Math.cos(theta);
          y = rad * Math.sin(phi) * Math.sin(theta) * 0.4;
          z = rad * Math.cos(phi);
          t = rad / 1.4;
        } else {
          const side = i % 2 === 0 ? 1 : -1;
          const along = Math.pow(Math.random(), 1.8) * 4.8;
          const spread = (0.04 + along * 0.05) * (Math.random() - 0.5) * 2;
          const spread2 = (0.04 + along * 0.05) * (Math.random() - 0.5) * 2;
          x = spread;
          y = side * (0.6 + along);
          z = spread2;
          t = Math.min(along / 4.8, 1);
        }
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        tVals[i] = t;
        const col = this.colorForT(t);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      return { positions, colors, tVals };
    };

    const buildTorusKnot = () => {
      const positions = new Float32Array(n * 3);
      const colors = new Float32Array(n * 3);
      const tVals = new Float32Array(n);
      const p = 2, q = 3, R = 3.5, r = 1.1, tube = 0.24;

      for (let i = 0; i < n; i++) {
        const u = Math.random() * Math.PI * 2;
        const cx = (R + r * Math.cos(q * u)) * Math.cos(p * u);
        const cy = (R + r * Math.cos(q * u)) * Math.sin(p * u);
        const cz = r * Math.sin(q * u);
        const ox = (Math.random() - 0.5) * tube;
        const oy = (Math.random() - 0.5) * tube;
        const oz = (Math.random() - 0.5) * tube;
        positions[i * 3] = cx + ox;
        positions[i * 3 + 1] = cz + oy;
        positions[i * 3 + 2] = cy + oz;
        const t = Math.sin(q * u) * 0.5 + 0.5;
        tVals[i] = t;
        const col = this.colorForT(t);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      return { positions, colors, tVals };
    };

    this.galaxyShapes = [
      { name: 'Spiral Galaxy', data: buildSpiral() },
      { name: 'Collapsing Star & Jets', data: buildCollapsingStar() },
      { name: 'Torus Knot Manifold', data: buildTorusKnot() },
    ];

    this.galaxyGeometry = new THREE.BufferGeometry();
    this.galaxyLivePositions = new Float32Array(this.galaxyShapes[0].data.positions);
    this.galaxyLiveColors = new Float32Array(this.galaxyShapes[0].data.colors);
    this.galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(this.galaxyLivePositions, 3));
    this.galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(this.galaxyLiveColors, 3));

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.024,
      map: this.dotSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.galaxyPoints = new THREE.Points(this.galaxyGeometry, galaxyMaterial);
    this.scene.add(this.galaxyPoints);

    const count = 220;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 34;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const bMat = new THREE.PointsMaterial({
      size: 1.6,
      map: this.glowSprite,
      transparent: true,
      depthWrite: false,
      color: 0x9fe0ff,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.galaxyBokehPoints = new THREE.Points(bGeo, bMat);
    this.scene.add(this.galaxyBokehPoints);
  }

  public setGalaxyColors(coreHex: string, midHex: string, edgeHex: string) {
    this.colorCore = new THREE.Color(coreHex);
    this.colorMid = new THREE.Color(midHex);
    this.colorEdge = new THREE.Color(edgeHex);

    for (const shape of this.galaxyShapes) {
      const { colors, tVals } = shape.data;
      for (let i = 0; i < this.GALAXY_COUNT; i++) {
        const col = this.colorForT(tVals[i]);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
    }
    this.galaxyLiveColors.set(this.galaxyShapes[this.galCurrent].data.colors);
    this.galaxyGeometry.attributes.color.needsUpdate = true;
  }

  /* ==================================================================
     BLACK HOLE & PULSAR MODE
  ================================================================== */
  private buildBlackHole() {
    this.blackholeGroup = new THREE.Group();

    const horizon = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    this.blackholeGroup.add(horizon);

    const lensRingGeo = new THREE.RingGeometry(0.33, 0.52, 64);
    const lensRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const lensRing = new THREE.Mesh(lensRingGeo, lensRingMat);
    this.blackholeGroup.add(lensRing);

    const n = this.DISK_COUNT;
    this.diskRadius = new Float32Array(n);
    this.diskAngle0 = new Float32Array(n);
    this.diskSpeed = new Float32Array(n);
    this.diskHeight = new Float32Array(n);
    this.diskPositions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);

    const diskInner = new THREE.Color(0xffffff);
    const diskMid = new THREE.Color(0xf97316);
    const diskOuter = new THREE.Color(0x991b1b);

    const coreCount = Math.floor(n * 0.45);
    const armBranches = 2;
    const armSpin = 2.4;

    for (let i = 0; i < n; i++) {
      let r, angle0, height, t;
      if (i < coreCount) {
        r = 0.38 + Math.pow(Math.random(), 1.5) * 1.8;
        angle0 = Math.random() * Math.PI * 2;
        height = (Math.random() - 0.5) * 0.08;
        t = r / 2.18;
      } else {
        r = 1.6 + Math.pow(Math.random(), 0.75) * 7.8;
        const branchAngle = ((i % armBranches) / armBranches) * Math.PI * 2;
        const spinAngle = r * armSpin * 0.18;
        const scatter = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.55;
        angle0 = branchAngle + spinAngle + scatter;
        height = (Math.random() - 0.5) * (0.04 + r * 0.05);
        t = Math.min((r - 1.6) / 7.8, 1);
      }
      this.diskRadius[i] = r;
      this.diskAngle0[i] = angle0;
      this.diskSpeed[i] = 1.45 / Math.sqrt(r);
      this.diskHeight[i] = height;

      const col = t < 0.5 ? diskInner.clone().lerp(diskMid, t * 2) : diskMid.clone().lerp(diskOuter, (t - 0.5) * 2);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    this.diskGeometry = new THREE.BufferGeometry();
    this.diskGeometry.setAttribute('position', new THREE.BufferAttribute(this.diskPositions, 3));
    this.diskGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const diskMaterial = new THREE.PointsMaterial({
      size: 0.048,
      map: this.glowSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.diskPoints = new THREE.Points(this.diskGeometry, diskMaterial);
    this.diskPoints.rotation.x = Math.PI / 2.5;
    this.blackholeGroup.add(this.diskPoints);

    this.pulsarBeams = new THREE.Group();
    const jetGeo = new THREE.CylinderGeometry(0.04, 0.8, 8, 32, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const jetNorth = new THREE.Mesh(jetGeo, jetMat);
    jetNorth.position.y = 4.2;
    const jetSouth = new THREE.Mesh(jetGeo, jetMat);
    jetSouth.position.y = -4.2;
    jetSouth.rotation.x = Math.PI;
    this.pulsarBeams.add(jetNorth, jetSouth);
    this.blackholeGroup.add(this.pulsarBeams);

    this.scene.add(this.blackholeGroup);
  }

  /* ==================================================================
     SOLAR SYSTEM MODE
  ================================================================== */
  private buildSolarSystem() {
    this.solarGroup = new THREE.Group();
    this.orbitTrailsGroup = new THREE.Group();

    const sunTex = TextureFactory.makeStellarTexture('#f59e0b', '#fef08a');
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 48, 48),
      new THREE.MeshBasicMaterial({ map: sunTex })
    );
    this.solarGroup.add(sunMesh);
    const sunData = SOLAR_SYSTEM_BODIES[0];
    this.solarMeshes.set('sun', { mesh: sunMesh, data: sunData, orbitR: 0, speed: 0, angle: 0 });

    SOLAR_SYSTEM_BODIES.slice(1).forEach((p) => {
      let tex: THREE.CanvasTexture;
      if (p.id === 'mercury') {
        tex = TextureFactory.makeTerrestrialTexture('#a0a0a0', ['#78716c', '#57534e', '#d6d3d1'], 240);
      } else if (p.id === 'venus') {
        tex = TextureFactory.makeTerrestrialTexture('#e2ba7d', ['#d4a373', '#faedcd', '#ccd5ae'], 140);
      } else if (p.id === 'earth') {
        tex = TextureFactory.makeTerrestrialTexture('#1d4ed8', [], 0, true);
      } else if (p.id === 'mars') {
        tex = TextureFactory.makeTerrestrialTexture('#c2410c', ['#9a3412', '#7c2d12', '#ea580c'], 220);
      } else if (p.id === 'jupiter') {
        tex = TextureFactory.makeBandedTexture(['#ca8a04', '#fef08a', '#eab308', '#a16207', '#ca8a04'], true, '#991b1b');
      } else if (p.id === 'saturn') {
        tex = TextureFactory.makeBandedTexture(['#eab308', '#fde047', '#ca8a04', '#fef08a']);
      } else if (p.id === 'uranus') {
        tex = TextureFactory.makeBandedTexture(['#67e8f9', '#a5f3fc', '#22d3ee', '#67e8f9']);
      } else if (p.id === 'neptune') {
        tex = TextureFactory.makeBandedTexture(['#1e40af', '#3b82f6', '#1d4ed8', '#2563eb'], true, '#172554');
      } else {
        tex = TextureFactory.makeTerrestrialTexture('#cbd5e1', ['#94a3b8', '#64748b', '#f1f5f9'], 160);
      }

      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.05 })
      );
      (pMesh as THREE.Object3D).userData = { bodyId: p.id };
      this.solarGroup.add(pMesh);

      if (p.rings) {
        const ringGeo = new THREE.RingGeometry(p.radius * p.rings.innerRadius, p.radius * p.rings.outerRadius, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.rings.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: p.rings.opacity,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        pMesh.add(ringMesh);
      }

      const moonObjects: { mesh: THREE.Mesh; orbitDist: number; speed: number; angle: number }[] = [];
      if (p.moons) {
        p.moons.forEach((m) => {
          const mMesh = new THREE.Mesh(
            new THREE.SphereGeometry(m.radius, 16, 16),
            new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.9 })
          );
          pMesh.add(mMesh);
          moonObjects.push({ mesh: mMesh, orbitDist: m.orbitDist, speed: m.speed, angle: Math.random() * Math.PI * 2 });
        });
      }

      const orbitCurve = new THREE.EllipseCurve(0, 0, p.orbitRadiusScene, p.orbitRadiusScene, 0, Math.PI * 2, false, 0);
      const orbitPts = orbitCurve.getPoints(128).map((pt) => new THREE.Vector3(pt.x, 0, pt.y));
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.32 })
      );
      this.orbitTrailsGroup.add(orbitLine);

      this.solarMeshes.set(p.id, {
        mesh: pMesh,
        data: p,
        orbitR: p.orbitRadiusScene,
        speed: 0.45 / Math.sqrt(p.semiMajorAxisAU || 1),
        angle: Math.random() * Math.PI * 2,
        moons: moonObjects,
      });
    });

    this.solarGroup.add(this.orbitTrailsGroup);
    this.scene.add(this.solarGroup);
  }

  /* ==================================================================
     EXOPLANETARY SYSTEMS
  ================================================================== */
  private buildExoplanetSystems() {
    this.exoplanetGroup = new THREE.Group();

    const starTex = TextureFactory.makeStellarTexture('#b91c1c', '#f87171');
    const starMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 48, 48),
      new THREE.MeshBasicMaterial({ map: starTex })
    );
    this.exoplanetGroup.add(starMesh);
    const starData = TRAPPIST_SYSTEM_BODIES[0];
    this.exoplanetMeshes.set('trappist-1', { mesh: starMesh, data: starData, orbitR: 0, speed: 0, angle: 0 });

    TRAPPIST_SYSTEM_BODIES.slice(1).forEach((p) => {
      let tex: THREE.CanvasTexture;
      if (p.habitableZone && p.id === 'trappist-1e') {
        tex = TextureFactory.makeTerrestrialTexture('#0284c7', ['#0f766e', '#0369a1', '#e0f2fe'], 80, true);
      } else if (p.habitableZone) {
        tex = TextureFactory.makeTerrestrialTexture('#1e40af', ['#60a5fa', '#93c5fd'], 120);
      } else {
        tex = TextureFactory.makeTerrestrialTexture(p.color, ['#475569', '#334155'], 180);
      }

      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.05 })
      );
      (pMesh as THREE.Object3D).userData = { bodyId: p.id };
      this.exoplanetGroup.add(pMesh);

      const orbitCurve = new THREE.EllipseCurve(0, 0, p.orbitRadiusScene, p.orbitRadiusScene, 0, Math.PI * 2, false, 0);
      const orbitPts = orbitCurve.getPoints(128).map((pt) => new THREE.Vector3(pt.x, 0, pt.y));
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(orbitPts),
        new THREE.LineBasicMaterial({
          color: p.habitableZone ? 0x10b981 : 0x0284c7,
          transparent: true,
          opacity: p.habitableZone ? 0.5 : 0.25,
        })
      );
      this.exoplanetGroup.add(orbitLine);

      this.exoplanetMeshes.set(p.id, {
        mesh: pMesh,
        data: p,
        orbitR: p.orbitRadiusScene,
        speed: 0.6 / Math.sqrt(p.orbitalPeriodDays / 5),
        angle: Math.random() * Math.PI * 2,
      });
    });

    ALPHA_CENTAURI_BODIES.forEach((b) => {
      const isStar = b.type === 'star';
      const tex = isStar
        ? TextureFactory.makeStellarTexture(b.color, b.glowColor || '#ffffff')
        : TextureFactory.makeTerrestrialTexture('#0ea5e9', ['#0369a1', '#f0f9ff'], 120, true);

      const mat = isStar
        ? new THREE.MeshBasicMaterial({ map: tex })
        : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });

      const mesh = new THREE.Mesh(new THREE.SphereGeometry(b.radius, 32, 32), mat);
      mesh.position.set(35 + b.orbitRadiusScene * 0.7, 0, 20 + b.orbitRadiusScene * 0.5);
      (mesh as THREE.Object3D).userData = { bodyId: b.id };
      this.exoplanetGroup.add(mesh);

      this.exoplanetMeshes.set(b.id, {
        mesh,
        data: b,
        orbitR: b.orbitRadiusScene,
        speed: 0.2 / Math.sqrt(b.orbitalPeriodDays || 100),
        angle: Math.random() * Math.PI * 2,
      });
    });

    this.scene.add(this.exoplanetGroup);
  }

  /* ==================================================================
     SUPERNOVA COLLAPSE & EXPANSION
  ================================================================== */
  private buildSupernova() {
    this.supernovaGroup = new THREE.Group();
    this.supernovaBlastGroup = new THREE.Group();

    const progenitorTex = TextureFactory.makeStellarTexture('#dc2626', '#fca5a5');
    this.supernovaRemnantMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 48, 48),
      new THREE.MeshBasicMaterial({ map: progenitorTex })
    );
    this.supernovaGroup.add(this.supernovaRemnantMesh);

    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.5, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.supernovaShockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    this.supernovaShockwaveMesh.rotation.x = Math.PI / 2;
    this.supernovaShockwaveMesh.visible = false;
    this.supernovaBlastGroup.add(this.supernovaShockwaveMesh);

    const count = 12000;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colPalette = [new THREE.Color(0xef4444), new THREE.Color(0xf59e0b), new THREE.Color(0x06b6d4), new THREE.Color(0xa855f7)];

    for (let i = 0; i < count; i++) {
      const r = 0.5 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const col = colPalette[Math.floor(Math.random() * colPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const blastGeo = new THREE.BufferGeometry();
    blastGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    blastGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const blastMat = new THREE.PointsMaterial({
      size: 0.06,
      map: this.glowSprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.supernovaParticles = new THREE.Points(blastGeo, blastMat);
    this.supernovaParticles.visible = false;
    this.supernovaBlastGroup.add(this.supernovaParticles);

    this.supernovaGroup.add(this.supernovaBlastGroup);
    this.scene.add(this.supernovaGroup);
  }

  public triggerSupernovaBlast() {
    this.supernovaActive = true;
    this.supernovaProgress = 0;
    this.supernovaParticles.visible = true;
    this.supernovaShockwaveMesh.visible = true;

    const pos = this.supernovaParticles.geometry.attributes.position.array as Float32Array;
    const count = pos.length / 3;
    for (let i = 0; i < count; i++) {
      const r = 0.4 + Math.random() * 0.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    this.supernovaParticles.geometry.attributes.position.needsUpdate = true;
  }

  /* ==================================================================
     COCKPIT FLIGHT RIG
  ================================================================== */
  private buildCockpitRig() {
    this.cockpitRig = new THREE.Group();

    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });

    const leftStrut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 1.2), canopyMat);
    leftStrut.position.set(-0.85, 0.1, -0.6);
    leftStrut.rotation.z = 0.35;

    const rightStrut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 1.2), canopyMat);
    rightStrut.position.set(0.85, 0.1, -0.6);
    rightStrut.rotation.z = -0.35;

    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.8), canopyMat);
    dash.position.set(0, -0.55, -0.7);

    const reticleGeo = new THREE.RingGeometry(0.02, 0.026, 32);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.set(0, 0, -1.2);

    this.cockpitRig.add(leftStrut, rightStrut, dash, reticle);
    this.cockpitRig.position.copy(this.shipPosition);
    this.cockpitRig.visible = false;
    this.scene.add(this.cockpitRig);
  }

  /* ==================================================================
     ORBITAL SANDBOX ENGINE (N-Body Gravitation, Hill Sphere & Live Vectors)
  ================================================================== */
  private buildSandbox() {
    this.sandboxGroup = new THREE.Group();

    // 1. Ecliptic Coordinate Grid
    this.sandboxGridMesh = new THREE.GridHelper(60, 60, 0x0ea5e9, 0x1e293b);
    this.sandboxGridMesh.position.y = -0.01;
    this.sandboxGroup.add(this.sandboxGridMesh);

    // 2. Invisible Placement Plane for Raycasting
    const planeGeo = new THREE.PlaneGeometry(120, 120);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    this.sandboxPlacementPlane = new THREE.Mesh(planeGeo, planeMat);
    this.sandboxPlacementPlane.rotation.x = -Math.PI / 2;
    this.sandboxGroup.add(this.sandboxPlacementPlane);

    // 3. Aim Arrow & Ghost Mesh for interactive drag-launching
    const arrowDir = new THREE.Vector3(0, 0, 1);
    this.aimArrowHelper = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(), 1, 0x06b6d4, 0.4, 0.25);
    this.aimArrowHelper.visible = false;
    this.sandboxGroup.add(this.aimArrowHelper);

    const ghostGeo = new THREE.SphereGeometry(0.4, 24, 24);
    const ghostMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    this.aimGhostMesh = new THREE.Mesh(ghostGeo, ghostMat);
    this.aimGhostMesh.visible = false;
    this.sandboxGroup.add(this.aimGhostMesh);

    this.sandboxGroup.visible = false;
    this.scene.add(this.sandboxGroup);

    // Initialize with Figure-8 preset
    this.loadSandboxPreset('figure8');
  }

  public loadSandboxPreset(presetId: string) {
    this.activePresetId = presetId;
    this.clearSandboxBodies();
    const preset = SANDBOX_PRESETS.find((p) => p.id === presetId) || SANDBOX_PRESETS[0];
    this.sandboxG = preset.gConstant;

    preset.bodies.forEach((b) => {
      this.spawnSandboxBody(
        {
          name: b.name,
          type: b.type,
          mass: b.mass,
          radius: b.radius,
          color: b.color,
        },
        b.position,
        b.velocity
      );
    });
  }

  // Restore initial default configuration of the current or base preset
  public resetSandboxToDefault() {
    this.hoveredSandboxBodyId = null;
    this.selectedSandboxBodyId = null;
    this.loadSandboxPreset(this.activePresetId || 'figure8');
    this.requestFocus(28);
    this.controls.target.set(0, 0, 0);
    cosmicAudio.playTargetLockSound();
  }

  public spawnSandboxBody(
    config: SandboxBodyConfig,
    position: [number, number, number],
    velocity: [number, number, number]
  ): SandboxBodyInstance {
    const isStar = config.type === 'star';
    const isBlackHole = config.type === 'blackhole';

    let meshMat: THREE.Material;
    if (isStar) {
      meshMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(config.color),
      });
    } else if (isBlackHole) {
      meshMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    } else {
      meshMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.color),
        roughness: 0.7,
        metalness: 0.1,
      });
    }

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(config.radius, 32, 32), meshMat);
    mesh.position.set(...position);

    // Corona / Lensing Halo
    let haloMesh: THREE.Mesh | undefined;
    if (isStar || isBlackHole) {
      const haloGeo = new THREE.SphereGeometry(config.radius * 1.4, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: isBlackHole ? 0x38bdf8 : new THREE.Color(config.color),
        transparent: true,
        opacity: isBlackHole ? 0.35 : 0.25,
        blending: THREE.AdditiveBlending,
      });
      haloMesh = new THREE.Mesh(haloGeo, haloMat);
      mesh.add(haloMesh);
    }

    this.sandboxGroup.add(mesh);

    // Live Acceleration / Force Vector Arrow
    const arrowDir = new THREE.Vector3(0, 1, 0);
    const arrow = new THREE.ArrowHelper(
      arrowDir,
      mesh.position,
      1.5,
      isStar ? 0xf59e0b : 0x06b6d4,
      0.35,
      0.2
    );
    arrow.visible = this.showGravityVectors;
    this.sandboxGroup.add(arrow);

    // Live Orbital Trail Line
    const trailPositions = [mesh.position.clone()];
    const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPositions);
    const trailMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(config.color),
      transparent: true,
      opacity: 0.55,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    trailLine.visible = this.showSandboxTrails;
    this.sandboxGroup.add(trailLine);

    // Visual Indicator: Hill Sphere (Gravitational Zone of Influence)
    const hillSphereGroup = new THREE.Group();
    const hsSphereGeo = new THREE.SphereGeometry(1, 32, 24);
    const hsSphereMat = new THREE.MeshBasicMaterial({
      color: isStar ? 0xf59e0b : isBlackHole ? 0xa855f7 : 0x06b6d4,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const hillSphereMesh = new THREE.Mesh(hsSphereGeo, hsSphereMat);
    hillSphereGroup.add(hillSphereMesh);

    // Equatorial Ring
    const hsRingGeo = new THREE.RingGeometry(0.985, 1.015, 64);
    const hsRingMat = new THREE.MeshBasicMaterial({
      color: isStar ? 0xfbbf24 : isBlackHole ? 0xc084fc : 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const hsRing = new THREE.Mesh(hsRingGeo, hsRingMat);
    hsRing.rotation.x = Math.PI / 2;
    hillSphereGroup.add(hsRing);

    // Meridian Ring
    const hsMeridian = new THREE.Mesh(hsRingGeo, hsRingMat);
    hsMeridian.rotation.y = Math.PI / 2;
    hillSphereGroup.add(hsMeridian);

    hillSphereGroup.visible = false;
    this.sandboxGroup.add(hillSphereGroup);

    const instance: SandboxBodyInstance = {
      id: `sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: config.name,
      type: config.type,
      mass: config.mass,
      radius: config.radius,
      color: config.color,
      pos: new THREE.Vector3(...position),
      vel: new THREE.Vector3(...velocity),
      acc: new THREE.Vector3(0, 0, 0),
      mesh,
      haloMesh,
      arrow,
      trailLine,
      trailPositions,
      hillSphereGroup,
      hillSphereMesh,
      hillSphereRadius: config.radius * 3.5,
    };

    mesh.userData = { sandboxBodyId: instance.id };

    this.sandboxBodies.push(instance);
    this.dispatchSandboxBodiesState();
    return instance;
  }

  public clearSandboxBodies() {
    this.sandboxBodies.forEach((b) => {
      this.sandboxGroup.remove(b.mesh);
      this.sandboxGroup.remove(b.arrow);
      this.sandboxGroup.remove(b.trailLine);
      this.sandboxGroup.remove(b.hillSphereGroup);
      b.mesh.geometry.dispose();
      b.trailLine.geometry.dispose();
    });
    this.sandboxBodies = [];
    this.hoveredSandboxBodyId = null;
    this.selectedSandboxBodyId = null;
    this.dispatchSandboxBodiesState();
  }

  public setSandboxG(g: number) {
    this.sandboxG = g;
  }

  public toggleSandboxVectors(show: boolean) {
    this.showGravityVectors = show;
    this.sandboxBodies.forEach((b) => {
      b.arrow.visible = show;
    });
  }

  public toggleSandboxTrails(show: boolean) {
    this.showSandboxTrails = show;
    this.sandboxBodies.forEach((b) => {
      b.trailLine.visible = show;
    });
  }

  public toggleSandboxGrid(show: boolean) {
    this.showSandboxGrid = show;
    this.sandboxGridMesh.visible = show;
  }

  public toggleAllHillSpheres(show: boolean) {
    this.showAllHillSpheres = show;
    this.sandboxBodies.forEach((b) => {
      b.hillSphereGroup.visible =
        show || b.id === this.hoveredSandboxBodyId || b.id === this.selectedSandboxBodyId;
    });
  }

  public selectSandboxBodyById(id: string | null) {
    this.selectedSandboxBodyId = id;
    const body = this.sandboxBodies.find((b) => b.id === id);
    if (body) {
      this.requestFocus(Math.max(body.radius * 6, body.hillSphereRadius * 1.5, 4.0));
    }
    this.dispatchSandboxBodiesState();
  }

  // Calculate dynamic Hill sphere radius of gravitational dominance
  private calculateHillRadius(body: SandboxBodyInstance): number {
    if (this.sandboxBodies.length <= 1) {
      return Math.max(body.radius * 3.5, Math.cbrt(body.mass) * 1.5);
    }

    let minTidalDist = Infinity;
    let dominantNeighbor: SandboxBodyInstance | null = null;

    for (const other of this.sandboxBodies) {
      if (other.id === body.id) continue;
      const d = body.pos.distanceTo(other.pos);
      if (d < 0.001) continue;

      const tidalFactor = other.mass / Math.pow(d, 3);
      if (
        !dominantNeighbor ||
        tidalFactor > dominantNeighbor.mass / Math.pow(minTidalDist, 3)
      ) {
        dominantNeighbor = other;
        minTidalDist = d;
      }
    }

    if (!dominantNeighbor) {
      return Math.max(body.radius * 3.5, Math.cbrt(body.mass) * 1.5);
    }

    const d = minTidalDist;
    let rH: number;
    if (body.mass < dominantNeighbor.mass) {
      rH = d * Math.cbrt(body.mass / (3 * (dominantNeighbor.mass + body.mass)));
    } else {
      rH = d * (1 - Math.cbrt(dominantNeighbor.mass / (3 * (body.mass + dominantNeighbor.mass))));
    }

    const minBound = body.radius * 2.2;
    const maxBound = d * 0.92;
    return Math.max(minBound, Math.min(maxBound, rH));
  }

  private dispatchSandboxBodiesState() {
    if (this.callbacks.onSandboxBodiesChange) {
      const states: SandboxBodyState[] = this.sandboxBodies.map((b) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        mass: b.mass,
        radius: b.radius,
        color: b.color,
        position: [b.pos.x, b.pos.y, b.pos.z],
        velocity: [b.vel.x, b.vel.y, b.vel.z],
        acceleration: [b.acc.x, b.acc.y, b.acc.z],
        speed: b.vel.length(),
        hillSphereRadius: b.hillSphereRadius,
        isHovered: b.id === this.hoveredSandboxBodyId,
        isSelected: b.id === this.selectedSandboxBodyId,
      }));
      this.callbacks.onSandboxBodiesChange(states);
    }
  }

  /* Real-time N-Body Gravitational Physics Integration */
  private updateSandbox(dt: number) {
    const simDt = dt * this.timeScale * this.timeDirection;
    if (simDt === 0) return;

    const N = this.sandboxBodies.length;
    const softening = 0.35;
    const G = this.sandboxG;

    // 1. Calculate Pairwise Gravitational Acceleration Vectors
    for (let i = 0; i < N; i++) {
      const b1 = this.sandboxBodies[i];
      b1.acc.set(0, 0, 0);

      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const b2 = this.sandboxBodies[j];

        const r = new THREE.Vector3().subVectors(b2.pos, b1.pos);
        const distSq = r.lengthSq() + softening * softening;
        const dist = Math.sqrt(distSq);

        const forceMag = (G * b2.mass) / distSq;
        const aDir = r.clone().normalize();
        b1.acc.addScaledVector(aDir, forceMag);
      }
    }

    // 2. Coalescing Inelastic Collisions
    const bodiesToRemove: number[] = [];

    for (let i = 0; i < N; i++) {
      const b1 = this.sandboxBodies[i];
      if (bodiesToRemove.includes(i)) continue;

      for (let j = i + 1; j < N; j++) {
        if (bodiesToRemove.includes(j)) continue;
        const b2 = this.sandboxBodies[j];

        const dist = b1.pos.distanceTo(b2.pos);
        const collisionThreshold = (b1.radius + b2.radius) * 0.75;

        if (dist < collisionThreshold) {
          const [primary, secondary, primaryIdx, secondaryIdx] =
            b1.mass >= b2.mass ? [b1, b2, i, j] : [b2, b1, j, i];

          const totalMass = primary.mass + secondary.mass;
          primary.vel
            .multiplyScalar(primary.mass)
            .addScaledVector(secondary.vel, secondary.mass)
            .divideScalar(totalMass);

          primary.mass = totalMass;
          primary.radius = Math.min(2.5, Math.cbrt(Math.pow(primary.radius, 3) + Math.pow(secondary.radius, 3)));
          primary.mesh.scale.set(primary.radius, primary.radius, primary.radius);

          bodiesToRemove.push(secondaryIdx);
          this.sandboxGroup.remove(secondary.mesh);
          this.sandboxGroup.remove(secondary.arrow);
          this.sandboxGroup.remove(secondary.trailLine);
          this.sandboxGroup.remove(secondary.hillSphereGroup);
          cosmicAudio.playTargetLockSound();
        }
      }
    }

    if (bodiesToRemove.length > 0) {
      bodiesToRemove.sort((a, b) => b - a);
      for (const idx of bodiesToRemove) {
        this.sandboxBodies.splice(idx, 1);
      }
      this.dispatchSandboxBodiesState();
    }

    // 3. Update Positions, Vector Gizmos, Hill Spheres, and Orbital Trajectories
    for (let i = 0; i < this.sandboxBodies.length; i++) {
      const b = this.sandboxBodies[i];

      b.vel.addScaledVector(b.acc, simDt);
      b.pos.addScaledVector(b.vel, simDt);
      b.mesh.position.copy(b.pos);
      b.mesh.rotation.y += simDt * 0.8;

      // Update Gravitational Vector Arrow
      if (this.showGravityVectors) {
        b.arrow.position.copy(b.pos);
        const aLen = b.acc.length();
        if (aLen > 0.0001) {
          b.arrow.setDirection(b.acc.clone().normalize());
          const visualLen = Math.min(5.5, Math.max(0.6, aLen * 0.8));
          b.arrow.setLength(visualLen, visualLen * 0.25, visualLen * 0.15);
          b.arrow.visible = true;
        } else {
          b.arrow.visible = false;
        }
      }

      // Update Hill Sphere (Gravitational Zone of Influence)
      b.hillSphereRadius = this.calculateHillRadius(b);
      b.hillSphereGroup.position.copy(b.pos);
      b.hillSphereGroup.scale.set(b.hillSphereRadius, b.hillSphereRadius, b.hillSphereRadius);

      const isTargeted =
        b.id === this.hoveredSandboxBodyId || b.id === this.selectedSandboxBodyId;
      const shouldShowHillSphere = this.showAllHillSpheres || isTargeted;

      b.hillSphereGroup.visible = shouldShowHillSphere;
      if (shouldShowHillSphere) {
        // Pulsate opacity slightly for tactile presence
        const pulse = 0.82 + 0.18 * Math.sin(this.simTime * 3.8);
        (b.hillSphereMesh.material as THREE.MeshBasicMaterial).opacity =
          (isTargeted ? 0.25 : 0.12) * pulse;
      }

      // Update Orbital Trajectory Trail
      if (this.showSandboxTrails) {
        b.trailPositions.push(b.pos.clone());
        if (b.trailPositions.length > 140) {
          b.trailPositions.shift();
        }
        b.trailLine.geometry.setFromPoints(b.trailPositions);
      }
    }
  }

  /* ==================================================================
     CAPTURE COSMIC MOMENT
  ================================================================== */
  public captureSnapshot(): string {
    const wasAimArrowVisible = this.aimArrowHelper?.visible;
    const wasGhostVisible = this.aimGhostMesh?.visible;
    if (this.aimArrowHelper) this.aimArrowHelper.visible = false;
    if (this.aimGhostMesh) this.aimGhostMesh.visible = false;

    this.composer.render();
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    if (this.aimArrowHelper) this.aimArrowHelper.visible = wasAimArrowVisible;
    if (this.aimGhostMesh) this.aimGhostMesh.visible = wasGhostVisible;

    return dataUrl;
  }

  /* ==================================================================
     MODE SWITCHING
  ================================================================== */
  public setMode(mode: SimulationMode) {
    this.currentMode = mode;

    this.solarGroup.visible = mode === 'solar';
    this.exoplanetGroup.visible = mode === 'exoplanet';
    this.galaxyPoints.visible = mode === 'galaxy';
    this.galaxyBokehPoints.visible = mode === 'galaxy';
    this.blackholeGroup.visible = mode === 'blackhole';
    this.supernovaGroup.visible = mode === 'supernova';
    this.cockpitRig.visible = mode === 'cockpit';
    this.sandboxGroup.visible = mode === 'sandbox';

    if (mode === 'cockpit') {
      this.controls.enabled = false;
      this.camera.position.copy(this.shipPosition);
      this.camera.rotation.copy(this.shipRotation);
      cosmicAudio.updateThrusterIntensity(this.shipThrottle, this.shipWarp);
    } else {
      this.controls.enabled = true;
      if (mode === 'solar') {
        this.selectedBody = SOLAR_SYSTEM_BODIES[0];
        this.requestFocus(24);
      } else if (mode === 'exoplanet') {
        this.selectedBody = TRAPPIST_SYSTEM_BODIES[0];
        this.requestFocus(16);
      } else if (mode === 'blackhole') {
        this.selectedBody = null;
        this.requestFocus(8.5);
        cosmicAudio.setPulsarMode(true);
      } else if (mode === 'supernova') {
        this.selectedBody = null;
        this.requestFocus(12);
        this.triggerSupernovaBlast();
      } else if (mode === 'galaxy') {
        this.selectedBody = null;
        this.requestFocus(10);
      } else if (mode === 'sandbox') {
        this.selectedBody = null;
        this.requestFocus(28);
      }
    }

    if (mode !== 'blackhole') {
      cosmicAudio.setPulsarMode(false);
    }
  }

  public setTimeScale(scale: number) {
    this.timeScale = scale;
  }

  public setTimeDirection(dir: 1 | -1) {
    this.timeDirection = dir;
  }

  public toggleOrbits(visible: boolean) {
    this.orbitTrailsGroup.visible = visible;
  }

  public toggleConstellations(visible: boolean) {
    this.constellationGroup.visible = visible;
  }

  public requestFocus(dist: number, duration: number = 1.4) {
    this.focusDistance = dist;
    this.focusTimer = duration;
  }

  public focusOnBody(body: CelestialBody) {
    this.selectedBody = body;
    this.activeTargetBody = body;
    this.callbacks.onSelectBody(body);
    cosmicAudio.playTargetLockSound();

    let meshPos = new THREE.Vector3(0, 0, 0);
    const sEntry = this.solarMeshes.get(body.id);
    const eEntry = this.exoplanetMeshes.get(body.id);
    if (sEntry) meshPos = sEntry.mesh.position;
    else if (eEntry) meshPos = eEntry.mesh.position;

    this.requestFocus(Math.max(body.radius * 6 + 1.8, 3.2));
  }

  /* ==================================================================
     USER INPUT & INTERACTIVE SANDBOX PLACEMENT
  ================================================================== */
  private onKeyDown = (e: KeyboardEvent) => {
    this.keyState[e.code] = true;

    if (this.currentMode === 'cockpit') {
      if (e.code === 'KeyW' && e.shiftKey) {
        this.shipWarp = !this.shipWarp;
        cosmicAudio.updateThrusterIntensity(1.0, this.shipWarp);
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keyState[e.code] = false;
  };

  private getPlaneIntersection(e: PointerEvent): THREE.Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    const hits = raycaster.intersectObject(this.sandboxPlacementPlane);
    return hits.length > 0 ? hits[0].point : null;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.currentMode === 'cockpit') return;

    // In Sandbox and Placement Mode: Start Aiming
    if (this.currentMode === 'sandbox' && this.isInteractivePlacementMode) {
      const pt = this.getPlaneIntersection(e);
      if (pt) {
        this.isAimingLaunch = true;
        this.controls.enabled = false;
        this.aimOrigin.copy(pt);
        this.aimGhostMesh.position.copy(pt);
        this.aimGhostMesh.visible = true;

        this.aimArrowHelper.position.copy(pt);
        this.aimArrowHelper.setDirection(new THREE.Vector3(0, 0, 1));
        this.aimArrowHelper.setLength(1.0);
        this.aimArrowHelper.visible = true;
        return;
      }
    }

    // In Sandbox Mode without placement: Raycast to select sandbox body
    if (this.currentMode === 'sandbox' && !this.isInteractivePlacementMode) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      const meshes = this.sandboxBodies.map((b) => b.mesh);
      const hits = raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj && !hitObj.userData.sandboxBodyId) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData.sandboxBodyId) {
          const bodyId = hitObj.userData.sandboxBodyId;
          this.selectedSandboxBodyId = this.selectedSandboxBodyId === bodyId ? null : bodyId;
          const targetInstance = this.sandboxBodies.find((b) => b.id === bodyId);
          if (targetInstance && this.callbacks.onSelectSandboxBody) {
            this.callbacks.onSelectSandboxBody({
              id: targetInstance.id,
              name: targetInstance.name,
              type: targetInstance.type,
              mass: targetInstance.mass,
              radius: targetInstance.radius,
              color: targetInstance.color,
              position: [targetInstance.pos.x, targetInstance.pos.y, targetInstance.pos.z],
              velocity: [targetInstance.vel.x, targetInstance.vel.y, targetInstance.vel.z],
              acceleration: [targetInstance.acc.x, targetInstance.acc.y, targetInstance.acc.z],
              speed: targetInstance.vel.length(),
              hillSphereRadius: targetInstance.hillSphereRadius,
              isSelected: this.selectedSandboxBodyId === bodyId,
            });
          }
          cosmicAudio.playTargetLockSound();
          this.dispatchSandboxBodiesState();
          return;
        }
      }
    }

    // Raycast click onto planets in solar/exoplanet modes
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const activeGroup = this.currentMode === 'solar' ? this.solarGroup : this.exoplanetGroup;
    const intersects = raycaster.intersectObjects(activeGroup.children, true);

    for (const hit of intersects) {
      const bId = hit.object.userData.bodyId;
      if (bId) {
        const found =
          SOLAR_SYSTEM_BODIES.find((b) => b.id === bId) ||
          TRAPPIST_SYSTEM_BODIES.find((b) => b.id === bId) ||
          ALPHA_CENTAURI_BODIES.find((b) => b.id === bId);
        if (found) {
          this.focusOnBody(found);
          break;
        }
      }
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.currentMode !== 'sandbox') return;

    if (this.isAimingLaunch) {
      const pt = this.getPlaneIntersection(e);
      if (pt) {
        this.aimVelocity.subVectors(this.aimOrigin, pt).multiplyScalar(0.7);
        const speed = this.aimVelocity.length();

        if (speed > 0.1) {
          this.aimArrowHelper.setDirection(this.aimVelocity.clone().normalize());
          const arrowLen = Math.min(6.0, Math.max(0.8, speed * 0.7));
          this.aimArrowHelper.setLength(arrowLen, arrowLen * 0.25, arrowLen * 0.15);
          this.aimArrowHelper.visible = true;
        }
      }
    } else if (this.isInteractivePlacementMode) {
      const pt = this.getPlaneIntersection(e);
      if (pt) {
        this.aimGhostMesh.position.copy(pt);
        this.aimGhostMesh.visible = true;
      }
    } else {
      // Hover Raycasting over sandbox bodies to trigger Hill Sphere highlight
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      const meshes = this.sandboxBodies.map((b) => b.mesh);
      const hits = raycaster.intersectObjects(meshes, true);

      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj && !hitObj.userData.sandboxBodyId) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData.sandboxBodyId) {
          const bodyId = hitObj.userData.sandboxBodyId;
          if (this.hoveredSandboxBodyId !== bodyId) {
            this.hoveredSandboxBodyId = bodyId;
            const targetInstance = this.sandboxBodies.find((b) => b.id === bodyId);
            if (targetInstance && this.callbacks.onHoverSandboxBody) {
              this.callbacks.onHoverSandboxBody({
                id: targetInstance.id,
                name: targetInstance.name,
                type: targetInstance.type,
                mass: targetInstance.mass,
                radius: targetInstance.radius,
                color: targetInstance.color,
                position: [targetInstance.pos.x, targetInstance.pos.y, targetInstance.pos.z],
                velocity: [targetInstance.vel.x, targetInstance.vel.y, targetInstance.vel.z],
                acceleration: [targetInstance.acc.x, targetInstance.acc.y, targetInstance.acc.z],
                speed: targetInstance.vel.length(),
                hillSphereRadius: targetInstance.hillSphereRadius,
                isHovered: true,
              });
            }
          }
          return;
        }
      }

      if (this.hoveredSandboxBodyId) {
        this.hoveredSandboxBodyId = null;
        if (this.callbacks.onHoverSandboxBody) {
          this.callbacks.onHoverSandboxBody(null);
        }
      }
    }
  };

  private onPointerUp = () => {
    if (this.isAimingLaunch) {
      this.isAimingLaunch = false;
      this.controls.enabled = true;
      this.aimArrowHelper.visible = false;
      this.aimGhostMesh.visible = false;

      this.spawnSandboxBody(
        { ...this.pendingSpawnConfig },
        [this.aimOrigin.x, this.aimOrigin.y, this.aimOrigin.z],
        [this.aimVelocity.x, this.aimVelocity.y, this.aimVelocity.z]
      );
      cosmicAudio.playTargetLockSound();
    }
  };

  private updateCockpitFlight(dt: number) {
    const pitchSpeed = 1.2 * dt;
    const yawSpeed = 1.2 * dt;
    const rollSpeed = 1.4 * dt;

    if (this.keyState['KeyS'] || this.keyState['ArrowDown']) this.shipRotation.x += pitchSpeed;
    if (this.keyState['KeyW'] || this.keyState['ArrowUp']) this.shipRotation.x -= pitchSpeed;

    if (this.keyState['KeyA'] || this.keyState['ArrowLeft']) this.shipRotation.y += yawSpeed;
    if (this.keyState['KeyD'] || this.keyState['ArrowRight']) this.shipRotation.y -= yawSpeed;

    if (this.keyState['KeyQ']) this.shipRotation.z += rollSpeed;
    if (this.keyState['KeyE']) this.shipRotation.z -= rollSpeed;

    const isAccelerating = this.keyState['ShiftLeft'] || this.keyState['ShiftRight'] || this.keyState['Space'];
    if (isAccelerating) {
      this.shipThrottle = Math.min(1.0, this.shipThrottle + dt * 2);
    } else {
      this.shipThrottle = Math.max(0.0, this.shipThrottle - dt * 1.5);
    }

    cosmicAudio.updateThrusterIntensity(this.shipThrottle, this.shipWarp);

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.shipRotation);
    const accel = this.shipWarp ? 45.0 : 8.0;

    if (this.shipThrottle > 0) {
      this.shipVelocity.addScaledVector(forward, this.shipThrottle * accel * dt);
    }

    this.shipVelocity.multiplyScalar(0.985);
    this.shipPosition.addScaledVector(this.shipVelocity, dt);

    this.cockpitRig.position.copy(this.shipPosition);
    this.cockpitRig.rotation.copy(this.shipRotation);
    this.camera.position.copy(this.shipPosition);
    this.camera.rotation.copy(this.shipRotation);

    let targetDistKm = 0;
    if (this.activeTargetBody) {
      const sEntry = this.solarMeshes.get(this.activeTargetBody.id) || this.exoplanetMeshes.get(this.activeTargetBody.id);
      if (sEntry) {
        const sceneDist = this.shipPosition.distanceTo(sEntry.mesh.position);
        targetDistKm = Math.round(sceneDist * 1495978);
      }
    }

    this.callbacks.onUpdateCockpitTelemetry({
      speedKms: Math.round(this.shipVelocity.length() * (this.shipWarp ? 2500 : 42)),
      throttle: this.shipThrottle,
      warpEngaged: this.shipWarp,
      targetBodyId: this.activeTargetBody ? this.activeTargetBody.id : null,
      targetDistanceKm: targetDistKm,
      gravitationalPullG: 0.08 + Math.min(2.5, 4.0 / Math.max(targetDistKm / 50000, 1)),
      headingPitch: Math.round((this.shipRotation.x * 180) / Math.PI),
      headingYaw: Math.round((this.shipRotation.y * 180) / Math.PI),
    });
  }

  /* ==================================================================
     ANIMATION LOOP
  ================================================================== */
  private updateGalaxyMorph(dt: number) {
    if (this.galMorphing) {
      this.galMorphT += dt / 2.2;
      const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      const e = easeInOutCubic(Math.min(this.galMorphT, 1));
      const from = this.galaxyShapes[this.galCurrent].data;
      const to = this.galaxyShapes[this.galNext].data;

      for (let i = 0; i < this.GALAXY_COUNT * 3; i++) {
        this.galaxyLivePositions[i] = from.positions[i] + (to.positions[i] - from.positions[i]) * e;
        this.galaxyLiveColors[i] = from.colors[i] + (to.colors[i] - from.colors[i]) * e;
      }

      this.galaxyGeometry.attributes.position.needsUpdate = true;
      this.galaxyGeometry.attributes.color.needsUpdate = true;

      if (this.galMorphT >= 1) {
        this.galMorphing = false;
        this.galCurrent = this.galNext;
        this.galHoldTimer = 3.5;
      }
    } else {
      this.galHoldTimer -= dt;
      if (this.galHoldTimer <= 0) {
        this.galMorphing = true;
        this.galMorphT = 0;
        this.galNext = (this.galCurrent + 1) % this.galaxyShapes.length;
        if (this.callbacks.onShapeChange) {
          this.callbacks.onShapeChange(this.galaxyShapes[this.galNext].name);
        }
      }
    }
    this.galaxyPoints.rotation.y += dt * 0.04;
  }

  private updateBlackHole(dt: number) {
    this.simTime += dt;
    const n = this.DISK_COUNT;

    for (let i = 0; i < n; i++) {
      const a = this.diskAngle0[i] + this.simTime * this.diskSpeed[i];
      const r = this.diskRadius[i];
      this.diskPositions[i * 3] = Math.cos(a) * r;
      this.diskPositions[i * 3 + 1] = this.diskHeight[i];
      this.diskPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    this.diskGeometry.attributes.position.needsUpdate = true;
    this.blackholeGroup.rotation.y += dt * 0.015;
    this.pulsarBeams.rotation.y += dt * 8.0;
  }

  private updateSolar(dt: number) {
    const effectiveDt = dt * this.timeScale * this.timeDirection;
    this.solarMeshes.forEach((item) => {
      if (item.orbitR > 0) {
        item.angle += effectiveDt * item.speed;
        item.mesh.position.set(Math.cos(item.angle) * item.orbitR, 0, Math.sin(item.angle) * item.orbitR);
      }
      item.mesh.rotation.y += effectiveDt * 0.6;

      if (item.moons) {
        item.moons.forEach((m) => {
          m.angle += effectiveDt * m.speed;
          m.mesh.position.set(Math.cos(m.angle) * m.orbitDist, 0, Math.sin(m.angle) * m.orbitDist);
        });
      }
    });
  }

  private updateExoplanets(dt: number) {
    const effectiveDt = dt * this.timeScale * this.timeDirection;
    this.exoplanetMeshes.forEach((item) => {
      if (item.orbitR > 0) {
        item.angle += effectiveDt * item.speed;
        item.mesh.position.set(Math.cos(item.angle) * item.orbitR, 0, Math.sin(item.angle) * item.orbitR);
      }
      item.mesh.rotation.y += effectiveDt * 0.5;
    });
  }

  private updateSupernova(dt: number) {
    if (!this.supernovaActive) return;

    this.supernovaProgress += dt * 0.45;
    const scale = 1 + this.supernovaProgress * 14.0;

    this.supernovaShockwaveMesh.scale.set(scale, scale, scale);

    const pos = this.supernovaParticles.geometry.attributes.position.array as Float32Array;
    const count = pos.length / 3;
    for (let i = 0; i < count; i++) {
      pos[i * 3] *= 1 + dt * 0.6;
      pos[i * 3 + 1] *= 1 + dt * 0.6;
      pos[i * 3 + 2] *= 1 + dt * 0.6;
    }
    this.supernovaParticles.geometry.attributes.position.needsUpdate = true;

    const remnantScale = Math.max(0.18, 1.6 - this.supernovaProgress * 1.4);
    this.supernovaRemnantMesh.scale.set(remnantScale, remnantScale, remnantScale);
    this.supernovaRemnantMesh.rotation.y += dt * 14.0;
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.currentMode === 'cockpit') {
      this.updateCockpitFlight(dt);
      this.updateSolar(dt);
      this.updateExoplanets(dt);
    } else {
      if (this.currentMode === 'galaxy') this.updateGalaxyMorph(dt);
      else if (this.currentMode === 'blackhole') this.updateBlackHole(dt);
      else if (this.currentMode === 'solar') this.updateSolar(dt);
      else if (this.currentMode === 'exoplanet') this.updateExoplanets(dt);
      else if (this.currentMode === 'supernova') this.updateSupernova(dt);
      else if (this.currentMode === 'sandbox') this.updateSandbox(dt);

      let desiredTarget = new THREE.Vector3(0, 0, 0);
      if (this.selectedBody) {
        const sEntry = this.solarMeshes.get(this.selectedBody.id) || this.exoplanetMeshes.get(this.selectedBody.id);
        if (sEntry) desiredTarget = sEntry.mesh.position;
      }

      const targetOld = this.controls.target.clone();
      this.controls.target.lerp(desiredTarget, 0.06);
      const delta = this.controls.target.clone().sub(targetOld);
      this.camera.position.add(delta);

      if (this.focusTimer > 0) {
        this.focusTimer -= dt;
        const offset = this.camera.position.clone().sub(this.controls.target);
        const dist = offset.length();
        const newDist = THREE.MathUtils.lerp(dist, this.focusDistance, 0.07);
        this.camera.position.copy(this.controls.target).add(offset.setLength(Math.max(newDist, 0.1)));
      }

      this.controls.update();
    }

    this.composer.render();
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.renderer.dispose();
  }
}
