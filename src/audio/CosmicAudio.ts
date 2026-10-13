/**
 * Web Audio API procedural cosmic soundscape synthesizer
 * Provides ambient deep space drones, pulsar clicks, thruster engine sound, and scan feedback.
 */

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private thrusterGain: GainNode | null = null;
  private pulsarGain: GainNode | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private pulsarInterval: number | null = null;

  // Thruster noise buffer
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupSpaceDrone();
      this.setupThrusters();
      this.setupPulsar();
      this.isInitialized = true;
    } catch {
      // AudioContext not permitted or unsupported
    }
  }

  private setupSpaceDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    // Deep sub-drone oscillator 1 (55 Hz A1)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Deep sub-drone oscillator 2 (82.4 Hz E2 harmonic)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82.41, this.ctx.currentTime);

    // Lowpass filter with slow sweeping LFO
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // very slow 12s sweep

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.droneGain);

    osc1.start();
    osc2.start();
    lfo.start();
  }

  private setupThrusters() {
    if (!this.ctx || !this.masterGain) return;

    this.thrusterGain = this.ctx.createGain();
    this.thrusterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.thrusterGain.connect(this.masterGain);

    // Generate white noise buffer for continuous rocket rumble
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'lowpass';
    this.noiseFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.thrusterGain);
    this.noiseNode.start();
  }

  private setupPulsar() {
    if (!this.ctx || !this.masterGain) return;
    this.pulsarGain = this.ctx.createGain();
    this.pulsarGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.pulsarGain.connect(this.masterGain);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0.0 : 0.45, this.ctx.currentTime, 0.08);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, volume));
    if (!this.isMuted) {
      this.masterGain.gain.setTargetAtTime(clamped * 0.6, this.ctx.currentTime, 0.05);
    }
  }

  // Update thruster intensity from cockpit flight controls
  public updateThrusterIntensity(throttle: number, isWarp: boolean) {
    if (!this.thrusterGain || !this.noiseFilter || !this.ctx || this.isMuted) return;
    const targetGain = throttle > 0.01 ? (isWarp ? 0.45 : 0.22 * throttle) : 0.0;
    const targetFreq = isWarp ? 850 : 150 + throttle * 400;

    this.thrusterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    this.noiseFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
  }

  // Play a short resonant acoustic scan ping when selecting a planet
  public playTargetLockSound() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6 ping

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio trigger safely ignored
    }
  }

  // Start rhythmic pulsar radio clicks when viewing pulsar or high-energy object
  public setPulsarMode(active: boolean) {
    if (this.pulsarInterval) {
      window.clearInterval(this.pulsarInterval);
      this.pulsarInterval = null;
    }
    if (!active || !this.ctx || this.isMuted) return;

    // Trigger rapid 12 Hz cosmic tick clicks
    this.pulsarInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();

        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(1400, now);
        clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

        clickGain.gain.setValueAtTime(0.08, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterGain);

        clickOsc.start(now);
        clickOsc.stop(now + 0.03);
      } catch {
        // ignore
      }
    }, 85); // ~11.7 Hz frequency
  }
}

export const cosmicAudio = new CosmicAudioEngine();
