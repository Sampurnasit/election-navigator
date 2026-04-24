// Quiz questions for the Election IQ mode
export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What does it usually mean to 'register to vote'?",
    options: [
      "Pay a fee to vote",
      "Add your name to the official list of eligible voters",
      "Choose which candidate you'll vote for",
      "Volunteer at a polling station",
    ],
    correctIndex: 1,
    explanation:
      "Registering means adding your name to the electoral roll so officials know you're eligible. It's almost always free.",
  },
  {
    id: 2,
    question: "What is a 'ballot'?",
    options: [
      "A type of political party",
      "The form (paper or digital) you use to mark your vote",
      "A campaign rally",
      "A live TV debate",
    ],
    correctIndex: 1,
    explanation:
      "A ballot is the document you use to record your choice — paper, electronic, or sometimes mailed in.",
  },
  {
    id: 3,
    question: "What is a 'polling station'?",
    options: [
      "A TV news desk that polls voters",
      "The place where you go to cast your vote in person",
      "An online survey website",
      "A candidate's campaign office",
    ],
    correctIndex: 1,
    explanation:
      "A polling station (or polling place) is the physical location — often a school or community center — where you vote in person.",
  },
  {
    id: 4,
    question: "What's typically the FIRST stage of an election cycle?",
    options: [
      "Vote counting",
      "Voter registration & candidate nominations",
      "Election day",
      "The victory speech",
    ],
    correctIndex: 1,
    explanation:
      "The cycle usually opens with people registering to vote and candidates filing to run. Campaigning, voting day, and counting come later.",
  },
  {
    id: 5,
    question: "What is 'turnout'?",
    options: [
      "How candidates dress for debates",
      "The percentage of eligible voters who actually vote",
      "The number of campaign ads broadcast",
      "How long it takes to count votes",
    ],
    correctIndex: 1,
    explanation:
      "Turnout = (votes cast ÷ eligible voters) × 100. Higher turnout generally means a more representative result.",
  },
  {
    id: 6,
    question: "What does a 'secret ballot' protect?",
    options: [
      "The candidate's policy plans",
      "Your right to vote without anyone knowing your choice",
      "Vote-counting software",
      "The location of polling stations",
    ],
    correctIndex: 1,
    explanation:
      "A secret ballot ensures nobody can see how you voted — it shields you from pressure, bribery, or retaliation.",
  },
];
