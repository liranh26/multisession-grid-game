// src/game/board.ts
import type { Cell } from "../types.ts";
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
  let tries = 0;
  while (tries < maxTries) {
    tries++;
    const b = newEmptyBoard();
    let ok = true;
    for (let r = 0; r < ROWS && ok; r++) {
      for (let c = 0; c < COLS && ok; c++) {
        let placed = false;
        const attempts = new Set<string>();
        while (attempts.size < SHAPES.length * COLORS.length && !placed) {
          const s = randomOf(SHAPES);
          const col = randomOf(COLORS);
          const key = `${s}-${col}`;
          if (attempts.has(key)) continue
          attempts.add(key)

          let valid = true
          for (const [rr, cc] of neighbors(r, c)) {
            if (rr > r || (rr === r && cc > c)) continue
            const nb = b[rr][cc]
            if (nb && (nb.shape === s || nb.color === col)) {
              valid = false
              break
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
  return newEmptyBoard();
}
