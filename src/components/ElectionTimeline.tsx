import { useState } from "react";
import { TIMELINE } from "@/data/timeline";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ElectionTimelineProps {
  onAskAbout: (prompt: string) => void;
}

export const ElectionTimeline = ({ onAskAbout }: ElectionTimelineProps) => {
  const [activeId, setActiveId] = useState<string>(TIMELINE[0].id);
  const active = TIMELINE.find((p) => p.id === activeId)!;
  const ActiveIcon = active.icon;

  return (
    <div className="rounded-3xl border border-border bg-gradient-card shadow-card p-5 md:p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Election Cycle
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mt-1">
            The five stages
          </h2>
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Tap a stage to learn more
        </p>
      </div>

      {/* Phase pills */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-border -translate-y-1/2 hidden md:block" />
        <div className="grid grid-cols-5 gap-1.5 md:gap-3 relative">
          {TIMELINE.map((phase, i) => {
            const Icon = phase.icon;
            const isActive = phase.id === activeId;
            return (
              <button
                key={phase.id}
                onClick={() => setActiveId(phase.id)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 md:gap-2 py-2 transition-smooth",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl",
                )}
                aria-pressed={isActive}
              >
                <div
                  className={cn(
                    "h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-bounce",
                    "border-2",
                    isActive
                      ? "bg-navy text-primary-foreground border-navy scale-110 shadow-elevated"
                      : "bg-card text-ink-soft border-border group-hover:border-gold group-hover:text-navy",
                  )}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.2} />
                </div>
                <span
                  className={cn(
                    "text-[10px] md:text-xs font-semibold text-center leading-tight transition-colors",
                    isActive ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {i + 1}. {phase.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active detail */}
      <div
        key={active.id}
        className="mt-6 rounded-2xl bg-background/60 border border-border p-5 animate-fade-in-up"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center text-primary-foreground shrink-0",
              active.color,
            )}
          >
            <ActiveIcon className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-ink">
              {active.title}
            </h3>
            <p className="text-sm text-ink-soft mt-0.5">{active.short}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {active.details.map((d) => (
            <li key={d} className="flex gap-2 text-sm text-ink-soft">
              <span className="text-gold mt-1.5 h-1 w-1 rounded-full bg-gold shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-xl bg-secondary/60 border-l-4 border-gold px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1">
            Quick example
          </p>
          <p className="text-sm text-ink italic">{active.example}</p>
        </div>

        <button
          onClick={() => onAskAbout(active.promptHint)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold transition-colors group"
        >
          Ask Ballot Buddy about this stage
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
