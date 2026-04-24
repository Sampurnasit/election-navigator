import { cn } from "@/lib/utils";
import { Vote, Megaphone, Users, GraduationCap } from "lucide-react";

export type UserRole = "voter" | "candidate" | "volunteer" | "curious";

const ROLES: { id: UserRole; label: string; sub: string; icon: typeof Vote }[] = [
  { id: "voter", label: "I want to vote", sub: "Walk me through the basics", icon: Vote },
  { id: "candidate", label: "I'm thinking of running", sub: "Show me the candidate path", icon: Megaphone },
  { id: "volunteer", label: "I want to help out", sub: "Volunteer & poll worker info", icon: Users },
  { id: "curious", label: "Just curious", sub: "Explain how it all works", icon: GraduationCap },
];

interface RoleSelectorProps {
  active: UserRole | null;
  onChange: (role: UserRole) => void;
}

export const RoleSelector = ({ active, onChange }: RoleSelectorProps) => {
  return (
    <div className="rounded-3xl border border-border bg-gradient-card shadow-card p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-1">
        Tell me who you are
      </p>
      <h2 className="font-display text-xl md:text-2xl font-semibold text-ink">
        I'll tailor everything to your goal.
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isActive = active === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onChange(r.id)}
              className={cn(
                "text-left rounded-2xl p-3 border-2 transition-smooth group",
                isActive
                  ? "border-navy bg-navy/5 shadow-soft"
                  : "border-border bg-card hover:border-gold hover:bg-secondary/50",
              )}
              aria-pressed={isActive}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center transition-bounce shrink-0",
                    isActive
                      ? "bg-gradient-hero text-primary-foreground shadow-card scale-105"
                      : "bg-secondary text-ink-soft group-hover:bg-gold/20 group-hover:text-navy",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-ink leading-tight">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{r.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ROLE_PROMPT_MAP: Record<UserRole, string> = {
  voter: "I want to vote in an upcoming election. Give me a friendly overview of what I need to do, in clear steps.",
  candidate:
    "I'm considering running for elected office. Walk me through the realistic first steps a beginner should take.",
  volunteer:
    "I'd love to volunteer for an election (poll worker, observer, or voter educator). What are my options and what should I expect?",
  curious:
    "I'm just curious how elections work in general. Give me a friendly, beginner-level overview I can build on.",
};
