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
export const COLORS: Color[] = ["red","green","blue","yellow"];
export const ROWS = 3;
export const COLS = 6;
