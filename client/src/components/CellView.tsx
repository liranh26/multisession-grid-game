// src/components/CellView.tsx
/**
 * Renders a single board cell with the correct shape and color.
 * Also shows an overlay and a cooldown badge when interactions are disabled.
 */
import React from "react";
import type { Cell } from "@shared/types";

// Map semantic color names from the shared types to hex codes used by the UI
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
      <div
          className="cell"
          onClick={() => (!disabled ? onClick() : null)} // prevent clicks while disabled
          role="button"
          aria-disabled={!!disabled}
      >
        {/* Render one of the 4 shapes using an SVG for crispness */}
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
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

        {/* Visual interaction lock while disabled */}
        {disabled && <div className="overlay">{cell.cooldown > 0 ? "Cooldown" : "Locked"}</div>}

        {/* Show remaining cooldown turns, if any */}
        {cell.cooldown > 0 && <div className="cooldown">-{cell.cooldown}</div>}
      </div>
  );
}
