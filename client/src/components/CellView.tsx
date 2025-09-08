import React from "react";
import type { Cell } from "@shared/types";

const colorMap: Record<string, string> = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
};

export default function CellView({
  cell,
  disabled,
  onClick,
}: {
  cell: Cell;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="cell" onClick={() => (!disabled ? onClick() : null)} role="button" aria-disabled={disabled}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        {cell.shape === "circle" && (
          <circle cx="32" cy="32" r="22" fill={colorMap[cell.color]} />
        )}
        {cell.shape === "square" && (
          <rect x="14" y="14" width="36" height="36" rx="6" fill={colorMap[cell.color]} />
        )}
        {cell.shape === "diamond" && (
          <polygon points="32,10 54,32 32,54 10,32" fill={colorMap[cell.color]} />
        )}
        {cell.shape === "triangle" && (
          <polygon points="32,12 52,52 12,52" fill={colorMap[cell.color]} />
        )}
      </svg>
      {disabled && (
        <div className="overlay">{cell.cooldown > 0 ? "Cooldown" : "Locked"}</div>
      )}
      {cell.cooldown > 0 && <div className="cooldown">-{cell.cooldown}</div>}
    </div>
  );
}
