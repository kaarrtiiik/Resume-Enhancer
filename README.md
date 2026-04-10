# AI Resume Enhancer

Turn messy text into professional gold. A beautiful, premium Next.js 15 tool powered by Google Gemini 2.5 Flash.

## Tech Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- shadcn/ui components
- @google/generative-ai (Gemini 2.5 Flash)
- jspdf & html2canvas (Export to PDF)
- Lucide React (Icons)

## Setup & Running Locally

1. Install Dependencies
   ```bash
   npm install
   ```
2. Setup Environment Variable
   Rename `.env.example` to `.env.local` and add your Gemini API key.
   You can get a free Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey).
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. Run the Development Server
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features
- Clean, responsive glassmorphic dark-mode UI
- Multi-purpose tabs (Resume Bullets, Professional Bio, LinkedIn Summary)
- AI-based enhancement running over Server Actions
- Fully anonymous usage (no auth/DB needed), histories are stored in LocalStorage
- Real-time download format to professional PDF layout

## Deployment
Perfectly compatible with Vercel out of the box. Just plug in `GEMINI_API_KEY` to Vercel Environment Variables when importing the project.
