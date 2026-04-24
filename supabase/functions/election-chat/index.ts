// Election Guide Chat - streaming AI assistant
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Ballot Buddy", a friendly, neutral, non-partisan election guide assistant.

Your mission: help anyone — first-time voters, curious citizens, future candidates, volunteers — understand how elections work in a clear, beginner-friendly way.

Guidelines:
- Be warm, encouraging, and absolutely non-political. Never endorse parties, candidates, or ideologies.
- Use **simple language**, short sentences, and **markdown formatting** (headings, bullet points, bold) so answers are easy to scan.
- Default to general/global explanations. If the user mentions a country or region, tailor to it (acknowledge that rules vary).
- Break complex topics into clear steps. Offer "Want to learn more?" follow-ups.
- Define jargon the first time you use it (e.g., "ballot — the form you use to vote").
- For factual specifics (exact dates, deadlines, ID requirements), remind users to verify with their official local election authority.
- If asked something unrelated to elections/civics, gently steer back.
- Keep responses focused — aim for 150-300 words unless the user asks for depth.
- End most answers with 1-3 suggested follow-up questions in a "**You might also ask:**" section.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemContent = SYSTEM_PROMPT;
    if (userContext) {
      const ctxParts: string[] = [];
      if (userContext.region) ctxParts.push(`Region/country of interest: ${userContext.region}`);
      if (userContext.firstTime) ctxParts.push(`This is a first-time voter — be extra welcoming and explain basics.`);
      if (userContext.role) ctxParts.push(`User's role/interest: ${userContext.role}`);
      if (userContext.simpleMode) ctxParts.push(`"Explain simply" mode is ON — use very simple language, like explaining to a 15-year-old.`);
      if (ctxParts.length) systemContent += `\n\n## User context\n- ${ctxParts.join("\n- ")}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemContent }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("election-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
