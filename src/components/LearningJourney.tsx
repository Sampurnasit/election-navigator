import { useState, useEffect } from "react";
import { TIMELINE } from "@/data/timeline";
import { cn } from "@/lib/utils";
import { ChevronRight, Lock, CheckCircle2, Star, Sparkles, Trophy } from "lucide-react";

interface LearningJourneyProps {
  onAskAbout: (prompt: string) => void;
}

export const LearningJourney = ({ onAskAbout }: LearningJourneyProps) => {
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);

  // SVG Path coordinates for a winding journey
  // We'll use a viewBox of 1000 x 400 for a wide journey
  const points = [
    { x: 100, y: 300 }, // Start - Registration
    { x: 300, y: 100 }, // Campaigning
    { x: 500, y: 300 }, // Voting Day
    { x: 700, y: 100 }, // Counting
    { x: 900, y: 250 }, // Results
  ];

  const handleNodeClick = (index: number) => {
    if (index <= unlockedIndex) {
      setActiveNode(index);
    }
  };

  const markComplete = (index: number) => {
    if (!completedNodes.includes(index)) {
      setCompletedNodes([...completedNodes, index]);
      if (index === unlockedIndex && unlockedIndex < TIMELINE.length - 1) {
        setUnlockedIndex(unlockedIndex + 1);
      }
    }
    setActiveNode(null);
  };

  const activeData = activeNode !== null ? TIMELINE[activeNode] : null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-sky-50 to-blue-50 rounded-[2.5rem] border border-blue-100 shadow-elevated p-8 min-h-[600px] flex flex-col">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gold rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-navy rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mb-8 flex justify-between items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-2">Interactive Guide</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink leading-tight">
            The Voter's <span className="text-navy italic">Quest</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-card/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-border/50 shadow-soft">
          <div className="flex -space-x-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={cn(
                  "h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold",
                  completedNodes.includes(i) ? "bg-sage text-white" : i <= unlockedIndex ? "bg-navy text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {completedNodes.includes(i) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-border mx-1" />
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gold fill-gold" />
            <span className="text-sm font-bold text-ink">{completedNodes.length * 20} XP</span>
          </div>
        </div>
      </div>

      {/* The Journey Map */}
      <div className="relative flex-1 flex items-center justify-center py-12 px-4">
        <svg 
          viewBox="0 0 1000 400" 
          className="w-full h-full max-h-[400px] drop-shadow-2xl overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Main Path Shadow */}
          <path
            d="M 100 300 C 200 300 200 100 300 100 C 400 100 400 300 500 300 C 600 300 600 100 700 100 C 800 100 800 250 900 250"
            fill="none"
            stroke="black"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-5 blur-sm"
          />
          
          {/* Unlocked Path */}
          <path
            d="M 100 300 C 200 300 200 100 300 100 C 400 100 400 300 500 300 C 600 300 600 100 700 100 C 800 100 800 250 900 250"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset={1000 - (unlockedIndex * 250)}
            className="text-navy/20 transition-all duration-1000 ease-out"
          />

          {/* Completed Path */}
          <path
            d="M 100 300 C 200 300 200 100 300 100 C 400 100 400 300 500 300 C 600 300 600 100 700 100 C 800 100 800 250 900 250"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset={1000 - (completedNodes.length * 250)}
            className="text-gold transition-all duration-1000 ease-out"
          />

          {/* Nodes */}
          {points.map((point, i) => {
            const isUnlocked = i <= unlockedIndex;
            const isCompleted = completedNodes.includes(i);
            const isActive = activeNode === i;
            const Icon = TIMELINE[i].icon;

            return (
              <g 
                key={i} 
                className={cn(
                  "cursor-pointer group outline-none",
                  isUnlocked ? "animate-pop-in" : "opacity-40"
                )} 
                style={{ animationDelay: `${i * 150}ms` }}
                onClick={() => handleNodeClick(i)}
              >
                {/* Node Glow */}
                {isUnlocked && (
                  <circle 
                    cx={point.x} cy={point.y} r="50" 
                    className={cn(
                      "fill-current transition-all duration-700 blur-2xl opacity-0 group-hover:opacity-40 animate-pulse",
                      isCompleted ? "text-sage" : "text-navy"
                    )}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="34"
                  className={cn(
                    "transition-all duration-500 ease-bounce stroke-[5]",
                    isActive ? "scale-125 stroke-gold" : "hover:scale-115",
                    isCompleted 
                      ? "fill-sage stroke-sage shadow-elevated" 
                      : isUnlocked 
                        ? "fill-white stroke-navy shadow-card" 
                        : "fill-muted stroke-muted-foreground/20 cursor-not-allowed"
                  )}
                />

                {/* Node Icon/Content */}
                <foreignObject x={point.x - 18} y={point.y - 18} width="36" height="36" className="pointer-events-none">
                  <div className="flex items-center justify-center w-full h-full">
                    {!isUnlocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground/60" />
                    ) : (
                      <Icon className={cn("h-7 w-7 transition-colors", isCompleted ? "text-white" : "text-navy")} />
                    )}
                  </div>
                </foreignObject>

                {/* Label */}
                <foreignObject x={point.x - 70} y={point.y + 45} width="140" height="50" className="pointer-events-none">
                  <div className="text-center flex flex-col items-center">
                    <p className={cn(
                      "text-[11px] font-black uppercase tracking-widest transition-colors mb-1",
                      isUnlocked ? "text-ink" : "text-muted-foreground/40"
                    )}>
                      {TIMELINE[i].title}
                    </p>
                    {isCompleted && (
                      <div className="flex items-center gap-1 bg-sage/10 text-sage px-2 py-0.5 rounded-full text-[9px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        COMPLETED
                      </div>
                    )}
                  </div>
                </foreignObject>

                {/* Floating indicator for next available node */}
                {i === unlockedIndex && !isCompleted && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gold animate-ping opacity-60"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Overlay Panel for Active Node */}
      {activeNode !== null && activeData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-navy/20 backdrop-blur-md" onClick={() => setActiveNode(null)} />
          <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden">
            <div className={cn("h-3 w-full", activeData.color)} />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-4 rounded-2xl text-white", activeData.color)}>
                    <activeData.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gold">Step {activeNode + 1}</p>
                    <h3 className="text-3xl font-display font-bold text-ink">{activeData.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveNode(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <ChevronRight className="h-6 w-6 rotate-180" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-ink/50 mb-3">Key Concepts</h4>
                  <ul className="space-y-3">
                    {activeData.details.map((detail, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-ink-soft">
                        <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <div className="bg-secondary/40 p-5 rounded-2xl border border-border">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-2">Real-world Example</h4>
                    <p className="text-sm text-ink italic leading-relaxed">
                      "{activeData.example}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => markComplete(activeNode)}
                      className="w-full py-4 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-all shadow-lg hover:shadow-navy/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Mark as Learned
                    </button>
                    <button
                      onClick={() => onAskAbout(activeData.promptHint)}
                      className="w-full py-3 bg-white border border-border text-navy rounded-xl font-bold hover:bg-secondary transition-all flex items-center justify-center gap-2"
                    >
                      Ask more about this
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Footer */}
      <div className="mt-auto pt-8 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gold/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-gold" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink/50 uppercase tracking-widest">Global Progress</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-navy transition-all duration-1000" 
                  style={{ width: `${(completedNodes.length / TIMELINE.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-ink">{Math.round((completedNodes.length / TIMELINE.length) * 100)}%</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-ink/50 uppercase tracking-widest mb-1">Current Milestone</p>
          <p className="text-sm font-bold text-navy">{TIMELINE[unlockedIndex]?.title || "Journey Complete!"}</p>
        </div>
      </div>
    </div>
  );
};
