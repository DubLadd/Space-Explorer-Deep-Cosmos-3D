import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MUSIC_PLANET_NODES } from '../data/musicPlanets';
import { MusicPlanetNode, MusicToolId } from '../types/musicCosmos';

export interface MusicCosmosEngineCallbacks {
  onSelectTool: (toolId: MusicToolId) => void;
  onHoverTool: (node: MusicPlanetNode | null) => void;
}

interface PlanetMeshEntry {
  node: MusicPlanetNode;
  meshGroup: THREE.Group;
  sphereMesh: THREE.Mesh;
  wireframeMesh: THREE.LineSegments;
  orbitMesh?: THREE.Line;
  orbitAngle: number;
  labelGroup: THREE.Group;
  leaderLine: THREE.Line;
}

export class MusicCosmosEngine {
  private container: HTMLElement;
  private callbacks: MusicCosmosEngineCallbacks;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private clock: THREE.Clock = new THREE.Clock();

  private planetEntries: Map<string, PlanetMeshEntry> = new Map();
  private starfieldPoints!: THREE.Points;
  private asteroidPoints!: THREE.Points;
  private orbitalGridsGroup: THREE.Group = new THREE.Group();

  public hoveredNodeId: string | null = null;
  public selectedNodeId: string | null = null;

  // Camera transition targets
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetControlsTarget: THREE.Vector3 | null = null;

  constructor(container: HTMLElement, callbacks: MusicCosmosEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 36, 48);

    // 2. High-performance WebGL Renderer with preserveDrawingBuffer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x01030b);
    this.container.appendChild(this.renderer.domElement);

    // 3. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 140;
    this.controls.minDistance = 6;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.28;
    this.controls.target.set(0, 0, 0);

    // 4. Build Holographic Scene Elements
    this.setupLighting();
    this.buildStarfield();
    this.buildOrbitalGridTracks();
    this.buildAsteroidBelt();
    this.buildPlanetaryNodes();

