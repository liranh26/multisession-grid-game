# Multisession Grid Game

A minimal full‑stack template for the home assignment:
- **Client:** React + TypeScript + Vite, renders a 3×6 SVG grid.
- **Server:** Node + TypeScript + Express + Socket.IO, holds the single shared game state in memory.
- **Realtime:** Socket.IO syncs the game state across all connected clients.
- **Rules implemented:** 
  - Initial valid board (no adjacent same shape or color).
  - Click changes **both** shape and color to a valid random pair.
  - +1 score per valid click. Turn advances; all cooldowns decrement by 1.
  - A clicked cell goes on **3‑turn cooldown**.
  - If no valid pair exists for a clicked cell → **game over**.
- **Bonus 2:** SVG shapes are used.

> This is intentionally lightweight (no tests/linters), so you can deliver quickly.

## Quick Start

### 1) Install
```bash
# in one terminal
cd server
npm i
npm run dev
# server listens on http://localhost:3001

# in another terminal
cd client
npm i
npm run dev
# open http://localhost:5173
```

> If you run the client on another host/port, set `VITE_SERVER_URL` in `client/.env`:
> ```env
> VITE_SERVER_URL=http://localhost:3001
> ```

### 2) How it works
- The **server** keeps `{ board, score, turn, gameOver }`. On client connect or any update, it emits `state` to everyone.
- **Clicks** are sent as `{row, col}`. The server validates:
  - If the cell is on cooldown or game is over → ignored.
  - Compute all valid `(shape,color)` pairs that differ from all 4‑way neighbors and **both** differ from the current pair.
  - If none → set `gameOver=true`. Otherwise pick a random pair, set `cooldown=3`, increment `score`, advance `turn`, decrement all cooldowns by 1, broadcast state.
- **Reset**: A convenience action to regenerate a valid board during development.

### 3) Notes & Next Steps
- This template runs with a **single game instance** in memory.
- For the **leaderboard (bonus)**, store `{nickname, score, finishedAt}` in a simple JSON/SQLite/Redis file/db and add routes & UI.
- For **horizontal scaling**, put Socket.IO behind a compatible adapter (e.g., Redis adapter) and move game state to Redis/Postgres.

## Tech
- React 18, Vite 5, TypeScript 5
- Express 4, Socket.IO 4
- No tests/linters per assignment constraints
