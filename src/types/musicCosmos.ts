/**
 * Type definitions for Cosmic Music Studio & DJ Ecosystem Dashboard
 */

export type MusicToolId =
  | 'sun'       // Master DAW & Clock
  | 'mercury'   // 16-Step Beat Sequencer
  | 'venus'     // AI Synth & Arpeggiator
  | 'earth'     // AI Music Generator & Prompt Studio
  | 'mars'      // DJ Decks & Stems Mixer
  | 'asteroid'  // Sample Library & Cosmic FX Rack
  | 'jupiter'   // AI Brainstorm & Production Chat
  | 'saturn'    // Audio Mastering & Spectral Analyzer
  | 'uranus'    // Release & Distribution Roadmap
  | 'neptune'   // Promotional AI Agent & Social Media Engine
  | 'pluto';     // Fan Monetization & Sync Licensing

export interface MusicPlanetNode {
  id: MusicToolId;
  astronomicalName: string;
  toolTitle: string;
  shortLabel: string;
  tagline: string;
  category: 'core' | 'beat' | 'ai-composer' | 'dj' | 'mastering' | 'marketing' | 'fx';
  orbitRadius: number;
  orbitSpeed: number;
  sphereRadius: number;
  color: string;
  accentColor: string;
  iconName: string;
  summary: string;
  features: string[];
}

export type SequencerTrackName =
  | 'Kick'
  | 'Snare'
  | 'HiHat Closed'
  | 'HiHat Open'
  | 'Clap'
  | 'Perc / Rim'
  | '808 Sub';

export interface SequencerTrack {
  name: SequencerTrackName;
  steps: boolean[]; // 16 steps
  volume: number;   // 0 to 1
  muted: boolean;
  solo: boolean;
  pitch: number;    // semitones offset (-12 to +12)
}

export interface BeatSequencerPattern {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  swing: number; // 0 to 100%
  tracks: SequencerTrack[];
}

export interface DJDeckState {
  trackTitle: string;
  artist: string;
  bpm: number;
  currentBpm: number;
  pitchPercent: number; // -8% to +8%
  isPlaying: boolean;
  playbackProgress: number; // 0 to 1
  highEq: number; // -12dB to +12dB
  midEq: number;
  lowEq: number;
  filter: number; // -1 (LPF) to 0 (neutral) to +1 (HPF)
  volume: number;
  cueActive: boolean;
  stems: {
    drums: boolean;
    bass: boolean;
    vocals: boolean;
    melody: boolean;
  };
}

export interface PromoCampaignTask {
  id: string;
  day: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube Shorts' | 'Spotify' | 'DJ Pools';
  title: string;
  description: string;
  hookScript: string;
  caption: string;
  hashtags: string[];
  status: 'pending' | 'ready' | 'published';
}

export interface AIMusicGenerationResult {
  title: string;
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  arrangement: {
    section: string;
    bars: number;
    energy: number; // 1 to 10
    description: string;
    instrumentation: string[];
  }[];
  chordProgression: string;
  synthRecipe: string;
  mixingNotes: string;
}
