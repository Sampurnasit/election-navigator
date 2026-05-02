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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/integrations/firebase";
import type { UserRole } from "@/components/RoleSelector";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

export type UserContext = {
  region?: string;
  firstTime?: boolean;
  role?: UserRole | string;
  simpleMode?: boolean;
};

const FALLBACK_FOLLOW_UPS = [
  "Explain elections like I'm 15",
  "What happens after voting ends?",
  "When should I register?",
  "How is my vote kept secret?",
];

const STARTERS_BY_ROLE: Record<string, { label: string; prompt: string }[]> = {
  voter: [
    { label: "How do I register?", prompt: "How do I register to vote? What do I need?" },
    { label: "What to expect on voting day", prompt: "What should I expect when I show up to vote in person for the first time?" },
    { label: "Mail or in-person?", prompt: "What's the difference between voting by mail and in-person, and how do I decide?" },
    { label: "How my vote stays secret", prompt: "How do elections keep my individual vote private and secure?" },
  ],
  candidate: [
    { label: "Am I eligible to run?", prompt: "What are typical eligibility requirements to run for office?" },
    { label: "Party vs. independent", prompt: "Should I run as a party candidate or as an independent? Pros and cons?" },
    { label: "What paperwork do I file?", prompt: "What forms and paperwork does a first-time candidate usually file?" },
    { label: "Building a small campaign", prompt: "How do first-time candidates build a small but effective campaign?" },
  ],
  volunteer: [
    { label: "How can I help?", prompt: "What are the most common ways to volunteer in an election?" },
    { label: "Becoming a poll worker", prompt: "Walk me through becoming a poll worker step-by-step." },
    { label: "Staying neutral on duty", prompt: "Why do election volunteers have to stay neutral, and what does that mean in practice?" },
    { label: "Reporting irregularities", prompt: "What should I do if I see something that looks wrong at a polling station?" },
  ],
  curious: [
    { label: "How elections work, simply", prompt: "Explain how elections work like I'm 15." },
    { label: "What's an election cycle?", prompt: "Walk me through what a typical election cycle looks like from start to finish." },
    { label: "Why turnout matters", prompt: "Why does voter turnout matter and what affects it?" },
    { label: "What's a recount?", prompt: "What is a recount and when does one happen?" },
  ],
  default: [
    { label: "Voting process", prompt: "Walk me through the voting process step-by-step." },
    { label: "Election timeline", prompt: "What does a typical election cycle look like from start to finish?" },
    { label: "How to register", prompt: "How do I register to vote? What do I need?" },
    { label: "How to become a candidate", prompt: "What does it take to become a candidate in an election?" },
  ],
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/election-chat`;

interface ChatPanelProps {
  externalPrompt?: { text: string; nonce: number } | null;
  externalContext?: UserContext;
}

/** Strip the "### Next steps" trailing block so it doesn't render twice. */
const stripNextSteps = (text: string) =>
  text.replace(/\n*###\s*Next steps[\s\S]*$/i, "").trim();

/** Pull "### Next steps" bullets out of a streamed AI message. */
const parseNextSteps = (text: string): string[] => {
  const m = text.match(/###\s*Next steps\s*\n([\s\S]*)$/i);
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.replace(/^\s*[-*•]\s*/, "").replace(/^["“]|["”]$/g, "").trim())
    .filter((l) => l.length > 0 && l.length < 120)
    .slice(0, 3);
};

export const ChatPanel = ({ externalPrompt, externalContext }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState<UserContext>({});
  const [showSetup, setShowSetup] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Merge external context (region/role) into local context
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt?.nonce]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setShowSetup(false);
    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    
    trackEvent("ai_chat_message_sent", { 
      role: ctx.role || "unknown",
      has_region: !!ctx.region 
    });

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

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Slow down a moment",
            description: "Too many requests. Please wait a few seconds and try again.",
            variant: "destructive",
          });
        } else if (resp.status === 402) {
          toast({
            title: "AI credits exhausted",
            description: "Please add credits to your Lovable workspace.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Something went wrong",
            description: "Couldn't reach the assistant. Please try again.",
            variant: "destructive",
          });
        }
        setMessages((prev) => prev.slice(0, -1));
        setLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "" || !raw.startsWith("data: ")) continue;
          const json = raw.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Connection problem",
        description: "Could not connect to the assistant.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setShowSetup(true);
    setInput("");
  };

  const lastMessage = messages[messages.length - 1];
  const aiSuggestions =
    lastMessage?.role === "assistant" && !loading
      ? parseNextSteps(lastMessage.content)
      : [];
  const quickReplies = aiSuggestions.length ? aiSuggestions : FALLBACK_FOLLOW_UPS;

  const starterRole = (ctx.role as string) || "default";
  const starters = STARTERS_BY_ROLE[starterRole] || STARTERS_BY_ROLE.default;

  return (
    <div className="flex flex-col h-full rounded-3xl border border-border bg-gradient-card shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-card">
            <Bot className="h-5 w-5 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink leading-tight">
              Ballot Buddy
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
              <p className="text-[11px] text-muted-foreground">
                {ctx.region
                  ? `Tutoring · ${ctx.region}`
                  : ctx.role
                  ? `Tutoring the ${ctx.role} path`
                  : "Friendly · Neutral · Always learning"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCtx((c) => ({ ...c, simpleMode: !c.simpleMode }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth border",
              ctx.simpleMode
                ? "bg-gold text-ink border-gold shadow-gold"
                : "bg-card text-ink-soft border-border hover:border-gold",
            )}
            title="Toggle simple-language mode"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Explain simply</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-card text-ink-soft border border-border hover:border-gold transition-smooth"
              title="Start a new conversation"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-6 py-5">
        {showSetup && messages.length === 0 ? (
          <div className="max-w-xl mx-auto py-4 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-gold items-center justify-center shadow-gold mb-3">
                <Sparkles className="h-7 w-7 text-ink" strokeWidth={2.2} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
                Hi! I'm Ballot Buddy.
              </h2>
              <p className="text-ink-soft mt-2 text-sm md:text-base leading-relaxed">
                I'll be your personal election tutor — step by step, in plain language.
                <br />
                What would you like to learn about?
              </p>
            </div>

            {/* Personalization */}
            <div className="rounded-2xl border border-border bg-background/60 p-4 mb-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                <GraduationCap className="h-3.5 w-3.5" />
                A quick intro (optional)
              </div>

              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-ink-soft shrink-0" />
                <input
                  type="text"
                  placeholder="Country or region (e.g. India, EU, Brazil)…"
                  value={ctx.region || ""}
                  onChange={(e) => setCtx((c) => ({ ...c, region: e.target.value }))}
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted-foreground focus:outline-none border-b border-transparent focus:border-gold transition-colors py-1"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={!!ctx.firstTime}
                  onChange={(e) => setCtx((c) => ({ ...c, firstTime: e.target.checked }))}
                  className="h-4 w-4 rounded border-border text-navy focus:ring-ring accent-navy"
                />
                I'm a first-time voter
              </label>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2 text-center">
              {ctx.role ? `Suggested for the ${ctx.role} path` : "Pick a topic to start"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {starters.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.prompt)}
                  className="text-left rounded-xl border border-border bg-card hover:bg-secondary/60 hover:border-gold p-3 transition-smooth group"
                >
                  <p className="font-semibold text-sm text-ink">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 group-hover:text-ink-soft">
                    {s.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl mx-auto">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <TypingBubble />
            )}
          </div>
        )}
      </div>

      {/* Quick replies (AI-suggested next steps) */}
      {!showSetup && messages.length > 0 && !loading && (
        <div className="px-4 md:px-6 pb-2 pt-2 border-t border-border bg-background/40">
          {aiSuggestions.length > 0 && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold mb-1.5 px-1">
              Suggested next steps
            </p>
          )}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-2">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth inline-flex items-center gap-1.5",
                  aiSuggestions.length > 0
                    ? "border-gold/60 bg-gold/10 text-ink hover:bg-gold/20"
                    : "border-border bg-card text-ink-soft hover:border-gold hover:bg-secondary/60",
                )}
              >
                {q}
                <ArrowRight className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-background/60 backdrop-blur p-3 md:p-4">
        <div className="flex items-end gap-2 rounded-2xl bg-card border border-border focus-within:border-gold transition-colors px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            aria-label="Ask about elections"
            placeholder="Ask anything about elections…"
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-ink placeholder:text-muted-foreground focus:outline-none py-1.5 max-h-32"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center transition-smooth shrink-0",
              input.trim() && !loading
                ? "bg-navy text-primary-foreground hover:bg-navy-deep shadow-card"
                : "bg-secondary text-muted-foreground cursor-not-allowed",
            )}
            aria-label="Send"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2 px-2">
          Ballot Buddy is non-partisan. For exact dates and rules, always check your official election authority.
        </p>
      </div>
    </div>
  );
};

const MessageBubble = ({ role, content }: { role: Role; content: string }) => {
  const isUser = role === "user";
  const visibleContent = isUser ? content : stripNextSteps(content);
  return (
    <div className={cn("flex gap-3 animate-fade-in-up", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
          isUser ? "bg-secondary text-ink" : "bg-gradient-hero text-primary-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[78%] shadow-soft",
          isUser
            ? "bg-navy text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm text-ink",
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown>{visibleContent || "…"}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

const TypingBubble = () => (
  <div className="flex gap-3 animate-fade-in-up">
    <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-hero text-primary-foreground shrink-0">
      <Bot className="h-4 w-4" />
    </div>
    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-card border border-border shadow-soft">
      <div className="flex items-center gap-1.5 h-5">
        <span className="h-2 w-2 rounded-full bg-navy animate-pulse-dot" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-navy animate-pulse-dot" style={{ animationDelay: "200ms" }} />
        <span className="h-2 w-2 rounded-full bg-navy animate-pulse-dot" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  </div>
);
