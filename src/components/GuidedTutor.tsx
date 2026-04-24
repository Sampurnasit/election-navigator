import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Lesson, LESSONS } from "@/data/lessons";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lightbulb,
  Sparkles,
  Clock,
  ArrowRight,
  X,
  MessageCircleQuestion,
  Trophy,
} from "lucide-react";

interface GuidedTutorProps {
  onAskChat: (prompt: string) => void;
}

const STORAGE_KEY = "ballot-buddy-progress-v1";

type Progress = Record<string, { completedSteps: number[]; finishedAt?: number }>;

const loadProgress = (): Progress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProgress = (p: Progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
};

export const GuidedTutor = ({ onAskChat }: GuidedTutorProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const lesson = useMemo(() => LESSONS.find((l) => l.id === activeId) || null, [activeId]);
  const step = lesson?.steps[stepIdx];

  const open = (id: string) => {
    setActiveId(id);
    setStepIdx(0);
    setPicked(null);
  };

  const close = () => {
    setActiveId(null);
    setPicked(null);
  };

  const markComplete = (lessonId: string, idx: number, finished?: boolean) => {
    setProgress((prev) => {
      const cur = prev[lessonId] || { completedSteps: [] };
      const completedSteps = Array.from(new Set([...cur.completedSteps, idx]));
      const next = {
        ...prev,
        [lessonId]: {
          completedSteps,
          finishedAt: finished ? Date.now() : cur.finishedAt,
        },
      };
      saveProgress(next);
      return next;
    });
  };

  const goNext = () => {
    if (!lesson) return;
    markComplete(lesson.id, stepIdx);
    if (stepIdx + 1 >= lesson.steps.length) {
      markComplete(lesson.id, stepIdx, true);
      // Stay on a "complete" view: bump idx beyond
      setStepIdx(lesson.steps.length);
      setPicked(null);
    } else {
      setStepIdx(stepIdx + 1);
      setPicked(null);
    }
  };

  const goPrev = () => {
    if (stepIdx === 0) return;
    setStepIdx(stepIdx - 1);
    setPicked(null);
  };

  // ───────── List view ─────────
  if (!lesson) {
    return (
      <div className="rounded-3xl border border-border bg-gradient-card shadow-card p-5 md:p-7">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Guided Lessons
          </p>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
          Pick a path. I'll be your tutor.
        </h2>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">
          Bite-sized walkthroughs with checkpoints, examples, and a friendly nudge to ask follow-ups in chat.
        </p>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {LESSONS.map((l) => {
            const Icon = l.icon;
            const p = progress[l.id];
            const done = p?.completedSteps.length || 0;
            const total = l.steps.length;
            const pct = Math.round((done / total) * 100);
            const finished = !!p?.finishedAt;
            return (
              <button
                key={l.id}
                onClick={() => open(l.id)}
                className="group text-left rounded-2xl border border-border bg-card p-4 hover:border-gold hover:shadow-card transition-smooth relative overflow-hidden"
              >
                {finished && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-sage/15 text-sage px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" />
                    Done
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center shrink-0 shadow-soft group-hover:scale-105 transition-bounce">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink leading-tight">
                      {l.title}
                    </p>
                    <p className="text-xs text-ink-soft mt-1 line-clamp-2 leading-relaxed">
                      {l.blurb}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {l.estMinutes} min
                    </span>
                    <span>{total} steps</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-navy">
                    {done > 0 ? `${done}/${total}` : "Start"}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="mt-2.5 h-1 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      finished ? "bg-sage" : "bg-gradient-gold",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ───────── Lesson player view ─────────
  const total = lesson.steps.length;
  const isComplete = stepIdx >= total;
  const Icon = lesson.icon;
  const completedCount = progress[lesson.id]?.completedSteps.length || 0;

  return (
    <div className="rounded-3xl border border-border bg-gradient-card shadow-card overflow-hidden">
      {/* Lesson header */}
      <div className="px-5 py-4 border-b border-border bg-background/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center shrink-0 shadow-soft">
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Guided lesson
            </p>
            <p className="font-display font-semibold text-ink truncate">{lesson.title}</p>
          </div>
        </div>
        <button
          onClick={close}
          className="h-8 w-8 rounded-lg bg-card border border-border hover:border-gold hover:bg-secondary/60 transition-smooth flex items-center justify-center text-ink-soft"
          aria-label="Close lesson"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress rail */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          <span>
            {isComplete ? "Lesson complete" : `Step ${stepIdx + 1} of ${total}`}
          </span>
          <span>
            {Math.round((Math.min(stepIdx + (isComplete ? 0 : 1), total) / total) * 100)}%
          </span>
        </div>
        <div className="flex gap-1">
          {lesson.steps.map((_, i) => {
            const done = i < stepIdx || isComplete;
            const current = i === stepIdx && !isComplete;
            return (
              <button
                key={i}
                onClick={() => {
                  setStepIdx(i);
                  setPicked(null);
                }}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  done && "bg-gradient-gold",
                  current && "bg-navy",
                  !done && !current && "bg-secondary hover:bg-muted",
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div key={`${lesson.id}-${stepIdx}`} className="px-5 md:px-7 py-5 animate-fade-in-up">
        {isComplete ? (
          <div className="text-center py-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-4">
              <Trophy className="h-7 w-7 text-ink" strokeWidth={2.2} />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink">
              You finished "{lesson.title}"
            </h3>
            <p className="text-ink-soft mt-2 text-sm">
              {completedCount} of {total} steps completed. Want to keep learning?
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() =>
                  onAskChat(`I just finished the lesson "${lesson.title}". What's a great question to deepen what I just learned?`)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-navy text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-navy-deep transition-smooth shadow-card"
              >
                <MessageCircleQuestion className="h-4 w-4" />
                Discuss with Ballot Buddy
              </button>
              <button
                onClick={close}
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-ink hover:bg-muted transition-smooth"
              >
                Back to lessons
              </button>
            </div>
          </div>
        ) : (
          step && (
            <>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-ink leading-snug">
                {step.title}
              </h3>

              <div className="prose-chat mt-3 text-ink-soft">
                <ReactMarkdown>{step.body}</ReactMarkdown>
              </div>

              {step.tip && (
                <div className="mt-4 rounded-xl bg-gold/10 border-l-4 border-gold px-4 py-3 flex gap-2.5">
                  <Lightbulb className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-sm text-ink leading-relaxed">{step.tip}</p>
                </div>
              )}

              {step.checkpoint && (
                <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gold mb-2">
                    Quick checkpoint
                  </p>
                  <p className="font-semibold text-ink mb-3">{step.checkpoint.question}</p>
                  <div className="space-y-2">
                    {step.checkpoint.options.map((opt, i) => {
                      const isPicked = picked === i;
                      const reveal = picked !== null;
                      const correct = !!opt.correct;
                      return (
                        <button
                          key={i}
                          disabled={reveal}
                          onClick={() => setPicked(i)}
                          className={cn(
                            "w-full text-left rounded-xl border-2 px-3 py-2.5 text-sm transition-smooth flex items-start gap-2.5",
                            !reveal && "border-border bg-card hover:border-gold cursor-pointer",
                            reveal && correct && "border-sage bg-sage/10",
                            reveal && isPicked && !correct && "border-rose bg-rose/10",
                            reveal && !isPicked && !correct && "border-border bg-card opacity-60",
                          )}
                        >
                          {reveal ? (
                            correct ? (
                              <CheckCircle2 className="h-4 w-4 text-sage shrink-0 mt-0.5" />
                            ) : isPicked ? (
                              <X className="h-4 w-4 text-rose shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            )
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-ink">{opt.label}</p>
                            {reveal && (isPicked || correct) && (
                              <p className="text-xs text-ink-soft mt-1 italic">{opt.feedback}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step.askPrompt && (
                <button
                  onClick={() => onAskChat(step.askPrompt!)}
                  className="mt-4 w-full inline-flex items-center justify-between gap-2 rounded-xl border border-dashed border-gold bg-gold/5 hover:bg-gold/10 px-4 py-3 text-sm transition-smooth group"
                >
                  <span className="flex items-center gap-2 text-ink">
                    <MessageCircleQuestion className="h-4 w-4 text-gold" />
                    <span className="font-medium">Ask Ballot Buddy:</span>
                    <span className="text-ink-soft italic line-clamp-1">"{step.askPrompt}"</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-gold group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              )}
            </>
          )
        )}
      </div>

      {/* Footer nav */}
      {!isComplete && (
        <div className="px-5 py-4 border-t border-border bg-background/40 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={stepIdx === 0}
            className={cn(
              "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-smooth",
              stepIdx === 0
                ? "text-muted-foreground cursor-not-allowed"
                : "text-ink-soft hover:bg-secondary",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={goNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-navy-deep transition-smooth shadow-card"
          >
            {stepIdx + 1 >= total ? "Finish" : "Next step"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
