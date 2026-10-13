import * as THREE from 'three';

export class TextureFactory {
  // Soft glowing radial sprite for stars and corona glow
  public static makeGlowSprite(): THREE.CanvasTexture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // Sharper dot sprite for morphing particle topologies
  public static makeDotSprite(): THREE.CanvasTexture {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // Procedural terrestrial planet texture with noise, craters, and continents
  public static makeTerrestrialTexture(
    baseColor: string,
    spotColors: string[],
    craterCount: number = 220,
    hasOceans: boolean = false
  ): THREE.CanvasTexture {
    const w = 512;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Base surface fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    // If Earth-like ocean world, draw organic landmasses
    if (hasOceans) {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, w, h);

      // Continent shapes
      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 18; i++) {
        const cx = Math.random() * w;
        const cy = 40 + Math.random() * (h - 80);
        const rad = 25 + Math.random() * 55;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();

        // sub-blobs
        for (let j = 0; j < 6; j++) {
          const ox = cx + (Math.random() - 0.5) * rad * 1.5;
          const oy = cy + (Math.random() - 0.5) * rad * 1.2;
          ctx.beginPath();
          ctx.arc(ox, oy, rad * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Polar ice caps
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, 22);
      ctx.fillRect(0, h - 22, w, 22);

      // White cloud swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let k = 0; k < 45; k++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 10 + Math.random() * 30;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.8, r * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Crater and elevation layers
      for (let i = 0; i < craterCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 2 + Math.random() * 16;
        ctx.globalAlpha = 0.15 + Math.random() * 0.4;
        ctx.fillStyle = spotColors[Math.floor(Math.random() * spotColors.length)];
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // Procedural gas giant with banded gradient and turbulence streaks
  public static makeBandedTexture(
    colorStops: string[],
    hasGreatSpot: boolean = false,
    spotColor: string = '#b91c1c'
  ): THREE.CanvasTexture {
    const w = 512;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    colorStops.forEach((col, i) => grad.addColorStop(i / (colorStops.length - 1), col));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Atmospheric turbulence lines
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + Math.random() * 0.12})`;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.05 + i * 0.8) * 4);
      }
      ctx.stroke();
    }

    // Great Red Spot / Dark Vortex
    if (hasGreatSpot) {
      const spotX = w * 0.62;
      const spotY = h * 0.65;
      ctx.fillStyle = spotColor;
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, 24, 14, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // swirl ring around the spot
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // Procedural solar convective granules and flares
  public static makeStellarTexture(baseColor: string = '#f59e0b', flareColor: string = '#fef08a'): THREE.CanvasTexture {
    const w = 512;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    // Granule convective cells
    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 1 + Math.random() * 5;
      ctx.globalAlpha = 0.2 + Math.random() * 0.45;
      ctx.fillStyle = Math.random() < 0.6 ? flareColor : '#b45309';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}
