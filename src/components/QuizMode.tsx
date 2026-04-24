import { useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/quiz";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles } from "lucide-react";

export const QuizMode = () => {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ_QUESTIONS[idx];

  const reset = () => {
    setStarted(false);
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= QUIZ_QUESTIONS.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  if (!started) {
    return (
      <div className="rounded-3xl border border-border bg-gradient-card shadow-card p-6 md:p-7">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Election IQ
          </p>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
          Test your knowledge
        </h2>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">
          A friendly 6-question quiz on the basics. No grades, no judgment —
          just learning with explanations after every answer.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-elevated hover:bg-navy-deep transition-smooth hover:-translate-y-0.5"
        >
          Start the quiz
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const message =
      pct === 100
        ? "Perfect score! You're a civic champion. 🏆"
        : pct >= 70
        ? "Great work! You really know your stuff."
        : pct >= 40
        ? "Solid start — every voter starts somewhere!"
        : "Nice try! The chat is a great place to keep learning.";
    return (
      <div className="rounded-3xl border border-border bg-gradient-card shadow-card p-6 md:p-7 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-4">
          <Trophy className="h-7 w-7 text-ink" strokeWidth={2.2} />
        </div>
        <h2 className="font-display text-3xl font-semibold text-ink">
          {score} / {QUIZ_QUESTIONS.length}
        </h2>
        <p className="text-ink-soft mt-2">{message}</p>
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-ink hover:bg-muted transition-smooth"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-gradient-card shadow-card p-6 md:p-7">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Question {idx + 1} of {QUIZ_QUESTIONS.length}
        </p>
        <p className="text-xs text-muted-foreground">Score: {score}</p>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-gold transition-all duration-500"
          style={{ width: `${((idx + (picked !== null ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <h3 className="font-display text-lg md:text-xl font-semibold text-ink leading-snug">
        {q.question}
      </h3>

      <div className="mt-4 space-y-2">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === q.correctIndex;
          const reveal = picked !== null;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={cn(
                "w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-smooth flex items-center gap-3",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !reveal && "border-border bg-card hover:border-gold hover:bg-secondary/50 cursor-pointer",
                reveal && isCorrect && "border-sage bg-sage/10 text-ink",
                reveal && isPicked && !isCorrect && "border-rose bg-rose/10 text-ink",
                reveal && !isPicked && !isCorrect && "border-border bg-card opacity-60",
              )}
            >
              <span
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                  !reveal && "border-border text-muted-foreground",
                  reveal && isCorrect && "border-sage bg-sage text-white",
                  reveal && isPicked && !isCorrect && "border-rose bg-rose text-white",
                  reveal && !isPicked && !isCorrect && "border-border text-muted-foreground",
                )}
              >
                {reveal && isCorrect ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : reveal && isPicked && !isCorrect ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-4 rounded-xl bg-secondary/60 border-l-4 border-gold px-4 py-3 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1">
            {picked === q.correctIndex ? "Correct!" : "Good try"}
          </p>
          <p className="text-sm text-ink leading-relaxed">{q.explanation}</p>
          <button
            onClick={next}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-navy-deep transition-smooth"
          >
            {idx + 1 >= QUIZ_QUESTIONS.length ? "See your score" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
};