    // 5. Event Listeners
    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);

    // 6. Start Render Loop
    this.animate();
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0x06b6d4, 0.4);
    this.scene.add(ambient);

    // Central radiant cyan point light at the Sun
    const sunLight = new THREE.PointLight(0x22d3ee, 3.5, 90, 1.2);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x0284c7, 0.8);
    rimLight.position.set(30, 40, 20);
    this.scene.add(rimLight);
  }

  /* Deep space backdrop */
  private buildStarfield() {
    const count = 3500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 90 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Cyan, deep blue, and subtle white stars
      const tint = Math.random();
      if (tint > 0.6) {
        col[i * 3] = 0.2;
        col[i * 3 + 1] = 0.8;
        col[i * 3 + 2] = 0.95;
      } else if (tint > 0.3) {
        col[i * 3] = 0.1;
        col[i * 3 + 1] = 0.5;
        col[i * 3 + 2] = 0.9;
      } else {
        col[i * 3] = 0.8;
        col[i * 3 + 1] = 0.9;
        col[i * 3 + 2] = 1.0;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.starfieldPoints = new THREE.Points(geo, mat);
    this.scene.add(this.starfieldPoints);
  }

  /* Concentric Cyan Wireframe Orbital Ellipses and Holographic Grid Mesh */
  private buildOrbitalGridTracks() {
    this.scene.add(this.orbitalGridsGroup);

    // Semi-major orbital radii matching the planets
    const radii = [4.8, 7.2, 10.0, 13.0, 16.5, 21.0, 26.5, 32.0, 37.5];

    radii.forEach((r, idx) => {
      // 1. Concentric circular orbit line
      const segments = 128;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: idx === 2 ? 0.65 : 0.4, // Earth & Moon slightly brighter
        blending: THREE.AdditiveBlending,
      });
      const orbitLine = new THREE.Line(lineGeo, lineMat);
      this.orbitalGridsGroup.add(orbitLine);

      // 2. Holographic wireframe orbital plane ribbon / grid rings
      const ringGeo = new THREE.RingGeometry(r - 0.25, r + 0.25, 96, 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0891b2,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      this.orbitalGridsGroup.add(ringMesh);
    });

    // Radial spokes radiating outward from the Sun (seen in futuristic holographic orreries)
    const spokeCount = 16;
    const maxRadius = 40.0;
    for (let s = 0; s < spokeCount; s++) {
      const angle = (s / spokeCount) * Math.PI * 2;
      const spokePts = [
        new THREE.Vector3(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5),
        new THREE.Vector3(Math.cos(angle) * maxRadius, 0, Math.sin(angle) * maxRadius),
      ];
      const spokeGeo = new THREE.BufferGeometry().setFromPoints(spokePts);
      const spokeMat = new THREE.LineDashedMaterial({
        color: 0x0e7490,
        dashSize: 0.8,
        gapSize: 0.8,
        transparent: true,
        opacity: 0.25,
      });
      const spokeLine = new THREE.Line(spokeGeo, spokeMat);
      spokeLine.computeLineDistances();
      this.orbitalGridsGroup.add(spokeLine);
    }
  }

  /* Dense Asteroid Belt (Sample & Audio FX Bank) */
  private buildAsteroidBelt() {
    const count = 1800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const minR = 15.5;
    const maxR = 17.5;

    for (let i = 0; i < count; i++) {
      const r = minR + Math.random() * (maxR - minR);
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 0.9;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = yOffset;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      col[i * 3] = 0.25;
      col[i * 3 + 1] = 0.85;
      col[i * 3 + 2] = 0.95;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.asteroidPoints = new THREE.Points(geo, mat);
    this.scene.add(this.asteroidPoints);
  }

  /* Holographic Cyan Celestial Wireframe Spheres & Billboard Labels */
  private buildPlanetaryNodes() {
    MUSIC_PLANET_NODES.forEach((node, idx) => {
      const meshGroup = new THREE.Group();

      // Initial angle dispersed around the orbits for stunning compositional layout (matching user reference image)
      const initialAngles: { [key: string]: number } = {
        sun: 0,
        mercury: 0.45,
        venus: 1.8,
        earth: 3.4,
        mars: 4.8,
        asteroid: 2.1,
        jupiter: 0.95,
        saturn: 2.8,
        uranus: 5.6,
        neptune: 4.1,
      };

      const orbitAngle = initialAngles[node.id] ?? (idx * 0.85);

      // 1. Inner semi-translucent sphere core
      const sphereGeo = new THREE.SphereGeometry(node.sphereRadius, 32, 24);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: node.id === 'sun' ? 0.85 : 0.45,
        blending: THREE.AdditiveBlending,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      meshGroup.add(sphereMesh);

      // 2. Outer glowing wireframe geodesic grid (latitude/longitude rings)
      const wireGeo = new THREE.WireframeGeometry(sphereGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      const wireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
      meshGroup.add(wireframeMesh);

      // 3. Special geometry features:
      // Earth & Moon: add mini moon wireframe
      if (node.id === 'earth') {
        const moonGroup = new THREE.Group();
        const moonGeo = new THREE.SphereGeometry(0.2, 16, 12);
        const moonWire = new THREE.LineSegments(
          new THREE.WireframeGeometry(moonGeo),
          new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
        );
        moonWire.position.set(1.4, 0.2, 0);
        moonGroup.add(moonWire);

        // mini orbit track
        const mPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 32; i++) {
          const a = (i / 32) * Math.PI * 2;
          mPts.push(new THREE.Vector3(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4));
        }
        const mLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(mPts),
          new THREE.LineBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.5 })
        );
        moonGroup.add(mLine);
        meshGroup.add(moonGroup);
      }

      // Saturn: Multiple tilted holographic concentric rings
      if (node.id === 'saturn') {
        const saturnRings = new THREE.Group();
        const rCount = 4;
        for (let r = 0; r < rCount; r++) {
          const inR = node.sphereRadius * (1.45 + r * 0.25);
          const outR = inR + 0.18;
          const rGeo = new THREE.RingGeometry(inR, outR, 64);
          const rMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            wireframe: true,
            transparent: true,
            opacity: 0.7 - r * 0.12,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          saturnRings.add(rMesh);
        }
        saturnRings.rotation.x = Math.PI * 0.42;
        saturnRings.rotation.y = Math.PI * 0.15;
        meshGroup.add(saturnRings);
      }

      // Uranus: Tilted vertical polar rings (as seen in user reference image!)
      if (node.id === 'uranus') {
        const uranusRings = new THREE.Group();
        const rGeo = new THREE.RingGeometry(node.sphereRadius * 1.5, node.sphereRadius * 1.85, 48);
        const rMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const rMesh = new THREE.Mesh(rGeo, rMat);
        uranusRings.add(rMesh);
        uranusRings.rotation.x = Math.PI * 0.08;
        uranusRings.rotation.y = Math.PI * 0.48; // Vertical 98° tilt
        meshGroup.add(uranusRings);
      }

      // Initial positioning in 3D orbit
      const posX = Math.cos(orbitAngle) * node.orbitRadius;
      const posZ = Math.sin(orbitAngle) * node.orbitRadius;
      meshGroup.position.set(posX, 0, posZ);
      meshGroup.userData = { musicToolId: node.id };
      sphereMesh.userData = { musicToolId: node.id };

      this.scene.add(meshGroup);

      // 4. Holographic Text Label Billboard & Leader Line pointing to the planet
      const labelGroup = this.createHolographicLabel(node);
      this.scene.add(labelGroup);

      // Leader pointer line from planet to label
      const leaderGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(posX, 0, posZ),
        new THREE.Vector3(posX, node.sphereRadius + 2.0, posZ),
      ]);
      const leaderMat = new THREE.LineDashedMaterial({
        color: 0x22d3ee,
        dashSize: 0.3,
        gapSize: 0.2,
        transparent: true,
        opacity: 0.7,
      });
      const leaderLine = new THREE.Line(leaderGeo, leaderMat);
      leaderLine.computeLineDistances();
      this.scene.add(leaderLine);

      this.planetEntries.set(node.id, {
        node,
        meshGroup,
        sphereMesh,
        wireframeMesh,
        orbitAngle,
        labelGroup,
        leaderLine,
      });
    });
  }

  /* Create glowing canvas texture sprite for holographic planet label */
  private createHolographicLabel(node: MusicPlanetNode): THREE.Group {
    const group = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d')!;

    // Draw futuristic holographic HUD label box
    ctx.clearRect(0, 0, 512, 140);

    // Glowing cyan border
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 120, 12);
    ctx.fill();
    ctx.stroke();

    // Corner targeting brackets
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 5;
    // top-left
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 10);
    ctx.lineTo(30, 10);
    ctx.stroke();
    // top-right
    ctx.beginPath();
    ctx.moveTo(482, 10);
    ctx.lineTo(502, 10);
    ctx.lineTo(502, 30);
    ctx.stroke();

    // Primary Moniker: UPPERCASE ASTRONOMICAL NAME (matching image: SUN, MERCURY, EARTH, etc.)
    ctx.font = 'bold 36px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(node.astronomicalName.toUpperCase(), 24, 52);

    // Secondary line: MUSIC TOOL FUNCTION (Beat Sequencer, Core DAW, etc.)
    ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`▶ ${node.toolTitle.toUpperCase()}`, 24, 88);

    // Subtitle tagline
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
    ctx.fillText(node.shortLabel, 24, 114);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(7.5, 2.05, 1);
    group.add(sprite);

    return group;
  }

  /* Raycasting & Click Handlers */
  private onPointerDown = (e: PointerEvent) => {
    if (this.isDestroyed) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const checkObjects: THREE.Object3D[] = [];
    this.planetEntries.forEach((entry) => {
      checkObjects.push(entry.sphereMesh);
      checkObjects.push(entry.wireframeMesh);
    });

    const hits = raycaster.intersectObjects(checkObjects, false);
    if (hits.length > 0) {
      let hitObj: THREE.Object3D | null = hits[0].object;
      while (hitObj && !hitObj.userData.musicToolId) {
        hitObj = hitObj.parent;
      }

      if (hitObj && hitObj.userData.musicToolId) {
        const toolId = hitObj.userData.musicToolId as MusicToolId;
        this.selectTool(toolId);
      }
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isDestroyed) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const checkObjects: THREE.Object3D[] = [];
    this.planetEntries.forEach((entry) => {
      checkObjects.push(entry.sphereMesh);
      checkObjects.push(entry.wireframeMesh);
    });

    const hits = raycaster.intersectObjects(checkObjects, false);
    if (hits.length > 0) {
      let hitObj: THREE.Object3D | null = hits[0].object;
      while (hitObj && !hitObj.userData.musicToolId) {
        hitObj = hitObj.parent;
      }
      if (hitObj && hitObj.userData.musicToolId) {
        const toolId = hitObj.userData.musicToolId as string;
        if (this.hoveredNodeId !== toolId) {
          this.hoveredNodeId = toolId;
          const entry = this.planetEntries.get(toolId);
          this.callbacks.onHoverTool(entry?.node || null);
          this.container.style.cursor = 'pointer';
        }
        return;
      }
    }

    if (this.hoveredNodeId) {
      this.hoveredNodeId = null;
      this.callbacks.onHoverTool(null);
      this.container.style.cursor = 'grab';
    }
  };

  public selectTool(toolId: MusicToolId) {
    this.selectedNodeId = toolId;
    const entry = this.planetEntries.get(toolId);
    if (entry) {
      // Focus camera towards the planet
      const p = entry.meshGroup.position;
      const camOffset = Math.max(entry.node.sphereRadius * 4.5, 5.0);
      this.targetControlsTarget = new THREE.Vector3(p.x, p.y, p.z);
      this.targetCameraPos = new THREE.Vector3(p.x, p.y + camOffset * 0.8, p.z + camOffset * 1.4);
    }
    this.callbacks.onSelectTool(toolId);
  }

  public resetView() {
    this.selectedNodeId = null;
    this.targetControlsTarget = new THREE.Vector3(0, 0, 0);
    this.targetCameraPos = new THREE.Vector3(0, 36, 48);
  }

  /* Render Animation Loop */
  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Slow, majestic planetary orbital progression
    this.planetEntries.forEach((entry) => {
      if (entry.node.orbitRadius > 0) {
        // Slow orbital velocity
        entry.orbitAngle += entry.node.orbitSpeed * dt * 0.15;
        const x = Math.cos(entry.orbitAngle) * entry.node.orbitRadius;
        const z = Math.sin(entry.orbitAngle) * entry.node.orbitRadius;
        entry.meshGroup.position.set(x, 0, z);

        // Self rotation
        entry.wireframeMesh.rotation.y += dt * 0.4;

        // Position billboard label above planet
        const labelY = entry.node.sphereRadius + 2.2;
        entry.labelGroup.position.set(x, labelY, z);

        // Update leader pointer line
        const positions = entry.leaderLine.geometry.attributes.position.array as Float32Array;
        positions[0] = x;
        positions[1] = 0;
        positions[2] = z;
        positions[3] = x;
        positions[4] = labelY - 0.7;
        positions[5] = z;
        entry.leaderLine.geometry.attributes.position.needsUpdate = true;
      } else {
        // Central Sun
        entry.wireframeMesh.rotation.y += dt * 0.18;
        entry.labelGroup.position.set(0, entry.node.sphereRadius + 2.4, 0);
      }

      // Pulse hovered / selected planet
      const isTargeted =
        entry.node.id === this.hoveredNodeId || entry.node.id === this.selectedNodeId;
      const baseScale = isTargeted ? 1.15 : 1.0;
      entry.meshGroup.scale.set(baseScale, baseScale, baseScale);
    });

    // 2. Asteroid belt slow drift
    if (this.asteroidPoints) {
      this.asteroidPoints.rotation.y += dt * 0.05;
    }

    // 3. Smooth Camera interpolation
    if (this.targetCameraPos && this.targetControlsTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetControlsTarget, 0.05);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.2) {
        this.targetCameraPos = null;
        this.targetControlsTarget = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    if (this.isDestroyed) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /* Strictly destroy and release 100% of GPU & memory resources */
  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);

    this.controls.dispose();

    // Dispose all scene meshes, geometries, and materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
