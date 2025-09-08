/**
 * Board Utilities
 * ---------------
 * Purpose: Helpers to create/clone/validate a game board and to place shapes/cells.
 * Typical functions include: newEmptyBoard, randomBoard, isInside, neighbors, etc.
 *
 * Performance:
 * - Functions should stay pure to make testing easy.
 * - When cloning, take care to not mutate the original arrays.
 *
 * Last documented: 2025-09-08 09:37:12
 */
// src/game/board.ts
import type {Cell, Color, Shape} from "../types.ts";
import { SHAPES, COLORS, ROWS, COLS } from "../types.ts";

export const randomOf = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

export const neighbors = (r: number, c: number) =>
    ([
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ] as Array<[number, number]>).filter(([rr, cc]) => inBounds(rr, cc));

export function isValidPairAgainstNeighbors(
    board: Cell[][],
    r: number,
    c: number,
    shape: string,
    color: string
) {
  for (const [rr, cc] of neighbors(r, c)) {
    const nb = board[rr][cc];
    if (nb.shape === shape || nb.color === color) return false;
  }
  return true;
}

export function allValidPairsForCell(board: Cell[][], r: number, c: number) {
  const pairs: Array<{ shape: string; color: string }> = [];
  for (const shape of SHAPES) {
    for (const color of COLORS) {
      if (isValidPairAgainstNeighbors(board, r, c, shape, color)) {
        if (shape !== board[r][c].shape && color !== board[r][c].color) {
          pairs.push({ shape, color });
        }
      }
    }
  }
  return pairs;
}

export const newEmptyBoard = (): Cell[][] =>
    Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => ({ shape: "triangle", color: "red", cooldown: 0 } as Cell))
    );

// Generate initial valid board ensuring no adjacent share shape || color
export function generateInitialBoard(maxTries = 10_000): Cell[][] {
  // Try building a valid board up to maxTries times; fall back to empty if we can't.
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    const board = newEmptyBoard();
    let allPlaced = true;

    for (let r = 0; r < ROWS && allPlaced; r++) {
      for (let c = 0; c < COLS && allPlaced; c++) {
        if (!placeRandomValidCell(board, r, c)) {
          allPlaced = false; // This board attempt failed; try building a new board
        }
      }
    }

    if (allPlaced) return board; // Success!
  }

  // If we couldn't build a valid board, return an empty one (same as current behavior).
  return newEmptyBoard();
}

/**
 * Attempt to place a valid (shape,color) in board[r][c].
 * Tries random combinations without repeating, returns true on success.
 */
function placeRandomValidCell(board: Cell[][], r: number, c: number): boolean {
  // Build a shuffled bag of all (shape,color) combinations to try once each
  const combos: Array<{ shape: Shape; color: Color }> = [];
  for (const shape of SHAPES) for (const color of COLORS) combos.push({ shape, color });
  shuffleInPlace(combos);

  for (const { shape, color } of combos) {
    if (isPlacementValid(board, r, c, shape, color)) {
      board[r][c] = { shape, color, cooldown: 0 };
      return true;
    }
  }
  return false;
}

/**
 * A placement is valid if no already-filled neighbor shares the same shape or color.
 * Note: we only need to check neighbors that were already assigned (<= current cell in fill order).
 */
function isPlacementValid(
    board: Cell[][],
    r: number,
    c: number,
    shape: Shape,
    color: Color
): boolean {
  for (const [rr, cc] of neighbors(r, c)) {
    // We fill row by row; neighbors "after" (rr>r or rr==r&&cc>c) aren't assigned yet.
    if (rr > r || (rr === r && cc > c)) continue;
    const nb = board[rr][cc];
    if (nb && (nb.shape === shape || nb.color === color)) return false;
  }
  return true;
}

/** Fisher–Yates shuffle (in-place) */
function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}
