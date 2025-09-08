// server/src/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
export type Shape = "triangle" | "square" | "diamond" | "circle";
export type Color = "red" | "green" | "blue" | "yellow";

export interface Cell {
  shape: Shape;
  color: Color;
  cooldown: number;
}

export interface GameState {
  board: Cell[][];
  score: number;
  turn: number;
  gameOver: boolean;
}

export interface ClickPayload {
  row: number;
  col: number;
}

export const SHAPES: Shape[] = ["triangle","square","diamond","circle"];
export const COLORS: Color[] = ["red","green","blue","yellow"]; // ← this one
export const ROWS = 3;
export const COLS = 6;


// ----- helpers -----
const randomOf = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

const neighbors = (r: number, c: number) => {
  const n: Array<[number, number]> = [
    [r-1, c],
    [r+1, c],
    [r, c-1],
    [r, c+1],
  ];
  return n.filter(([rr, cc]) => inBounds(rr, cc));
};

const isValidPairAgainstNeighbors = (
  board: Cell[][],
  r: number,
  c: number,
  shape: string,
  color: string
) => {
  for (const [rr, cc] of neighbors(r, c)) {
    const nb = board[rr][cc];
    if (nb.shape === shape || nb.color === color) return false;
  }
  return true;
};

const allValidPairsForCell = (board: Cell[][], r: number, c: number) => {
  const pairs: Array<{shape: string, color: string}> = [];
  for (const shape of SHAPES) {
    for (const color of COLORS) {
      if (isValidPairAgainstNeighbors(board, r, c, shape, color)) {
        // require both to change from current pair
        if (shape !== board[r][c].shape && color !== board[r][c].color) {
          pairs.push({ shape, color });
        }
      }
    }
  }
  return pairs;
};

const newEmptyBoard = (): Cell[][] => Array.from({length: ROWS}, () =>
  Array.from({length: COLS}, () => ({shape: "triangle", color: "red", cooldown: 0} as Cell))
);

// Generate initial valid board ensuring no adjacent share shape or color
function generateInitialBoard(maxTries = 10_000): Cell[][] {
  let tries = 0;
  while (tries < maxTries) {
    tries++;
    const b = newEmptyBoard();
    let ok = true;
    for (let r = 0; r < ROWS && ok; r++) {
      for (let c = 0; c < COLS && ok; c++) {
        // pick random until valid vs already-set neighbors (up, left)
        let placed = false;
        const attempts = new Set<string>();
        while (attempts.size < SHAPES.length * COLORS.length && !placed) {
          const s = randomOf(SHAPES);
          const col = randomOf(COLORS);
          const key = s + "-" + col;
          if (attempts.has(key)) continue;
          attempts.add(key);
          // check neighbors in bounds (up/left already filled)
          let valid = true;
          for (const [rr, cc] of neighbors(r, c)) {
            // only compare if neighbor already set (top and left are enough during generation)
            if (rr > r || (rr === r && cc > c)) continue;
            const nb = b[rr][cc];
            if (nb && (nb.shape === s || nb.color === col)) {
              valid = false;
              break;
            }
          }
          if (valid) {
            b[r][c] = { shape: s, color: col, cooldown: 0 };
            placed = true;
          }
        }
        if (!placed) ok = false;
      }
    }
    if (ok) return b;
  }
  // fallback brute force (should not happen often for 3x6 and 4x4 space)
  return newEmptyBoard();
}

// ----- game state -----
let state: GameState = {
  board: generateInitialBoard(),
  score: 0,
  turn: 0,
  gameOver: false,
};

function resetGame() {
  state = {
    board: generateInitialBoard(),
    score: 0,
    turn: 0,
    gameOver: false,
  };
}

function advanceTurn() {
  state.turn += 1;
  // decrement cooldowns (but not below 0)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      state.board[r][c].cooldown = Math.max(0, state.board[r][c].cooldown - 1);
    }
  }
}

// ----- server -----
const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.send("Multisession Grid Game server is running.");
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  // send current state
  socket.emit("state", state);

  socket.on("click", (payload: ClickPayload) => {
    if (state.gameOver) return;
    const { row, col } = payload;
    if (!inBounds(row, col)) return;
    const cell = state.board[row][col];
    if (cell.cooldown > 0) return; // cannot click

    const options = allValidPairsForCell(state.board, row, col);
    if (options.length === 0) {
      // game over
      state.gameOver = true;
      io.emit("state", state);
      return;
    }

    const { shape, color } = randomOf(options);
    state.board[row][col] = { shape, color, cooldown: 3 }; // put on cooldown
    state.score += 1;
    advanceTurn();
    io.emit("state", state);
  });

  socket.on("reset", () => {
    resetGame();
    io.emit("state", state);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
