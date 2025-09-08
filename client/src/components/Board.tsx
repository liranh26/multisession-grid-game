// src/components/Board.tsx
/**
 * Grid container for the board. Delegates rendering of each cell to <CellView/>.
 * Keeps this component lean and focused on mapping state to UI.
 */
import React from "react";
import type { GameState } from "@shared/types";
import CellView from "./CellView";

export default function Board({
                                state,
                                onCellClick,
                              }: {
  state: GameState;
  onCellClick: (r: number, c: number) => void;
}) {
  return (
      <div className="grid">
        {state.board.map((row, r) =>
            row.map((cell, c) => (
                <CellView
                    key={`${r}-${c}`}
                    cell={cell}
                    onClick={() => onCellClick(r, c)} // pass coordinates upward
                    disabled={state.gameOver || cell.cooldown > 0} // disable when game over or cooling down
                />
            ))
        )}
      </div>
  );
}
