import { useState, useEffect } from "react";
import { QUIZ_QUESTIONS } from "@/data/quiz";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  RotateCcw, 
  Zap, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Sparkles,
  Gamepad2,
  Timer,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";
import { trackEvent } from "@/integrations/firebase";

export const ElectionChallenge = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "results">("start");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleAnswer = (idx: number) => {
    if (selectedIdx !== null) return;
    
    setSelectedIdx(idx);
    const isCorrect = idx === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setScore((s) => s + 100 + (streak * 20));
      setStreak((s) => s + 1);
      setFeedback("correct");
      trackEvent("challenge_answer", { status: "correct", question_idx: currentIdx });
    } else {
      setStreak(0);
      setFeedback("incorrect");
      trackEvent("challenge_answer", { status: "incorrect", question_idx: currentIdx });
    }
  };

  useEffect(() => {
    if (streak > maxStreak) setMaxStreak(streak);
  }, [streak, maxStreak]);

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedIdx(null);
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setGameState("results");
    }
  };

  const restart = () => {
    setGameState("start");
    setCurrentIdx(0);
    setSelectedIdx(null);
    setScore(0);
    setStreak(0);
    setFeedback(null);
  };

  if (gameState === "start") {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-3xl p-8 md:p-16 text-center shadow-2xl border border-white/10 min-h-[500px] flex flex-col items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-navy/40 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Challenge Protocol: Ready</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-display font-bold text-white mb-6 leading-tight animate-fade-in-up">
            CIVIC <span className="text-gold italic">ARENA</span>
          </h2>
          
          <p className="text-white/40 text-lg mb-12 max-w-md mx-auto leading-relaxed animate-fade-in-up delay-150 font-medium">
            Engage in the high-stakes election simulator. Prove your knowledge and ascend to the rank of scholar.
          </p>

          <button 
            aria-label="Initiate Challenge"
            onClick={() => setGameState("playing")}
            className="group relative px-12 py-6 bg-gold hover:bg-gold-soft text-navy font-black text-xl rounded-2xl transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 animate-fade-in-up delay-300"
          >
            <span className="flex items-center gap-4">
              INITIATE CHALLENGE
              <Zap className="h-5 w-5 group-hover:animate-bounce" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "results") {
    const rank = score > 500 ? "Constitutional Scholar" : score > 300 ? "Civic Leader" : "Active Citizen";
    return (
      <div className="rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        
        <div className="relative inline-block mb-10">
          <div className="h-28 w-28 rounded-3xl bg-gold flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.4)] rotate-3 animate-pop-in">
            <Trophy className="h-14 w-14 text-navy" />
          </div>
          <div className="absolute -top-3 -right-6 bg-white text-navy text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
            PROTOCOL COMPLETE
          </div>
        </div>

        <h3 className="text-5xl font-display font-bold text-white mb-3">Victory Achieved</h3>
        <p className="text-white/40 font-medium mb-10 uppercase tracking-[0.2em] text-xs">Simulator Rank Assigned</p>
        
        <div className="inline-block px-10 py-5 bg-navy/50 rounded-2xl border-2 border-gold/50 mb-12 shadow-inner">
          <span className="text-3xl font-black text-gold uppercase tracking-tighter">{rank}</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-12 max-w-lg mx-auto">
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Final Intel</p>
            <p className="text-3xl font-black text-white">{score} XP</p>
          </div>
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
            <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Peak Multiplier</p>
            <p className="text-3xl font-black text-gold flex items-center justify-center gap-2">
              <Flame className="h-6 w-6 fill-gold" />
              x{maxStreak}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            aria-label="Reboot Arena"
            onClick={restart}
            className="px-10 py-5 bg-white text-navy font-black rounded-2xl hover:bg-gold hover:text-navy transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <RotateCcw className="h-5 w-5" />
            REBOOT ARENA
          </button>
          <button aria-label="Log Results" className="px-10 py-5 bg-transparent border-2 border-white/10 text-white font-black rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-3">
            LOG RESULTS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8">
      {/* Game Header HUD */}
      <div className="flex items-center justify-between mb-8 px-6 bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gold flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <span className="text-2xl font-black text-navy">{currentIdx + 1}</span>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Current Sector</p>
            <p className="text-xs font-black text-white uppercase tracking-widest">Protocol Stage {currentIdx + 1} of {QUIZ_QUESTIONS.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Intelligence</p>
            <p className="text-2xl font-black text-gold tabular-nums">{score}</p>
          </div>
          {streak > 0 && (
            <div className="flex flex-col items-center animate-bounce">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-1">Streak</p>
              <div className="flex items-center gap-2 text-gold">
                <Flame className="h-6 w-6 fill-gold" />
                <span className="text-2xl font-black tabular-nums">{streak}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tension Progress Bar */}
      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden mb-12 shadow-inner border border-white/5">
        <div 
          className="absolute h-full bg-gradient-to-r from-navy via-gold to-gold-soft transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]" 
          style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question Arena */}
      <div className={cn(
        "relative rounded-[3.5rem] p-1.5 transition-all duration-700 shadow-2xl overflow-hidden",
        feedback === "correct" ? "bg-sage shadow-[0_0_50px_rgba(16,185,129,0.3)] scale-[1.01]" : 
        feedback === "incorrect" ? "bg-rose shadow-[0_0_50px_rgba(244,63,94,0.3)] scale-[0.99]" : 
        "bg-white/10"
      )}>
        <div className="bg-[#020617] rounded-[3.3rem] p-8 md:p-12 relative overflow-hidden">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <h3 className="relative z-10 text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-12 tracking-tight">
            {currentQuestion.question}
          </h3>

          <div className="relative z-10 grid gap-4">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedIdx === i;
              const isCorrect = i === currentQuestion.correctIndex;
              const showResult = selectedIdx !== null;

              return (
                <button
                  key={i}
                  aria-label={`Select option: ${option}`}
                  onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={cn(
                    "group relative w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                    !showResult 
                      ? "border-white/10 bg-white/5 hover:border-gold hover:bg-white/10 cursor-pointer" 
                      : isCorrect 
                        ? "border-sage bg-sage/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]" 
                        : isSelected 
                          ? "border-rose bg-rose/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]" 
                          : "border-white/5 opacity-20"
                  )}
                >
                  <span className={cn(
                    "text-lg font-bold transition-colors",
                    showResult && isCorrect ? "text-sage" : showResult && isSelected ? "text-rose" : "text-white/80"
                  )}>
                    {option}
                  </span>
                  
                  <div className={cn(
                    "h-9 w-9 rounded-xl border flex items-center justify-center transition-all",
                    !showResult 
                      ? "border-white/10 group-hover:border-gold group-hover:bg-gold/10" 
                      : isCorrect 
                        ? "bg-sage border-sage text-white scale-110" 
                        : isSelected 
                          ? "bg-rose border-rose text-white" 
                          : "border-white/5"
                  )}>
                    {showResult && isCorrect ? <CheckCircle2 className="h-5 w-5" /> : showResult && isSelected ? <XCircle className="h-5 w-5" /> : <Zap className="h-4 w-4 opacity-30" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback Readout */}
      {feedback && (
        <div className="mt-10 animate-fade-in-up">
          <div className={cn(
            "rounded-[2.5rem] p-8 border backdrop-blur-2xl flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl",
            feedback === "correct" ? "bg-sage/5 border-sage/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]" : "bg-rose/5 border-rose/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]"
          )}>
            <div className={cn(
              "h-20 w-20 shrink-0 rounded-3xl text-white flex items-center justify-center shadow-lg",
              feedback === "correct" ? "bg-sage animate-pulse" : "bg-rose"
            )}>
              {feedback === "correct" ? <ShieldCheck className="h-10 w-10" /> : <Timer className="h-10 w-10" />}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className={cn(
                "text-2xl font-black uppercase tracking-[0.2em] mb-2",
                feedback === "correct" ? "text-sage" : "text-rose"
              )}>
                {feedback === "correct" ? "Protocol Success" : "Protocol Failure"}
              </h4>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                {currentQuestion.explanation}
              </p>
              
              <button 
                onClick={nextQuestion}
                className="w-full sm:w-auto px-12 py-5 bg-gold text-navy font-black rounded-2xl hover:bg-gold-soft transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105"
              >
                {currentIdx + 1 === QUIZ_QUESTIONS.length ? "END PROTOCOL" : "NEXT SECTOR"}
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
