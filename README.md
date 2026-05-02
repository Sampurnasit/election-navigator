🗳️ Election Navigator (Ballot Buddy):

Election Navigator is an interactive web application designed to simplify and visualize the complexities of election processes. Whether you're a first-time voter or a political enthusiast, this tool provides a "simulator" experience to help you understand election timelines, participate in challenges, and learn through AI-guided tutoring.

🚀 Key Features

Interactive Election Simulator: Step into the shoes of different roles in the election process and see how decisions impact the outcome.
Dynamic Timelines: Explore election events through both standard and unique Circular Timelines, providing a holistic view of the political calendar.
AI Smart Guide: Get real-time assistance and educational insights from our built-in Smart Guide (powered by AI integrations).
Quiz & Challenge Modes: Test your knowledge with interactive quizzes and scenario-based election challenges.
Learning Journeys: Track your progress as you master different aspects of civic engagement and election law.
Responsive Design: A premium, dark-mode-first aesthetic built for both desktop and mobile users using Shadcn UI and Tailwind CSS.

🛠️ Tech Stack

Frontend: React + Vite
Language: TypeScript
Styling: Tailwind CSS + Shadcn UI
Backend/Database: Supabase
State Management: TanStack Query
Deployment: Firebase Hosting (Auto-deployed via GitHub Actions)
Icons: Lucide React
Charts: Recharts

📦 Getting Started

Prerequisites
Node.js (v18 or higher)
npm or bun
Installation
Clone the repository:

bash
git clone https://github.com/Sampurnasit/election-navigator.git
cd election-navigator
Install dependencies:

bash
npm install
Set up environment variables: Create a .env file in the root and add your Supabase credentials:

env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Start the development server:

bash
npm run dev
📂 Project Structure

text
src/

├── components/     # Reusable UI components (Timeline, Quiz, AI Panel)

│   └── ui/         # Shadcn UI primitives

├── hooks/          # Custom React hooks

├── integrations/   # Supabase and external API configurations

├── pages/          # Main application pages (Landing, Simulator)

├── data/           # Mock data and constants

└── lib/            # Utility functions

🚢 Deployment

The project is configured for Continuous Deployment using GitHub Actions.

Merge to main: Automatically builds and deploys the latest version to Firebase Hosting.
Pull Requests: Generates a preview URL for testing changes before merging.
To deploy manually:

bash

npm run build
firebase deploy
📄 License

Distributed under the MIT License. See LICENSE for more information.

Developed with ❤️ for civic engagement.

