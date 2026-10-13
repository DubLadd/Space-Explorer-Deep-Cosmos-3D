Space Explorer: Deep Cosmos 3D & Cosmic Music Studio

A next-generation dual-environment WebGL application built on React 19, Three.js, Tailwind CSS, and the Web Audio API. The application features two distinct, mutually exclusive operational suites:

    🌌 Deep Cosmos 3D Observatory & Space Flight Simulator — A physically grounded astrophysics simulation suite featuring Keplerian planetary orbits, multi-star exoplanetary systems, a Kerr black hole with gravitational photon sphere, a core-collapse supernova, an N-body gravitational orbital sandbox with dynamic Hill spheres, and a 6-DOF manual spacecraft flight deck.

    🎛️ Cosmic Music Studio & DJ Ecosystem Dashboard — A holographic cybernetic orrery inspired by neon-cyan wireframe sci-fi command terminals. Planetary bodies are mapped into musical production instruments: an analog 16-step beat sequencer, dual DJ decks with real-time stems isolation, an AI prompt-to-track blueprint architect, an 8-band mastering suite with real-time FFT spectrum analyzer, and an autonomous promotional AI marketing agent for electronic artists and DJs.

    Single-Instance Resource Guarantee: Only one environment executes at any given time. When switching between the Space Observatory and the Music Studio, the inactive WebGL renderer, animation loop, audio context, and event listeners are cleanly torn down and disposed to conserve 100% of GPU, CPU, and memory resources.

