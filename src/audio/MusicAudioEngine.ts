/**
 * Web Audio API synthesizer for the Cosmic Beat Sequencer and DJ Performance Tools
 * Synthesizes analog 808s, punchy kicks, snappy snares, metallic hats, and DJ sampler FX.
 */

import { SequencerTrack, SequencerTrackName } from '../types/musicCosmos';

export class MusicAudioEngine {
  private static instance: MusicAudioEngine | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  // Sequencer playback clock
  private isPlaying: boolean = false;
  private bpm: number = 126;
  private swing: number = 0; // 0 to 1
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private scheduleAheadTime: number = 0.1;
  private lookaheadMs: number = 25;

  private activeTracks: SequencerTrack[] = [];
  private onStepCallback: ((step: number) => void) | null = null;

  public static getInstance(): MusicAudioEngine {
    if (!MusicAudioEngine.instance) {
      MusicAudioEngine.instance = new MusicAudioEngine();
    }
    return MusicAudioEngine.instance;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(40, Math.min(220, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setTracks(tracks: SequencerTrack[]) {
    this.activeTracks = tracks;
  }

  public setOnStepCallback(cb: ((step: number) => void) | null) {
    this.onStepCallback = cb;
  }

  /* -------------------------------------------------------------
     STEP SEQUENCER SCHEDULER
  ------------------------------------------------------------- */
  public startSequencer() {
    this.initContext();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.05;

    this.schedulerLoop();
  }

  public stopSequencer() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    this.currentStep = 0;
    if (this.onStepCallback) {
      this.onStepCallback(-1);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private schedulerLoop = () => {
    if (!this.isPlaying || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }

    this.timerID = window.setTimeout(this.schedulerLoop, this.lookaheadMs);
  };

  private advanceStep() {
    // 16th note base duration
    const secondsPerBeat = 60.0 / this.bpm;
    const baseDuration = secondsPerBeat / 4.0;

    // Apply subtle swing to odd steps (1, 3, 5, etc.)
    const isOddStep = this.currentStep % 2 === 1;
    const swingOffset = isOddStep ? (this.swing * baseDuration * 0.4) : -(this.swing * baseDuration * 0.4);

    this.nextNoteTime += baseDuration + swingOffset;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleStep(step: number, time: number) {
    // Broadcast step to UI in sync with playback time
    if (this.onStepCallback && this.ctx) {
      const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
      setTimeout(() => {
        if (this.isPlaying && this.onStepCallback) {
          this.onStepCallback(step);
        }
      }, delayMs);
    }

    const anySolo = this.activeTracks.some((t) => t.solo);

    for (const track of this.activeTracks) {
      if (track.muted) continue;
      if (anySolo && !track.solo) continue;

      if (track.steps[step]) {
        this.triggerDrumSound(track.name, time, track.volume, track.pitch);
      }
    }
  }

  /* -------------------------------------------------------------
     DRUM SYNTHESIS ALGORITHMS
  ------------------------------------------------------------- */
  public triggerDrumSound(
    type: SequencerTrackName,
    time: number = 0,
    volume: number = 0.8,
    pitchOffset: number = 0
  ) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = time > 0 ? time : this.ctx.currentTime;
    const vol = Math.max(0, Math.min(1, volume));

    switch (type) {
      case 'Kick':
        this.playKick(t, vol, pitchOffset);
        break;
      case 'Snare':
        this.playSnare(t, vol, pitchOffset);
        break;
      case 'HiHat Closed':
        this.playHiHat(t, vol, false);
        break;
      case 'HiHat Open':
        this.playHiHat(t, vol, true);
        break;
      case 'Clap':
        this.playClap(t, vol);
        break;
      case 'Perc / Rim':
        this.playPerc(t, vol, pitchOffset);
        break;
      case '808 Sub':
        this.play808Sub(t, vol, pitchOffset);
        break;
    }
  }

  // 1. Analog 808/909 Kick with rapid pitch sweep
  private playKick(t: number, vol: number, pitchOffset: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 145 * Math.pow(2, pitchOffset / 12);
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.12);

    gain.gain.setValueAtTime(vol * 1.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // 2. Snare: Noise Burst + Tuned Tone
  private playSnare(t: number, vol: number, pitchOffset: number) {
    if (!this.ctx || !this.masterGain) return;

    // Noise component
    const noiseBuffer = this.createNoiseBuffer(0.2);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(800, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const freq = 180 * Math.pow(2, pitchOffset / 12);
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    oscGain.gain.setValueAtTime(vol * 0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noiseSource.start(t);
    noiseSource.stop(t + 0.25);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 3. Hi-Hat: Metallic filtered noise
  private playHiHat(t: number, vol: number, isOpen: boolean) {
    if (!this.ctx || !this.masterGain) return;

    const duration = isOpen ? 0.38 : 0.055;
    const noiseBuffer = this.createNoiseBuffer(duration);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9500, t);
    filter.Q.setValueAtTime(3.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + duration + 0.02);
  }

  // 4. Clap: Multi-pulse noise
  private playClap(t: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;

    const pulses = [0, 0.012, 0.024, 0.036];
    pulses.forEach((offset, idx) => {
      const isLast = idx === pulses.length - 1;
      const dur = isLast ? 0.18 : 0.025;
      const noise = this.ctx!.createBufferSource();
      noise.buffer = this.createNoiseBuffer(dur);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t + offset);
      filter.Q.setValueAtTime(1.8, t + offset);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(vol * (isLast ? 0.8 : 0.5), t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      noise.start(t + offset);
      noise.stop(t + offset + dur + 0.01);
    });
  }

  // 5. Percussion / Rim Click
  private playPerc(t: number, vol: number, pitchOffset: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 420 * Math.pow(2, pitchOffset / 12);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    gain.gain.setValueAtTime(vol * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 6. Deep 808 Sub-Bass Note
  private play808Sub(t: number, vol: number, pitchOffset: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 45 * Math.pow(2, pitchOffset / 12);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(vol * 1.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  /* -------------------------------------------------------------
     DJ PERFORMANCE SAMPLER SOUND EFFECTS
  ------------------------------------------------------------- */
  public playDJAirhorn() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Classic 3-tone airhorn stack
    const freqs = [466.16, 587.33, 783.99]; // Bb, D, G
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.setValueAtTime(0.35, now + 0.12);
      gain.gain.setValueAtTime(0.01, now + 0.15);
      gain.gain.setValueAtTime(0.35, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  public playVinylBrake() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  public playLaserSweep() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playDubSiren() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(650, now);

    lfo.type = 'triangle';
    lfo.frequency.setValueAtTime(8, now); // 8 Hz wobble

    lfoGain.gain.setValueAtTime(180, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.85);
    osc.stop(now + 0.85);
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

export const musicAudio = MusicAudioEngine.getInstance();
