import React from "react";
import type { GameState, Cell } from "@shared/types";
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
            onClick={() => onCellClick(r, c)}
            disabled={state.gameOver || cell.cooldown > 0}
          />
        ))
      )}
    </div>
  );
}
