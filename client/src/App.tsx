// src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, ClickPayload, LeaderboardEntry } from "@shared/types";
import Board from "./components/Board";
import LeaderboardPanel from "./components/LeaderboardPanel";
import { fetchTop, submitScore } from "./api/leaderboard";

// @ts-ignore
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);

  // leaderboard ui state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState<string | null>(null);
  const [lbTop, setLbTop] = useState<LeaderboardEntry[]>([]);
  const submittedRef = useRef(false); // prevent double submit on re-renders

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
    submittedRef.current = false;
    socket?.emit("reset");
  };

  // when game becomes over, prompt once for nickname & submit
  useEffect(() => {
    if (!state) return;
    if (state.gameOver && !submittedRef.current) {
      submittedRef.current = true;
      const defaultNick = localStorage.getItem("last_nick") || "";
      const nickname = window.prompt("Game over! Enter your nickname to submit your score:", defaultNick)?.trim();
      if (nickname) {
        localStorage.setItem("last_nick", nickname);
        (async () => {
          try {
            await submitScore({ nickname, score: state.score });
            // optional: open the leaderboard right away
            openLeaderboard();
          } catch (e: any) {
            alert(e?.message || "Failed to submit score");
          }
        })();
      }
    }
  }, [state?.gameOver]);

  async function openLeaderboard() {
    setLbOpen(true);
    setLbLoading(true);
    setLbError(null);
    try {
      const res = await fetchTop<LeaderboardEntry>(10);
      setLbTop(res.top);
    } catch (e: any) {
      setLbError(e?.message || "Failed loading leaderboard");
    } finally {
      setLbLoading(false);
    }
  }

  return (
      <div className="container">
        <div className="topbar">
          <button className="btn" onClick={reset}>Reset</button>
          <button className="btn" onClick={openLeaderboard}>Leaderboard</button>
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

        <LeaderboardPanel
            open={lbOpen}
            loading={lbLoading}
            error={lbError}
            top={lbTop}
            onRefresh={openLeaderboard}
            onClose={() => setLbOpen(false)}
        />
      </div>
  );
}
