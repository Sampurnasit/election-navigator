import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SmartGuide, type UserContext } from "@/components/SmartGuide";
import { ElectionChallenge } from "@/components/ElectionChallenge";
import { LearningJourney } from "@/components/LearningJourney";
import { CircularTimeline } from "@/components/CircularTimeline";
import { ROLE_PROMPT_MAP, type UserRole } from "@/components/RoleSelector";
import { PollMap } from "@/components/PollMap";
import { Vote, Sparkles, RotateCw, Gamepad2, Bot, User, Clock, CheckCircle2, MapPin } from "lucide-react";

const Index = () => {
  const [searchParams] = useSearchParams();
  const userName = searchParams.get("name") || "Citizen";
  const userAge = parseInt(searchParams.get("age") || "0");
  
  type AppMode = "journey" | "explorer" | "challenge" | "guide" | "locator";
  const [mode, setMode] = useState<AppMode>("journey");
  const [booting, setBooting] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [externalPrompt, setExternalPrompt] = useState<{ text: string; nonce: number } | null>(null);

  const askChat = (text: string) => {
    setMode("guide");
    setExternalPrompt({ text, nonce: Date.now() });
  };

  const externalContext: UserContext = role ? { role } : {};

  // Calculate Voter Status
  const isVoter = userAge >= 18;
  const yearsToVote = 18 - userAge;
  const yearsVoted = userAge - 18;

  return (
    <div className="fixed inset-0 bg-[#020617] text-white overflow-hidden flex flex-col font-sans">
      {/* Top Notification Bar */}
      <div className="relative z-30 bg-gold px-6 py-2 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-700">
        {isVoter ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-navy" />
            <p className="text-[10px] font-black text-navy uppercase tracking-widest">
              Welcome back, {userName}. You have been an eligible voter for {yearsVoted} years.
            </p>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-navy animate-pulse" />
            <p className="text-[10px] font-black text-navy uppercase tracking-widest">
              Hello {userName}. You have {yearsToVote} years to go until you can cast your first vote.
            </p>
          </>
        )}
      </div>

      {booting && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center animate-out fade-out duration-1000 delay-1500">
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gold animate-draw-path" style={{ width: '100%', animationDuration: '2s' }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold animate-pulse">Initializing Civic_Sim...</p>
          <div className="mt-8 space-y-1 text-[8px] font-mono text-white/30 text-left w-48">
            <p className="">{'>'} Loading Protocol_Journey</p>
            <p className="">{'>'} Syncing Orbital_Data</p>
            <p className="">{'>'} Booting Expert_Guide_AI</p>
          </div>
        </div>
      )}
      {/* Simulator Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(51,65,85,0.1)_0,transparent_100%)]" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-navy rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-gold/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* HUD - Top Bar */}
      <header className="relative z-20 flex items-center justify-between px-8 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4 w-1/4">
          <div className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-card">
            <Vote className="h-4 w-4 text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-display text-base font-bold tracking-tight">CIVIC_SIM</h1>
            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-black opacity-80">Interactive Protocol</p>
          </div>
        </div>

        {/* Centered Navigation Symbols */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {[
            { id: "journey", icon: Sparkles, label: "Journey" },
            { id: "explorer", icon: RotateCw, label: "Explorer" },
            { id: "locator", icon: MapPin, label: "Locator" },
            { id: "challenge", icon: Gamepad2, label: "Challenge" },
            { id: "guide", icon: Bot, label: "Guide" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as AppMode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                mode === item.id ? "bg-white text-navy shadow-lg scale-105" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-6 w-1/4">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Rank</p>
            <p className="text-[10px] font-bold text-gold">SCHOLAR</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Protocol XP</p>
            <p className="text-[10px] font-bold text-white">1,240</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <User className="h-4 w-4 text-white/60" />
          </div>
        </div>
      </header>

      {/* Main Viewport - Extended */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col items-center">
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 relative overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 duration-700">
            {mode === "journey" && (
              <div className="min-h-full flex flex-col py-6 px-4 md:px-8">
                <LearningJourney onAskAbout={askChat} />
              </div>
            )}
            {mode === "explorer" && (
              <div className="min-h-full flex flex-col py-6 px-4 md:px-8">
                <CircularTimeline />
              </div>
            )}
            {mode === "challenge" && (
              <div className="min-h-full max-w-5xl mx-auto flex flex-col w-full py-6 px-4 md:px-8">
                <ElectionChallenge />
              </div>
            )}
            {mode === "guide" && (
              <div className="h-full flex flex-col px-4 md:px-8 py-4">
                <SmartGuide externalPrompt={externalPrompt} externalContext={externalContext} />
              </div>
            )}
            {mode === "locator" && (
              <div className="min-h-full max-w-4xl mx-auto flex flex-col w-full py-12 px-4 md:px-8">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-display font-bold mb-2 text-white">Station <span className="text-gold">Locator</span></h2>
                  <p className="text-sm text-white/40 uppercase tracking-widest">Find your nearest official polling place</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                   <PollMap />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global Status Elements */}
      <div className="absolute right-8 bottom-8 z-20 pointer-events-none hidden lg:block opacity-50">
        <div className="flex flex-col items-end gap-2">
          <p className="text-[9px] font-bold text-gold tracking-[0.2em] uppercase">SYSTEM_STABLE</p>
          <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-sage w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
