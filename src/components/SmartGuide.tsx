import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Globe2,
  GraduationCap,
  Wand2,
  RefreshCcw,
  ArrowRight,
  Mic,
  LayoutDashboard,
  Maximize2,
  ExternalLink,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleSelector, type UserRole, ROLE_PROMPT_MAP } from "@/components/RoleSelector";
import { toast } from "@/hooks/use-toast";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string; type?: "standard" | "visual" };

export type UserContext = {
  region?: string;
  firstTime?: boolean;
  role?: UserRole | string;
  simpleMode?: boolean;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/election-chat`;

interface SmartGuideProps {
  externalPrompt?: { text: string; nonce: number } | null;
  externalContext?: UserContext;
}

const stripNextSteps = (text: string) =>
  text.replace(/\n*###\s*Next steps[\s\S]*$/i, "").trim();

const parseNextSteps = (text: string): string[] => {
  const m = text.match(/###\s*Next steps\s*\n([\s\S]*)$/i);
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").replace(/^["“]|["”]$/g, "").trim())
    .filter((l) => l.length > 0 && l.length < 120)
    .slice(0, 3);
};

export const SmartGuide = ({ externalPrompt, externalContext }: SmartGuideProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState<UserContext>({});
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (externalContext) {
      setCtx((c) => ({ ...c, ...externalContext }));
    }
  }, [externalContext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (externalPrompt?.text) {
      send(externalPrompt.text);
    }
  }, [externalPrompt?.nonce]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          userContext: ctx,
        }),
      });

      if (!resp.ok) throw new Error("API Error");
      
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsert(content);
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Connection problem", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({ title: "Voice not supported", description: "Your browser doesn't support voice input." });
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      send(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border border-border rounded-[2.5rem] shadow-elevated overflow-hidden">
      {/* Header - Guide Profile */}
      <div className="px-8 py-6 bg-navy text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Bot className="h-8 w-8 text-gold" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-sage rounded-full border-2 border-navy animate-pulse" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Ballot Buddy</h2>
            <p className="text-xs text-white/60 font-medium tracking-widest uppercase">Expert Learning Guide</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMessages([])} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <RefreshCcw className="h-5 w-5 opacity-60" />
          </button>
          <button className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <Maximize2 className="h-5 w-5 opacity-60" />
          </button>
        </div>
      </div>

      {/* Main Guide Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto py-8 animate-fade-in-up">
            <div className="h-16 w-16 bg-gold/10 rounded-3xl flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-3xl font-display font-bold text-ink mb-4">How can I assist you today?</h3>
            <p className="text-ink-soft text-center mb-10 leading-relaxed">
              I'm Ballot Buddy, your expert guide. To provide the best support, tell me a bit about your current goal.
            </p>
            
            <div className="w-full mb-10">
              <RoleSelector 
                active={ctx.role as UserRole || null} 
                onChange={(r) => {
                  setCtx(prev => ({ ...prev, role: r }));
                  send(ROLE_PROMPT_MAP[r]);
                }} 
              />
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-4">Or jump straight in</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {["Register", "Ballots", "Polling", "Rights"].map((s) => (
                <button 
                  key={s} 
                  onClick={() => send(`Tell me about ${s.toLowerCase()}`)}
                  className="px-4 py-3 bg-secondary/50 border border-border rounded-xl text-[10px] font-black uppercase tracking-wider text-navy hover:bg-gold hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <GuideCard key={i} role={m.role} content={m.content} onAction={(txt) => send(txt)} />
          ))
        )}
        {loading && <LoadingCard />}
      </div>

      {/* Input Bar - Floating Style */}
      <div className="p-6 bg-gradient-to-t from-background to-transparent">
        <div className="relative flex items-center gap-3 bg-white border border-border focus-within:border-gold shadow-card rounded-[1.5rem] px-4 py-2 transition-all">
          <button 
            onClick={toggleListen}
            className={cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
              isListening ? "bg-rose text-white animate-pulse" : "bg-secondary text-ink hover:bg-muted"
            )}
          >
            <Mic className="h-5 w-5" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder="Ask your guide..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 text-black font-medium"
            rows={1}
          />
          <button 
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="h-10 w-10 bg-navy text-white rounded-2xl flex items-center justify-center hover:bg-navy-deep disabled:opacity-50 transition-all"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const GuideCard = ({ role, content, onAction }: { role: Role; content: string; onAction: (txt: string) => void }) => {
  const isUser = role === "user";
  const [expanded, setExpanded] = useState(false);
  const nextSteps = isUser ? [] : parseNextSteps(content);
  const mainContent = isUser ? content : stripNextSteps(content);

  // Detect context for visual aids
  const isRegistration = content.toLowerCase().includes("register");
  const isVoting = content.toLowerCase().includes("vote") || content.toLowerCase().includes("ballot");
  const isTimeline = content.toLowerCase().includes("timeline") || content.toLowerCase().includes("cycle");

  return (
    <div className={cn("flex flex-col gap-4 animate-fade-in-up", isUser ? "items-end" : "items-start")}>
      <div className={cn(
        "relative p-6 rounded-[2rem] shadow-elevated transition-all",
        isUser 
          ? "bg-navy text-white rounded-tr-sm max-w-[85%]" 
          : "bg-white border-2 border-gold/20 rounded-tl-sm max-w-full w-full"
      )}>
        {/* User Badge */}
        {isUser && (
          <div className="absolute -top-3 -right-3 h-8 w-8 bg-gold rounded-xl flex items-center justify-center border-2 border-navy shadow-card">
            <User className="h-4 w-4 text-navy" />
          </div>
        )}

        {/* Content */}
        {isUser ? (
          <p className="text-sm font-medium leading-relaxed">{content}</p>
        ) : (
          <div className="space-y-6 text-black">
            <div className="flex items-center gap-3 mb-2">
              <Bot className="h-5 w-5 text-navy" />
              <span className="text-[10px] font-black uppercase tracking-widest text-navy/60">Buddy's Response</span>
            </div>

            <div className="prose-chat prose-sm max-w-none text-black font-medium">
              <ReactMarkdown>{expanded ? mainContent : mainContent.slice(0, 300) + (mainContent.length > 300 ? "..." : "")}</ReactMarkdown>
            </div>

            {!expanded && mainContent.length > 300 && (
              <button 
                onClick={() => setExpanded(true)}
                className="text-xs font-bold text-navy flex items-center gap-1 hover:gap-2 transition-all underline decoration-gold decoration-2 underline-offset-4"
              >
                Deep Dive <ArrowRight className="h-3 w-3" />
              </button>
            )}

            {/* Injected Visual Aids */}
            {!isUser && (
              <div className="space-y-4">
                {isRegistration && (
                  <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-navy font-bold text-xs uppercase tracking-widest">
                      <CheckCircle2 className="h-4 w-4 text-navy" />
                      Registration Checklist
                    </div>
                    <div className="grid gap-2">
                      {["Verify Eligibility", "Gather ID Docs", "Fill Application", "Submit Before Deadline"].map((s, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-black/70">
                          <div className="h-5 w-5 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isVoting && (
                  <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3 text-navy font-bold text-xs uppercase tracking-widest">
                      <Calendar className="h-4 w-4" />
                      Voting Day Prep
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-3 bg-white rounded-xl border border-border text-[10px] text-black/60 italic">
                        "Remember to bring your photo ID and locate your polling station in advance."
                      </div>
                      <ExternalLink className="h-5 w-5 text-navy opacity-30" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions as Chips */}
            {nextSteps.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                {nextSteps.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => onAction(s)}
                    className="px-3 py-1.5 bg-secondary hover:bg-gold hover:text-white rounded-full text-[10px] font-black uppercase tracking-wider text-navy transition-all flex items-center gap-2"
                  >
                    {s}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingCard = () => (
  <div className="flex flex-col items-start gap-4 animate-fade-in-up">
    <div className="bg-white border-2 border-gold/10 rounded-[2rem] rounded-tl-sm p-6 w-full max-w-sm shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="h-5 w-5 text-navy animate-bounce" />
        <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">Buddy is thinking...</span>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full bg-secondary rounded-full animate-pulse" />
        <div className="h-2 w-[80%] bg-secondary rounded-full animate-pulse delay-75" />
        <div className="h-2 w-[90%] bg-secondary rounded-full animate-pulse delay-150" />
      </div>
    </div>
  </div>
);
