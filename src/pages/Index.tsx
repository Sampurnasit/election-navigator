import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { ElectionTimeline } from "@/components/ElectionTimeline";
import { QuizMode } from "@/components/QuizMode";
import { Vote, BookOpen, MessagesSquare } from "lucide-react";

const Index = () => {
  const [externalPrompt, setExternalPrompt] = useState<{ text: string; nonce: number } | null>(null);

  const askChat = (text: string) => {
    setExternalPrompt({ text, nonce: Date.now() });
    // Smooth scroll to chat on small screens
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const el = document.getElementById("chat-section");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/70 backdrop-blur sticky top-0 z-20">
        <div className="container max-w-7xl flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-card">
              <Vote className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink leading-none">
                Ballot Buddy
              </p>
              <p className="text-[10.5px] uppercase tracking-[0.2em] text-gold mt-0.5 font-semibold">
                Your friendly election guide
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm text-ink-soft">
            <a href="#timeline" className="hover:text-navy transition-colors flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Timeline
            </a>
            <a href="#quiz" className="hover:text-navy transition-colors">
              Election IQ
            </a>
            <a href="#chat-section" className="hover:text-navy transition-colors flex items-center gap-1.5">
              <MessagesSquare className="h-3.5 w-3.5" />
              Ask
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-7xl pt-10 md:pt-16 pb-6 md:pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 mb-5 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-ink-soft">
              Non-partisan · Beginner-friendly
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink leading-[1.05] tracking-tight">
            Elections, finally <span className="italic text-navy">explained</span>{" "}
            <span className="relative inline-block">
              <span className="relative z-10">simply.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-gold/40 -z-0 rounded-sm" />
            </span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-ink-soft leading-relaxed max-w-2xl">
            From "how do I register" to "what happens after the ballots close" —
            chat with a friendly AI guide, explore the cycle, and test what you've learned.
          </p>
        </div>
      </section>

      {/* Main grid */}
      <main className="container max-w-7xl pb-16">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left column — guides */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div id="timeline">
              <ElectionTimeline onAskAbout={askChat} />
            </div>
            <div id="quiz">
              <QuizMode />
            </div>

            {/* Why this exists */}
            <div className="rounded-3xl border border-border bg-gradient-hero text-primary-foreground p-6 md:p-7 shadow-elevated relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-soft">
                Why Ballot Buddy
              </p>
              <h3 className="font-display text-2xl font-semibold mt-1 leading-snug">
                Civic literacy, without the lecture.
              </h3>
              <p className="text-sm mt-3 text-primary-foreground/85 leading-relaxed">
                Elections shape our communities — but the rules can feel intimidating.
                We keep things short, simple, and judgment-free, so you can show up
                informed and confident.
              </p>
            </div>
          </div>

          {/* Right column — chat */}
          <div
            id="chat-section"
            className="lg:col-span-3 order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] min-h-[600px]"
          >
            <ChatPanel externalPrompt={externalPrompt} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/60">
        <div className="container max-w-7xl py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© Ballot Buddy — A neutral civic-education companion.</p>
          <p className="italic">Always verify official details with your local election authority.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
