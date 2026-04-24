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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

export type UserContext = {
  region?: string;
  firstTime?: boolean;
  role?: string;
  simpleMode?: boolean;
};

const STARTERS = [
  { label: "Voting process", prompt: "Walk me through the voting process step-by-step." },
  { label: "Election timeline", prompt: "What does a typical election cycle look like from start to finish?" },
  { label: "How to register", prompt: "How do I register to vote? What do I need?" },
  { label: "How to become a candidate", prompt: "What does it take to become a candidate in an election?" },
];

const FOLLOW_UPS = [
  "Explain elections like I'm 15",
  "What happens after voting ends?",
  "When should I register?",
  "How is my vote kept secret?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/election-chat`;

interface ChatPanelProps {
  externalPrompt?: { text: string; nonce: number } | null;
}

export const ChatPanel = ({ externalPrompt }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ctx, setCtx] = useState<UserContext>({});
  const [showSetup, setShowSetup] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
              <p className="text-[11px] text-muted-foreground">Friendly · Neutral · Always learning</p>
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
                I'll help you understand elections — step by step, in plain language.
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
              Pick a topic to start
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    setCtx((c) => ({ ...c, role: s.label }));
                    send(s.prompt);
                  }}
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

      {/* Quick replies */}
      {!showSetup && messages.length > 0 && !loading && (
        <div className="px-4 md:px-6 pb-2 pt-1 border-t border-border bg-background/40">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin py-2">
            {FOLLOW_UPS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-border bg-card hover:border-gold hover:bg-secondary/60 px-3 py-1.5 text-xs font-medium text-ink-soft transition-smooth"
              >
                {q}
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
            <ReactMarkdown>{content || "…"}</ReactMarkdown>
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
