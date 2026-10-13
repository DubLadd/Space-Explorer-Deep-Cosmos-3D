import { useState } from 'react';
import { SpaceObservatoryApp } from './components/SpaceObservatoryApp';
import { CosmicMusicDashboard } from './components/music/CosmicMusicDashboard';

export type AppEnvironment = 'music-studio' | 'space-observatory';

export default function App() {
  // Only ONE environment runs at a time. Default to the newly integrated Music Studio & DJ Ecosystem.
  const [activeApp, setActiveApp] = useState<AppEnvironment>('music-studio');

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#010206] text-slate-100 select-none">
      {activeApp === 'music-studio' ? (
        <CosmicMusicDashboard
          onSwitchToSpaceSim={() => setActiveApp('space-observatory')}
        />
      ) : (
        <SpaceObservatoryApp
          onSwitchToMusicDashboard={() => setActiveApp('music-studio')}
        />
      )}
    </div>
  );
}
