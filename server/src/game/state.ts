/**
 * Game State Management
 * ---------------------
 * Purpose: In-memory model of the game (players, turns, score, cooldowns, etc.).
 * Encapsulates game rules (valid moves, turn advancing, collision checks...), and
 * exposes pure functions used by socket handlers.
 *
 * Persistence:
 * - This module typically keeps transient state in-memory. For durability,
 *   persist snapshots externally (not handled here).
 *
 * Thread-safety:
 * - Node's event loop is single-threaded; still, avoid long synchronous work.
 *
 * Last documented: 2025-09-08 09:37:12
 */

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
