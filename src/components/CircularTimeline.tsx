import { useState, useRef, useEffect } from "react";
import { TIMELINE, type TimelinePhase } from "@/data/timeline";
import { cn } from "@/lib/utils";
import { analytics, trackEvent } from "@/integrations/firebase";
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Info,
  Calendar,
  X,
  HelpCircle
} from "lucide-react";

const MISSED_CONSEQUENCES: Record<string, string> = {
  registration: "You won't be able to vote on election day. Most regions don't allow same-day registration!",
  campaigning: "You might cast a vote based on slogans rather than substance. Missing this phase means missing the 'why' behind the candidates.",
  "voting-day": "Your voice isn't heard. Every election is decided by those who show up. A single vote often decides local races!",
  counting: "You might lose trust in the system. Understanding the count is key to seeing how democracy is protected.",
  results: "You miss the transition of power and the start of new policies that affect your daily life.",
};

export const CircularTimeline = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const totalPhases = TIMELINE.length;

  const rotateTo = (index: number) => {
    setActiveIndex(index);
    // Calculate the shortest rotation path
    const diff = index - activeIndex;
    setRotation(rotation - (diff * (360 / totalPhases)));
    
    // Track interaction
    trackEvent("timeline_phase_change", { 
      phase_id: TIMELINE[index].id,
      phase_index: index 
    });
  };

  const next = () => rotateTo((activeIndex + 1) % totalPhases);
  const prev = () => rotateTo((activeIndex - 1 + totalPhases) % totalPhases);

  const activePhase = TIMELINE[activeIndex];

  return (
    <div className="relative w-full min-h-[700px] flex items-center justify-center overflow-hidden bg-navy-deep rounded-[3rem] p-8 text-white shadow-elevated">
      {/* Background Starfield / Particle effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-75" />
        <div className="absolute top-1/2 left-2/3 w-1 h-1 bg-white rounded-full animate-pulse delay-150" />
        <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse delay-300" />
      </div>

      {/* Orbit Rings with sweep effect */}
      <div className="absolute w-[500px] h-[500px] border border-white/10 rounded-full">
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-gold/20 to-transparent animate-spin-slow opacity-20" style={{ animationDuration: '10s' }} />
      </div>
      <div className="absolute w-[700px] h-[700px] border border-white/5 rounded-full" />

      {/* Center Core */}
      <div className="relative z-10 flex flex-col items-center text-center transition-transform duration-700 hover:scale-110">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gold via-accent to-gold p-1 shadow-[0_0_80px_rgba(251,191,36,0.4)] animate-pulse">
          <div className="w-full h-full rounded-full bg-navy-deep flex flex-col items-center justify-center p-4">
            <Calendar className="h-8 w-8 text-gold mb-2" aria-hidden="true" />
            <span className="text-xs font-black tracking-[0.2em] uppercase text-gold/80">Election</span>
            <span className="text-2xl font-display font-bold">2026</span>
          </div>
        </div>
      </div>

      {/* Orbiting Nodes */}
      <nav 
        className="absolute w-[450px] h-[450px] transition-transform duration-1000 cubic-bezier(0.22, 1, 0.36, 1)"
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label="Election Phase Navigation"
      >
        {TIMELINE.map((phase, i) => {
          const angle = (i * (360 / totalPhases)) - 90; // Start at top
          const x = 225 + 225 * Math.cos((angle * Math.PI) / 180);
          const y = 225 + 225 * Math.sin((angle * Math.PI) / 180);
          const Icon = phase.icon;
          const isActive = activeIndex === i;

          return (
            <div
              key={phase.id}
              className="absolute"
              style={{ 
                left: `${x}px`, 
                top: `${y}px`, 
                transform: `translate(-50%, -50%) rotate(${-rotation}deg)` 
              }}
            >
              <button
                onClick={() => rotateTo(i)}
                aria-label={`Go to ${phase.title} phase`}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                  isActive 
                    ? "bg-white text-navy scale-125 shadow-[0_0_30px_rgba(255,255,255,0.5)]" 
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                )}
              >
                <Icon className={cn("h-6 w-6 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} aria-hidden="true" />
                
                {/* Connector Line to center */}
                <div 
                  className={cn(
                    "absolute w-[225px] h-px bg-gradient-to-r from-transparent to-white/20 origin-left transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transform: `rotate(${angle + 180}deg) translateX(-100%)` }}
                />

                {/* Small label for non-active */}
                {!isActive && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">
                      {phase.title}
                    </p>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Floating Info Card */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-80 z-20">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("p-2 rounded-xl text-white", activePhase.color)}>
              <activePhase.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Phase {activeIndex + 1}</p>
              <h3 className="text-xl font-display font-bold leading-none">{activePhase.title}</h3>
            </div>
          </div>
          
          <p className="text-sm text-white/80 leading-relaxed mb-6">
            {activePhase.short}
          </p>

          <div className="space-y-3">
            {activePhase.details.slice(0, 2).map((detail, idx) => (
              <div key={idx} className="flex gap-3 text-xs text-white/60">
                <div className="h-1 w-1 rounded-full bg-gold shrink-0 mt-1.5" />
                <span>{detail}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-2">
            <button 
              onClick={() => {
                setShowWarning(true);
                trackEvent("timeline_consequence_view", { phase_id: activePhase.id });
              }}
              aria-label={`View consequences of missing the ${activePhase.title} phase`}
              className="flex-1 py-2.5 px-4 bg-rose/20 hover:bg-rose/30 text-rose-300 text-xs font-bold rounded-xl border border-rose/30 transition-all flex items-center justify-center gap-2 group"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              What if I miss this?
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button 
            onClick={prev} 
            aria-label="Previous phase"
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex gap-1.5">
            {TIMELINE.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full",
                  activeIndex === i ? "w-6 bg-gold" : "w-1.5 bg-white/20"
                )} 
              />
            ))}
          </div>
          <button 
            onClick={next} 
            aria-label="Next phase"
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Consequences Modal */}
      {showWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-navy-deep/80 backdrop-blur-md" onClick={() => setShowWarning(false)} />
          <div className="relative w-full max-w-md bg-rose-950 border border-rose-500/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
            <button 
              onClick={() => setShowWarning(false)}
              aria-label="Close consequences modal"
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="h-8 w-8 text-rose-400" />
              </div>
              <h4 className="text-2xl font-display font-bold text-rose-200 mb-2">Consequences</h4>
              <p className="text-rose-300/80 uppercase tracking-[0.2em] text-[10px] font-bold mb-6">
                Missing the {activePhase.title} stage
              </p>
              
              <div className="bg-black/20 rounded-2xl p-6 border border-rose-500/20 mb-8">
                <p className="text-sm text-rose-100 leading-relaxed italic">
                  "{MISSED_CONSEQUENCES[activePhase.id]}"
                </p>
              </div>

              <button 
                onClick={() => setShowWarning(false)}
                className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-900/40"
              >
                I understand, show me how to stay on track
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating hints */}
      <div className="absolute left-12 bottom-12 max-w-xs flex items-center gap-4 animate-bounce">
        <div className="p-3 bg-gold/10 border border-gold/20 rounded-2xl">
          <RotateCw className="h-5 w-5 text-gold" />
        </div>
        <p className="text-xs text-white/60 font-medium">
          Click the orbit nodes to navigate through the election cycle
        </p>
      </div>

      <div className="absolute left-12 top-12">
        <h2 className="text-3xl font-display font-bold">Orbit <span className="text-gold">Explorer</span></h2>
        <p className="text-xs text-white/40 uppercase tracking-widest mt-1">360° Timeline View</p>
      </div>
    </div>
  );
};
