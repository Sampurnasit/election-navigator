import { ClipboardList, Megaphone, Vote, ScrollText, Trophy } from "lucide-react";

export type TimelinePhase = {
  id: string;
  title: string;
  short: string;
  icon: typeof Vote;
  color: string;
  details: string[];
  example: string;
  promptHint: string;
};

export const TIMELINE: TimelinePhase[] = [
  {
    id: "registration",
    title: "Registration",
    short: "Citizens sign up to vote and candidates file to run.",
    icon: ClipboardList,
    color: "bg-sage",
    details: [
      "Eligible citizens add their names to the voter roll",
      "Candidates submit paperwork and meet eligibility rules",
      "Deadlines are often weeks before election day — don't wait!",
    ],
    example: "Maya turns 18, fills out an online form, and is added to her local voter list.",
    promptHint: "Walk me through how to register to vote step-by-step.",
  },
  {
    id: "campaigning",
    title: "Campaigning",
    short: "Candidates share ideas and try to earn your vote.",
    icon: Megaphone,
    color: "bg-gold",
    details: [
      "Speeches, debates, town halls, ads, and door-knocking",
      "Parties publish manifestos (their plans if elected)",
      "A great time to compare policies — not personalities",
    ],
    example: "A televised debate lets you compare three candidates' answers on the same questions.",
    promptHint: "How can I evaluate a candidate's promises fairly?",
  },
  {
    id: "voting-day",
    title: "Voting Day",
    short: "You cast your ballot — in person, by mail, or early.",
    icon: Vote,
    color: "bg-navy",
    details: [
      "Bring valid ID if your region requires it",
      "Mark your choice privately on a paper or digital ballot",
      "Many places offer early voting or mail-in options",
    ],
    example: "Jamal stops at his neighborhood school, marks his ballot, and drops it in the box.",
    promptHint: "What should I bring with me when I go to vote?",
  },
  {
    id: "counting",
    title: "Counting",
    short: "Officials tally every ballot, watched by observers.",
    icon: ScrollText,
    color: "bg-rose",
    details: [
      "Counting begins when polls close — sometimes earlier for mail ballots",
      "Independent observers can watch to ensure fairness",
      "Close races may require recounts or audits",
    ],
    example: "Volunteers from different parties watch a counting room together to verify totals.",
    promptHint: "What happens between polls closing and the result being announced?",
  },
  {
    id: "results",
    title: "Results",
    short: "Winners are declared and the new term begins.",
    icon: Trophy,
    color: "bg-gold",
    details: [
      "Official results are certified after audits and any legal challenges",
      "Losing candidates traditionally concede to ensure a peaceful transition",
      "The winners are sworn in to start their term of office",
    ],
    example: "After certification, the elected representative is sworn in and begins their term.",
    promptHint: "What happens after the winner is announced?",
  },
];
