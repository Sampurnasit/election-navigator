// Multi-step guided lessons — the "tutor" experience
import { ClipboardList, Vote, Megaphone, ScrollText, Users } from "lucide-react";

export type LessonStep = {
  title: string;
  body: string; // markdown
  tip?: string;
  checkpoint?: {
    question: string;
    options: { label: string; correct?: boolean; feedback: string }[];
  };
  askPrompt?: string; // suggested follow-up to send to chat
};

export type Lesson = {
  id: string;
  title: string;
  blurb: string;
  icon: typeof Vote;
  audience: "voter" | "candidate" | "volunteer" | "everyone";
  estMinutes: number;
  steps: LessonStep[];
};

export const LESSONS: Lesson[] = [
  {
    id: "first-time-voter",
    title: "Your first time voting",
    blurb: "From registration to dropping your ballot — the calm 5-step walkthrough.",
    icon: Vote,
    audience: "voter",
    estMinutes: 4,
    steps: [
      {
        title: "Step 1 · Check if you can vote",
        body:
          "Most countries require you to be:\n\n- A **citizen** (or sometimes a long-term resident)\n- Above the **minimum voting age** (often 18)\n- **Registered** on the official voter list\n\nIf you're unsure, your country's election commission website is the best place to confirm.",
        tip: "Eligibility rules are local. When in doubt, search '[your country] voter eligibility' on an official .gov site.",
      },
      {
        title: "Step 2 · Register (if you haven't already)",
        body:
          "Registration adds your name to the official voter roll. Typically you'll need:\n\n- A **valid ID** (passport, national ID, driver's license)\n- **Proof of address** (utility bill, bank statement)\n- Maybe a **citizenship document**\n\nMany regions let you register **online** in under 5 minutes.",
        checkpoint: {
          question: "What's the most common reason someone shows up to vote and can't?",
          options: [
            { label: "They forgot their lucky pen", feedback: "Cute — but no. The big one is registration." },
            { label: "They never registered or missed the deadline", correct: true, feedback: "Exactly. Deadlines often close weeks before election day." },
            { label: "They wore the wrong color", feedback: "Not a real rule anywhere." },
          ],
        },
      },
      {
        title: "Step 3 · Find your polling place",
        body:
          "Your **polling station** is usually assigned based on your registered address. You can typically:\n\n- Look it up on your election commission's site\n- Get a postcard or SMS with your assigned location\n- Vote **early** or by **mail** in many places\n\nPlan your route the day before — and check opening hours.",
        askPrompt: "How do I find my assigned polling place?",
      },
      {
        title: "Step 4 · Voting day — what to expect",
        body:
          "On voting day:\n\n1. **Bring your ID** (if required)\n2. Officials check your name on the voter roll\n3. You receive a **ballot** (paper or electronic)\n4. You mark your choice **in private**\n5. You drop it in the box or submit it\n\nYou'll get a thank-you and sometimes a sticker. That's it!",
        tip: "Photos of your marked ballot are illegal in many places — keep your phone away in the booth.",
      },
      {
        title: "Step 5 · After you vote",
        body:
          "Once polls close, **counting begins**:\n\n- Volunteers and observers tally votes\n- Results are released area-by-area\n- Final certification can take days for close races\n\nYou helped shape the outcome. Congratulations on showing up — that's the whole job. 🎉",
        askPrompt: "What happens between polls closing and the official result being announced?",
      },
    ],
  },
  {
    id: "running-as-candidate",
    title: "So you want to run for office",
    blurb: "The general path from 'I'm thinking about it' to 'I'm on the ballot'.",
    icon: Megaphone,
    audience: "candidate",
    estMinutes: 5,
    steps: [
      {
        title: "Step 1 · Confirm you're eligible",
        body:
          "Most elected positions have specific requirements:\n\n- **Citizenship** and residency in the area\n- A **minimum age** (often higher than the voting age)\n- No certain criminal disqualifications\n- Sometimes party membership for primaries\n\nLook up the role on your election commission's site.",
      },
      {
        title: "Step 2 · Decide how to run",
        body:
          "You usually have two paths:\n\n- **Party candidate** — get nominated by an existing party\n- **Independent** — gather signatures or pay a fee to file directly\n\nEach has trade-offs: parties offer infrastructure; independents have full message control.",
        checkpoint: {
          question: "What do independent candidates usually need to get on the ballot?",
          options: [
            { label: "A famous endorsement", feedback: "Helps, but isn't required." },
            { label: "Signatures from voters and/or a filing fee", correct: true, feedback: "Yes — this proves baseline support." },
            { label: "A campaign slogan", feedback: "Important for branding, but not for ballot access." },
          ],
        },
      },
      {
        title: "Step 3 · File your paperwork",
        body:
          "You'll typically need to submit:\n\n- A **declaration of candidacy** form\n- **Financial disclosure** documents\n- Required **signatures** or fee\n- A designated **campaign treasurer**\n\nMiss the deadline by an hour and you're out — set 3 reminders.",
        tip: "Most regions cap how much one person can donate to your campaign. Know the limit before fundraising.",
      },
      {
        title: "Step 4 · Build your campaign",
        body:
          "A small campaign usually has:\n\n- A **clear message** (3–5 priorities, max)\n- A **volunteer team** for outreach\n- A **budget** for ads, materials, events\n- **Door-knocking** plans — still the highest-converting outreach\n\nStart small. Win trust block by block.",
        askPrompt: "What's the most cost-effective campaign tactic for a first-time candidate?",
      },
      {
        title: "Step 5 · Election day & after",
        body:
          "On election day:\n\n- Get out the vote (GOTV) — call supporters, offer rides\n- Have **poll watchers** at counting stations if your region allows\n- Prepare both a **victory** and **concession** statement\n\nWin or lose, the relationships you build often outlast the campaign.",
      },
    ],
  },
  {
    id: "volunteer-path",
    title: "Helping run a fair election",
    blurb: "How volunteers and poll workers keep elections trustworthy.",
    icon: Users,
    audience: "volunteer",
    estMinutes: 3,
    steps: [
      {
        title: "Step 1 · Pick your role",
        body:
          "Common volunteer roles:\n\n- **Poll worker** — staff a polling station on election day\n- **Poll observer** — watch the process for a party or NGO\n- **Voter educator** — help neighbors register and prepare\n- **Counter / canvasser** — help tally results\n\nMost are paid a small stipend or are pure volunteer.",
      },
      {
        title: "Step 2 · Get trained",
        body:
          "Election authorities provide free training that covers:\n\n- How to **verify voter ID**\n- How to **handle ballots** securely\n- What to do if a voter has a **problem**\n- Strict rules on **neutrality** — you can't wear party gear on duty\n\nTraining is usually 2–4 hours, online or in-person.",
        checkpoint: {
          question: "Why can't poll workers wear campaign t-shirts on duty?",
          options: [
            { label: "It's a fashion thing", feedback: "Not quite — there's a real reason." },
            { label: "To keep the polling place politically neutral for every voter", correct: true, feedback: "Right. Neutrality is the foundation of voter trust." },
            { label: "Because uniforms look more official", feedback: "Many places don't even use uniforms." },
          ],
        },
      },
      {
        title: "Step 3 · Be the calm in the room",
        body:
          "On the day:\n\n- Greet every voter with patience\n- Explain steps clearly, especially to first-timers\n- Document any irregularities — don't react emotionally\n- Trust the process and follow your training\n\nYou're a quiet hero of democracy.",
        askPrompt: "What should I do if I see something that seems wrong at a polling station?",
      },
    ],
  },
  {
    id: "election-cycle-basics",
    title: "How an election cycle actually works",
    blurb: "The 4-stage rhythm: register → campaign → vote → count.",
    icon: ScrollText,
    audience: "everyone",
    estMinutes: 3,
    steps: [
      {
        title: "Stage 1 · Setting the stage",
        body:
          "Before campaigning starts, the system gets ready:\n\n- An **election date** is officially announced\n- **Voter registration** opens (or is updated)\n- **Candidates** file paperwork to run\n- **Election rules** are published (spending limits, ad rules, etc.)",
      },
      {
        title: "Stage 2 · The campaign",
        body:
          "Candidates and parties try to earn your vote through:\n\n- **Speeches & rallies**\n- **Debates** (great for comparison shopping!)\n- **Door-knocking & phone banking**\n- **Ads** — TV, radio, social media\n- **Manifestos** — written promises if elected",
        tip: "Compare what candidates *would do* (policies), not just what they *say about each other*.",
      },
      {
        title: "Stage 3 · Voting",
        body:
          "Voting can happen across multiple modes:\n\n- **Election day** in-person\n- **Early voting** (days/weeks before)\n- **Mail-in / postal voting**\n- **Overseas voting** for citizens abroad\n\nThe goal: make voting accessible while keeping it secure.",
        checkpoint: {
          question: "Why do many countries offer early or mail voting?",
          options: [
            { label: "To increase access for people who can't make it on election day", correct: true, feedback: "Yes — work, travel, illness, and care duties shouldn't block your vote." },
            { label: "To save paper", feedback: "Mail voting actually uses more paper, not less." },
            { label: "To get faster results", feedback: "The opposite — counting often takes longer." },
          ],
        },
      },
      {
        title: "Stage 4 · Counting & certifying",
        body:
          "After polls close:\n\n- **Ballots are counted** at each polling place\n- Results are **transmitted** to a central authority\n- **Observers** from multiple parties verify\n- Results are **certified** after audits\n- A **peaceful transition** of power follows\n\nThis last step is the quiet miracle of democracy.",
        askPrompt: "What is a recount and when does one happen?",
      },
    ],
  },
];
