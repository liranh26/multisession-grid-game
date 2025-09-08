import React, { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, ClickPayload, ROWS, COLS, SHAPES, COLORS } from "@shared/types";
import Board from "./components/Board";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    const s = io(SERVER_URL, { transports: ["websocket"] });
    setSocket(s);
    s.on("state", (st: GameState) => setState(st));
    return () => { s.disconnect(); };
  }, []);

  const onCellClick = (row: number, col: number) => {
    if (!socket || !state || state.gameOver) return;
    socket.emit("click", { row, col } as ClickPayload);
  };

  const reset = () => {
    socket?.emit("reset");
  };

  return (
    <div className="container">
      <div className="topbar">
        <button className="btn" onClick={reset}>Reset</button>
        <div className="panel"><strong>Score:</strong> {state?.score ?? 0}</div>
        <div className="panel"><strong>Turn:</strong> {state?.turn ?? 0}</div>
        {state?.gameOver && <div className="panel" style={{color:"#f87171"}}><strong>Game Over</strong></div>}
      </div>
      {state && (
        <Board state={state} onCellClick={onCellClick} />
      )}
      <div className="footer">
        Shared, real-time board. Click a cell to change both shape and color. New pair must differ from adjacent cells.
        Cell enters a 3-turn cooldown after a valid click.
      </div>
    </div>
  );
}
