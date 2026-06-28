# Panicmode.ai — Proactive Rescue & Triage Agent

Panicmode.ai is an autonomous, proactive executive-assistant agent designed to disrupt the human paralysis cycle caused by extreme cognitive overwhelm. Instead of presenting the user with passive, cluttered task boards, the application runs a real-time, server-side triage that extracts a single primary focus target, splits it into micro-steps, simulates automated calendar and reminder allocations, and isolates the remaining tasks safely in a "Backlog Guard" to clear distraction.

Featuring a beautiful, high-contrast **"Clean Minimalism"** visual theme, this platform prioritizes spaciousnegative space, premium typography pairing, and action-oriented micro-interactions.

---

## 🎨 Design Philosophy & Aesthetic

Panicmode.ai is built around the **"Clean Minimalism"** theme to reduce cognitive friction:
- **Calm, High-Contrast Palette**: Pure off-white canvases (`#FDFDFD`) paired with rich charcoal/black values (`#1A1A1B`) to prevent sensory overload.
- **Typography Rhythm**: Sophisticated display headings paired with clean monospace labels (`Inter` and `JetBrains Mono`) for structured indicators.
- **Micro-Animations**: Purposeful micro-vibrations, pulse states, and smooth spring transitions (powered by `motion`) to highlight active focus zones.
- **Anti-Distraction Railing**: Outlines, borders, and margins are kept to a clean, single-pixel hairline grey setup (`border-gray-100` / `border-gray-200`) to maximize clear empty space.

---

## 🧠 Core Application Workflows

### 1. The Autonomous Triage (Brain-Dump Engine)
- **Problem**: When a user experiences overwhelm, listing tasks manually is mentally expensive.
- **Solution**: The user enters an unstructured, chaotic brain-dump text containing deadlines, feelings, or chores.
- **Operation**: The backend parses the query, calculates cognitive weight, isolates the highest impact target, constructs small executable micro-steps, and hides the non-essential tasks safely inside the **Backlog Guard**.

### 2. Zero-Friction Active Focus Zone
- **Micro-Sprint Timer**: Provides rapid action-oriented presets (2-minute, 5-minute, and 10-minute sprints) to force brief focused momentum with no high stakes.
- **Proactive Assist Drafts**: If a task requires writing (e.g., asking for a deadline extension or writing an operational audit update), the agent automatically drafts a highly articulate template directly in the UI.
- **The Stuck Roadblock Protocol**: If a user hits a mental block, clicking "I'm Stuck" analyzes the specific bottleneck and splits the step further into an absolute easiest, 30-second action.
- **The Handoff Bar**: A simple, terminal-like handshake input. Typing `done` or pressing `ENTER` automatically pushes progress to the next actionable step.

### 3. Integrated Rescue Companion Chat
- Interactive, server-side guard agent who keeps you accountable.
- Generates motivation strategy adjustments in real-time.
- Pre-loaded with friction-reducing command templates.

---

## 🛠️ Project Architecture & Configuration

The project is structured as a full-stack modern React (Vite) + Express application written in TypeScript.

```
├── server.ts                 # Full-stack CJS Express entry point (Port 3000)
├── package.json              # Dependency configurations & build actions
├── src/
│   ├── main.tsx              # React mounting entry point
│   ├── App.tsx               # Main state routing & view switcher
│   ├── types.ts              # Centralized strongly typed interfaces
│   ├── index.css             # Tailwind @import global configuration
│   └── components/
│       ├── Header.tsx        # Top status bar with live clock, status & Back to Home
│       ├── TriageForm.tsx    # Initial welcome screen & raw brain-dump input
│       ├── FocusZone.tsx     # Current target workspace, timer, handoff, stuck roadblock
│       ├── BacklogView.tsx   # Sequestered task guardian with manual promotion
│       └── CompanionChat.tsx # Accountability chat assistant with friction-reducing templates
```

### Server Configuration (`server.ts`)
The backend is powered by **Express**. It handles:
- **Triage Parsing Endpoint**: `/api/panic/triage`
- **Roadblock Breakdown Endpoint**: `/api/panic/stuck`
- **Interactive Companion Endpoint**: `/api/panic/chat`
- **Dev-Vite Middleware Integration**: Automatically provisions Vite's middleware pipeline on development stages, fallback static routing in production.

---

## ⚙️ Development & Production Scripts

All dependencies and builds are managed natively via `npm`.

### Dev Server Startup
To boot up the unified development environment (Express API + Vite Dev Server):
```bash
npm run dev
```
*Runs on host `0.0.0.0` and port `3000` behind an reverse-proxy routing layer.*

### Production Build Sequence
Compiles the client-side single-page app and bundles the server code into a self-contained, high-performance CommonJS file to ensure compatibility and fast container startups:
```bash
npm run build
```

### Production Runtime
Launches the compiled standalone server:
```bash
npm run start
```

---

## 🔒 Environment Secrets

If utilizing live external services (e.g., Gemini models or database channels), declare variables inside `.env`:
```env
# Example Env file
GEMINI_API_KEY=your-gemini-secret-api-key
```
*Note: Always keep keys server-side; clients should only trigger proxies to prevent exposing credentials in browser developer tools.*