🌟 Key Environments & Features
🌌 Environment 1: Deep Cosmos 3D Observatory

    The Solar System:

        Accurate Keplerian orbital speeds, axial tilts, procedural planetary textures, rings (Saturn, Uranus), and major satellites (Earth's Moon, Phobos, Deimos, Galilean Moons, Titan, Triton, Charon).

    Alien Exoplanet Systems:

        TRAPPIST-1: Seven Earth-sized worlds (b through h) orbiting an ultra-cool red dwarf star with highlighted liquid-water habitable zone boundaries and orbital resonance modeling.

        Alpha Centauri & Proxima: Binary star system (Rigil Kentaurus & Toliman) alongside red dwarf Proxima Centauri and terrestrial habitable-zone world Proxima b.

    Gargantua Black Hole & Relativistic Pulsar:

        Kerr rotating black hole featuring an event horizon, photon sphere, Keplerian accretion disk with Doppler beaming, and a rapidly spinning pulsar emitting relativistic synchrotron radiation beams.

    Core-Collapse Supernova Shockwave:

        Pulsating red supergiant progenitor triggering an interactive core collapse and expanding relativistic shockwave with high-velocity ejecta filaments.

    Spiral Galactic Topologies:

        40,000 active particles mathematically morphing between celestial geometries (Two-Arm Milky Way Spiral, Ring Galaxy, Barred Spiral, and Stellar Cloud) with custom 3-point gradient ramps.

    N-Body Gravitational Orbital Sandbox:

        Real-Time Gravitational Force Vectors: Live 3D acceleration arrows displaying net gravitational pull (

                

              

        ) on all mass bodies.

        Click-and-Drag Slingshot Launcher: Drag directly on the 3D ecliptic grid to aim launch velocity vectors and slingshot custom mass bodies into orbit.

        Dynamic Hill Sphere Zones of Influence: Physical calculation and visual 3D indicators (volumetric glowing spheres with equatorial and meridian rings) highlighting gravitational capture zones (

                

              

        ) when bodies are hovered or selected.

        Analytical Presets: Instant loading for the Figure-8 3-Body Solution, Binary Star & Circumbinary Planet, Lagrange Equilibrium (Sun-Jupiter-Trojans), and Chaotic 4-Body Cluster.

        Coalescing Mergers: Conservation of momentum and mass when celestial bodies collide.

        Reset to Default Button: Instantly restores the initial planetary configuration, positions, velocities, masses, and default gravitational constant in one click.

    6-DOF Spacecraft Flight Deck (Cockpit Mode):

        First-person cockpit with pitch, yaw, and roll controls, flight telemetry HUD, target locking, artificial horizon, velocity in km/s, and a toggleable Warp Drive mode.

    Capture Cosmic Moment:

        Browser-native snapshot download of the clean Three.js WebGL canvas without any DOM or UI overlay interference, featuring an authentic shutter flash animation.

    Astrophysics Dossiers & Guided Expeditions:

        NASA/ESA empirical scientific data sheets and step-by-step guided missions with automated camera navigation.

🎛️ Environment 2: Cosmic Music Studio & DJ Ecosystem Dashboard

    Holographic Cybernetic Orrery:

        Recreates a neon-cyan wireframe celestial command console with geodesic wireframe spheres, concentric elliptical orbital grid lattices, and glowing 3D billboard HUD tags with leader pointer lines.

    Planetary Music Tool Mapping:

        ☀️ Sun — Master DAW Core & Studio Clock: Universal master clock (60–180 BPM), transport controls (Play, Pause, Return to Zero), session routing, and master summing limiter.

        ☿ Mercury — 16-Step Beat Sequencer & Drum Synth: Real-time Web Audio API zero-latency analog synthesis (808 Sub-bass, Punchy Kick, Noise Snare, Closed/Open Metallic Hats, Clap, Rim Percussion). Features step LED indicators, swing quantization, mute/solo per track, and genre presets (Cyber House, Peak-Time Techno, Liquid D&B).

        ♀ Venus — AI Synth & Lead Arpeggiator: Melodic synthesis, scale-quantized arpeggios, and acid 303 filter sweeps.

        ♁ Earth & Moon — AI Music Generator & Track Blueprint Architect: Natural language prompt studio generating 7-section track arrangement timelines (Intro, Verse, Buildup, Drop, Breakdown, Climax Drop, Outro), harmonic chord charts (e.g.,

                

              

        ), and synth sound design recipes.

        ♂ Mars — DJ Decks & Live Stems Mixer: Dual performance turntables with spinning vinyl visualizers, pitch faders (

                

              

        ), 3-band EQs, dual filter sweeps (HPF/LPF), crossfader, real-time stems isolator (Drums, Bass, Vocals, Melody), and instant performance sampler pads (Airhorn, Vinyl Brake, Laser Drop, Dub Siren).

        ☄️ Asteroid Belt — Cosmic Sample Library & Audio FX Rack: Space convolution reverbs, BPM-synchronized delays, and tape saturation modules.

        ♃ Jupiter — AI Brainstorm & Songwriting Chat Hub: Dedicated music production and DJ copilot for unexpected mashups, Camelot wheel harmonic mixing transitions (8A to 10A/5A), and patch design.

        ♄ Saturn — Audio Mastering & Spectral Analyzer: Real-time animated FFT audio spectrum analyzer, 8-band parametric mastering EQ, stereo field expander, true-peak brickwall limiter (-0.3 dBTP), and streaming loudness targets (Spotify -14 LUFS, Beatport/Club -9 LUFS, Apple Music -16 LUFS).

        ♅ Uranus — Release Roadmap & Distribution Planner: 4-week release countdown calendar, Spotify for Artists pitch generator, ISRC/UPC tag checklists, and DJ promo pool tracker.

        ♆ Neptune — Promotional AI Agent & Social Media Growth: Autonomous marketing agent generating viral TikTok & Instagram Reels video hooks, carousel sound design copy, club gig announcements, and an automated 7-day posting schedule.

        ♇ Pluto — Fan Monetization & Sync Licensing Hub: Licensing templates and community drops.

🛠️ Tech Stack

    Frontend Framework: React 19 (Functional components, hooks, modular architecture)

    3D WebGL Engine: Three.js (r186) with OrbitControls, post-processing EffectComposer, and UnrealBloomPass

    Audio Synthesis: Web Audio API (procedural dual-oscillator space drones, analog 808 drum synthesizers, sample noise generators, LFO filters)

    Styling & Design System: Tailwind CSS v4, Lucide React icons, and custom glassmorphism cyber-HUD components

    Build Tooling: Vite 8 with TypeScript 7 (strict type safety)

🚀 Getting Started
Prerequisites

    Node.js 18+ or 20+

    npm or pnpm

Installation

    Clone or access the workspace directory:
    code Bash

    cd applet

    Install dependencies:
    code Bash

    npm install

    Start the development server:
    code Bash

    npm run dev

    The app will run at http://localhost:3000.

    Type-check and build for production:
    code Bash

    npm run build

    Run code validation:
    code Bash

    npm run lint

🎮 Navigation & Keyboard Controls
Global Navigation

    Switch Environments: Click "Music Studio" in the observatory top bar to launch the holographic music orrery, or "Space Simulator" to return to the cosmos simulator.

    Capture Cosmic Moment: Click the camera icon in the top bar to trigger a pure WebGL screenshot download.

3D Viewport Controls (Mouse & Touch)

    Rotate / Orbit: Left-click and drag.

    Pan Camera: Right-click and drag (or two-finger drag).

    Zoom: Scroll wheel or pinch gesture.

    Select Node: Click any celestial body or planetary music node to inspect dossiers or launch music tools.

Spacecraft Flight Deck (Cockpit Mode)
Key	Action
W / ↑	Pitch Nose Down
S / ↓	Pitch Nose Up
A / ←	Yaw Left
D / →	Yaw Right
Q	Roll Counter-Clockwise
E	Roll Clockwise
Space / Shift	Main Engine Forward Thrusters
Shift + W	Toggle Warp Drive (Relativistic Velocity)
Orbital Sandbox Mode

    Launch Masses: Toggle "Enable Click-Launch", click on the 3D ecliptic grid to set the origin, drag to aim the velocity arrow, and release to slingshot into orbit.

    Inspect Hill Spheres: Hover over or click any mass body to highlight its gravitational zone of influence (

            

          

    ). Toggle the "Hill Spheres" button to view all zones simultaneously.

    Reset Configuration: Click "Reset to Default Configuration" in the Sandbox panel to restore initial planetary positions, velocities, and gravitational parameters.

📁 Project Structure
code Code

├── index.html                           # Application entry HTML with Google Fonts
├── metadata.json                        # Applet metadata and permissions
├── package.json                         # Project dependencies and build scripts
├── vite.config.ts                       # Vite configuration with Tailwind CSS v4
├── src/
│   ├── main.tsx                         # React 19 entry point
│   ├── index.css                        # Global CSS & Tailwind layers
│   ├── App.tsx                          # Top-level orchestrator & environment switcher
│   ├── types/
│   │   ├── cosmos.ts                    # Celestial bodies, missions, telemetry, sandbox types
│   │   └── musicCosmos.ts               # Music planetary nodes, sequencer, DJ decks, promo types
│   ├── data/
│   │   ├── celestialBodies.ts           # Astrophysics datasets for Solar System, TRAPPIST-1, etc.
│   │   ├── constellations.ts            # Spherical coordinate constellations & star lines
│   │   ├── missions.ts                  # Guided cosmic missions with camera waypoints
│   │   ├── sandboxPresets.ts            # N-body gravitational presets (Figure-8, Lagrange, etc.)
│   │   └── musicPlanets.ts              # Planetary music tool catalog & capabilities
│   ├── audio/
│   │   ├── CosmicAudio.ts               # Procedural Web Audio space drones, thrusters, pulsars
│   │   └── MusicAudioEngine.ts          # Zero-latency Web Audio drum synth, sequencer & DJ FX
│   ├── scene/
│   │   ├── SpaceEngine.ts               # Three.js cosmic observatory & physics simulation engine
│   │   ├── MusicCosmosEngine.ts         # Three.js cyan holographic orrery & planetary tool engine
│   │   └── TextureFactory.ts            # Procedural canvas textures for planets, stars, glows
│   └── components/
│       ├── SpaceObservatoryApp.tsx      # Deep Cosmos 3D simulator container & controls
│       ├── TopNav.tsx                   # Three-zone top navigation bar
│       ├── TimeController.tsx           # Time scrubbing & orbital layer toggles
│       ├── CockpitHUD.tsx               # 6-DOF flight telemetry HUD
│       ├── CelestialDossier.tsx         # Deep NASA/ESA astrophysical dossiers
│       ├── MissionDrawer.tsx            # Guided space exploration expeditions
│       ├── PlanetListSidebar.tsx        # Floating planetary body selector
│       ├── SandboxControls.tsx          # Orbital sandbox N-body laboratory controls
│       ├── GalaxyColorPanel.tsx         # 3-point galaxy particle gradient controls
│       └── music/
│           ├── CosmicMusicDashboard.tsx # Holographic music dashboard container & tool dock
│           ├── BeatSequencerModal.tsx   # 16-step polyphonic drum sequencer & synthesizer
│           ├── DJDeckModal.tsx          # Dual turntables, stems isolator & DJ FX pads
│           ├── AIMusicStudioModal.tsx   # Prompt-to-track blueprint composition architect
│           ├── PromoAgentModal.tsx      # Autonomous promotional AI marketing agent
│           ├── BrainstormChatModal.tsx  # Production & DJ creative brainstorm copilot
│           └── MasteringModal.tsx       # 8-band parametric EQ, FFT visualizer & LUFS limiter

📄 License

Apache-2.0
