# Multisession Grid Game

A minimal full-stack project for the assignment.

- **Client:** React + TypeScript + Vite, renders a 3×6 SVG grid.
- **Server:** Node + TypeScript + Express + Socket.IO, holds the shared game state in memory.
- **Realtime:** Socket.IO syncs the game state across all connected clients.

## Features

### Core Game Rules
- Initial valid board (no adjacent same shape or color).
- Clicking a cell changes **both** its shape and color to a valid random pair.
- +1 score per valid click. Turn increments, and all cooldowns decrement by 1.
- Clicked cell enters a **3-turn cooldown**.
- If no valid pair exists for a clicked cell → **game over**.
- **Reset** button regenerates a fresh valid board (dev/debug convenience).

### Bonus 1 — Leaderboard
- After **game over**, the client prompts for a nickname and submits the score.
- The **Leaderboard** button shows the **top 10 scores** in a modal.
- Scores are stored server-side in `data/leaderboard.json` (top 100 persisted).
- Leaderboard is not synced in real time (only fetched on demand).

### Bonus 2 — SVG shapes
- Cells render as colored SVG: circle, square, diamond, triangle.

---

## Quick Start

### 1) Server
```bash
cd server
npm install
npm run dev
# Server runs at http://localhost:3001
```

**Scripts (server/package.json)**:
- `dev`: run with `tsx watch src/index.ts`
- `build`: `tsc -p tsconfig.json`
- `start`: run compiled `dist/index.js`

**Leaderboard Endpoints**
- `GET /leaderboard/top?limit=10`  
  → `{ top: Array<{ nickname, score, playedAt }> }`
- `POST /leaderboard/submit` with JSON `{ nickname, score }`  
  → stored entry returned

Config:
- TypeScript rootDir: `src`, outDir: `dist`

---

### 2) Client
```bash
cd client
npm install
npm run dev
# Open http://localhost:5173
```

**Scripts (client/package.json)**:
- `dev`: run Vite dev server
- `build`: compile & bundle
- `preview`: preview production build

If your server runs elsewhere, configure:
```env
# client/.env
VITE_SERVER_URL=http://localhost:3001
```

**TypeScript config:**
- Uses path alias `@shared/*` → `../shared/*`

---

## How It Works

1. **Server State**
  - Holds `{ board, score, turn, gameOver }`.
  - On connection or update, broadcasts `state` to all clients.

2. **Clicks**
  - Client emits `{ row, col }`.
  - Server ignores clicks if on cooldown or `gameOver`.
  - Valid `(shape,color)` pairs = differ from neighbors **and** from current.
  - If no valid pair → `gameOver = true`.  
    Otherwise: choose random valid pair, set cooldown=3, increment score, advance turn, decrement all cooldowns, broadcast.

3. **Leaderboard**
  - When `gameOver=true`, client prompts for nickname → posts to `/leaderboard/submit`.
  - Leaderboard button fetches `/leaderboard/top` and shows modal with top 10.

---

## Tech Stack

**Client**
- React 18
- Vite 5
- TypeScript 5
- socket.io-client 4

**Server**
- Express 4
- Socket.IO 4
- TypeScript 5
- tsx for dev

---

## Notes & Next Steps
- Runs with a **single game instance** in memory.
- For multiple server nodes: move state to Redis/Postgres and use Socket.IO Redis adapter.
- Leaderboard persistence uses a JSON file for simplicity. Replace with SQLite/Redis for concurrency.
