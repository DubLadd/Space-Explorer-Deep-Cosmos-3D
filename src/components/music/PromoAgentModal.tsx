import React, { useState } from 'react';
import { PromoCampaignTask } from '../../types/musicCosmos';
import {
  Share2,
  Bot,
  Sparkles,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Zap,
  Play,
  X,
  TrendingUp,
} from 'lucide-react';

interface PromoAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TASKS: PromoCampaignTask[] = [
  {
    id: 'task-1',
    day: 'Day 1 (T-14 Pre-Save)',
    platform: 'TikTok',
    title: 'The "Accidental Studio Drop" Teaser Hook',
    description: '15-second teaser showing screen capture of DAW drop with dramatic bass drop reaction.',
    hookScript: '"Wait until the 16th bar kicks in... did I accidentally make the song of the summer?" (Show volume fader slam)',
    caption: 'Testing this unreleased ID on proper subwoofers tonight. Drop a 🔥 if this needs to drop next Friday! Link in bio to pre-save.',
    hashtags: ['#techno', '#electronicmusic', '#producerlife', '#unreleasedid', '#clubmusic', '#djset'],
    status: 'ready',
  },
  {
    id: 'task-2',
    day: 'Day 2 (T-10 Teaser)',
    platform: 'Instagram',
    title: 'Visualizer Carousel & Synth Recipe Breakdown',
    description: '3-slide carousel explaining the sound design of the lead synth with studio footage.',
    hookScript: 'Slide 1: "How I designed this alien lead in 3 steps" -> Slide 2: "Filter modulation" -> Slide 3: "Audio drop".',
    caption: 'Behind the sound of [Track Title]. Most producers overcomplicate sound design. Here is the exact serum chain. Pre-save in bio!',
    hashtags: ['#sounddesign', '#synthwave', '#producertips', '#abletonlive', '#edmfamily'],
    status: 'pending',
  },
  {
    id: 'task-3',
    day: 'Day 4 (T-7 Crowd Test)',
    platform: 'YouTube Shorts',
    title: 'Live DJ Set Reaction Clip',
    description: 'High-energy vertical clip of the crowd erupting when the track drops at 2:00 AM in the club.',
    hookScript: '"Dropping my unreleased track in front of 2,000 people to see if the bassline actually works..."',
    caption: 'The energy in the room when this hit! Full extended mix out on Spotify next Friday. What city should I play next?',
    hashtags: ['#djtips', '#clubbing', '#festivalvibes', '#raveday', '#electronicmusic'],
    status: 'pending',
  },
  {
    id: 'task-4',
    day: 'Day 7 (Release Day)',
    platform: 'Spotify',
    title: 'Spotify Editorial & DJ Promo Blast',
    description: 'Pitch note submitted to Spotify for Artists and blast sent to 300+ club DJs on Promo Pools.',
    hookScript: '"High-energy peak-time electronic anthem featuring rolling basslines and hypnotic vocal chops."',
    caption: 'It is finally here. [Track Title] is OUT NOW everywhere on all streaming platforms! Add it to your weekend rotation.',
    hashtags: ['#newmusicfriday', '#outnow', '#spotifyplaylist', '#electronicmusic'],
    status: 'pending',
  },
];

export const PromoAgentModal: React.FC<PromoAgentModalProps> = ({ isOpen, onClose }) => {
  const [artistName, setArtistName] = useState<string>('ASTRA PROTOCOL');
  const [trackName, setTrackName] = useState<string>('CYBER HORIZON');
  const [campaignGoal, setCampaignGoal] = useState<string>('Viral TikTok & Spotify Release Rollout');
  const [tasks, setTasks] = useState<PromoCampaignTask[]>(DEFAULT_TASKS);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    'Promotional Agent initialized on Neptune Node.',
    'Scanned trending electronic music hashtags and audio hooks on TikTok / Reels.',
    '4-stage promotional schedule generated and optimized for peak engagement.',
  ]);

  if (!isOpen) return null;

  const handleRunAgent = () => {
    setIsAgentRunning(true);
    setAgentLogs((prev) => [...prev, `[AI Agent] Optimizing copy for artist "${artistName}" with track "${trackName}"...`]);

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t, idx) => ({
          ...t,
          caption: t.caption.replace(/\[Track Title\]/g, trackName),
          status: idx === 0 ? 'ready' : idx === 1 ? 'ready' : 'pending',
        }))
      );
      setAgentLogs((prev) => [
        ...prev,
        `[AI Agent] Generated 4 high-retention video hooks tailored for ${artistName}.`,
        `[AI Agent] Editorial pitch generated for Spotify Curator submissions.`,
        `[AI Agent] Ready for automated social publishing!`,
      ]);
      setIsAgentRunning(false);
    }, 1200);
  };

  const handleCopyTask = (task: PromoCampaignTask) => {
    const text = `PLATFORM: ${task.platform}\nHOOK SCRIPT: ${task.hookScript}\nCAPTION: ${task.caption}\nHASHTAGS: ${task.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedTaskId(task.id);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'published' ? 'ready' : 'published' } : t
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-[#030712]/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  Neptune Node
                </span>
                <span className="text-xs text-slate-400 font-mono">Autonomous Marketing AI</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Promotional AI Agent & Social Media Growth Engine
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Configuration Bar */}
        <div className="p-4 md:p-6 border-b border-white/10 bg-black/40 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Artist / DJ Alias
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                Upcoming Track / EP Title
              </label>
              <input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunAgent}
                disabled={isAgentRunning}
                className="w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAgentRunning ? 'Agent Deploying...' : 'Run Autonomous Promo Agent'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Tasks List & Live Agent Terminal */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Campaign Task Cards (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Autonomous Multi-Platform Schedule</span>
              </h4>
              <span className="text-xs text-cyan-300 font-mono">
                {tasks.filter((t) => t.status === 'published').length} / {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => {
                const isPublished = task.status === 'published';
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                      isPublished
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-300">
                            {task.platform}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">{task.day}</span>
                        </div>
                        <h5 className="font-bold text-white text-sm">{task.title}</h5>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyTask(task)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 transition-colors"
                          title="Copy script and caption to clipboard"
                        >
                          {copiedTaskId === task.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-colors ${
                            isPublished
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {isPublished ? 'PUBLISHED' : 'MARK DONE'}
                        </button>
                      </div>
                    </div>

                    {/* Viral Hook Script */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block">
                        Hook & Visual Direction:
                      </span>
                      <p className="text-slate-200 text-xs italic">{task.hookScript}</p>
                    </div>

                    {/* Caption & Hashtags */}
                    <div className="space-y-1 text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">
                        Caption Copy:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{task.caption}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {task.hashtags.map((h, i) => (
                          <span key={i} className="text-cyan-400 font-mono text-[10px]">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Agent Telemetry & Log Console (1 Column) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Agent Terminal</span>
            </h4>

            <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-[11px] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-cyan-400">AGENT STATUS</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE 24/7
                </span>
              </div>

              <div className="space-y-2 text-slate-300 max-h-56 overflow-y-auto pr-1">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-l-2 border-cyan-500/40 pl-2">
                    {log}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 space-y-1">
                <div>⚡ Auto-Sync: TikTok, IG, YouTube Shorts, X</div>
                <div>📡 Optimized Posting Window: 18:00 - 21:00 UTC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
