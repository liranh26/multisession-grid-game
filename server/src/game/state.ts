// src/game/state.ts
import type { GameState } from "../types.ts";
import { ROWS, COLS } from "../types.ts";

import { generateInitialBoard, allValidPairsForCell, randomOf } from "./board";

let state: GameState = {
  board: generateInitialBoard(),
  score: 0,
  turn: 0,
  gameOver: false,
};

export const getState = () => state;

export function resetGame() {
  state = {
    board: generateInitialBoard(),
    score: 0,
    turn: 0,
    gameOver: false,
  };
}

export function advanceTurn() {
  state.turn += 1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      state.board[r][c].cooldown = Math.max(0, state.board[r][c].cooldown - 1);
    }
  }
}

export function handleClick(row: number, col: number): "ignored" | "moved" | "gameover" {
  if (state.gameOver) return "ignored";
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return "ignored";

  const cell = state.board[row][col];
  if (cell.cooldown > 0) return "ignored";

  const options = allValidPairsForCell(state.board, row, col);
  if (options.length === 0) {
    state.gameOver = true;
    return "gameover";
  }

  const { shape, color } = randomOf(options);
  // @ts-ignore
  state.board[row][col] = { shape, color, cooldown: 3 };
  state.score += 1;
  advanceTurn();
  return "moved";
}
