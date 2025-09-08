// src/App.tsx
/**
 * Top-level application component.
 *
 * Responsibilities:
 * - Establish a WebSocket connection to the server using socket.io-client.
 * - Maintain and render the current shared GameState.
 * - Provide controls for resetting the game and opening the leaderboard.
 * - When a game ends, prompt once for a nickname and submit the score.
 */
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, ClickPayload, LeaderboardEntry } from "@shared/types";
import Board from "./components/Board";
import LeaderboardPanel from "./components/LeaderboardPanel";
import { fetchTop, submitScore } from "./api/leaderboard";

// The server URL is configurable via Vite env; falling back to localhost for dev.
// @ts-ignore
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function App() {
  // Holds the live socket connection
  const [socket, setSocket] = useState<Socket | null>(null);
  // Holds the current game state coming from the server
  const [state, setState] = useState<GameState | null>(null);

  // Leaderboard UI state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState<string | null>(null);
  const [lbTop, setLbTop] = useState<LeaderboardEntry[]>([]);
  const submittedRef = useRef(false); // prevents multiple submissions for the same game over

  // Establish socket connection on mount; disconnect on unmount to avoid leaks.
  useEffect(() => {
    const s = io(SERVER_URL, { transports: ["websocket"] });
    setSocket(s);

    // Receive state updates from the server.
    s.on("state", (st: GameState) => setState(st));

    return () => {
      s.disconnect(); // important: cleanup network resources
    };
  }, []);

  // Handle a board cell click by emitting a "click" event with row/col
  const onCellClick = (row: number, col: number) => {
    if (!socket || !state || state.gameOver) return; // ignore if not ready or game is over
    socket.emit("click", { row, col } as ClickPayload);
  };

  // Reset the game (also reset the one-shot submission flag)
  const reset = () => {
    submittedRef.current = false;
    socket?.emit("reset");
  };

  /**
   * When the server announces game over, prompt once for a nickname and submit the score.
   * We guard with submittedRef.current so if multiple "gameOver" states arrive, we only prompt once.
   */
  useEffect(() => {
    if (!state) return;
    if (state.gameOver && !submittedRef.current) {
      submittedRef.current = true;

      // pull the last used nickname (UX nicety)
      const defaultNick = localStorage.getItem("last_nick") || "";

      const nickname = window
          .prompt("Game over! Enter your nickname to submit your score:", defaultNick)
          ?.trim();

      if (nickname) {
        localStorage.setItem("last_nick", nickname);
        (async () => {
          try {
            await submitScore({ nickname, score: state.score });
            openLeaderboard(); // show results right away
          } catch (e: any) {
            alert(e?.message || "Failed to submit score - already submitted or something went wrong.");
          }
        })();
      }
    }
  }, [state?.gameOver]);

  // Open & fetch the leaderboard
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
        {/* Top control bar */}
        <div className="topbar">
          <button className="btn" onClick={reset}>Reset</button>
          <button className="btn" onClick={openLeaderboard}>Leaderboard</button>
          <div className="panel"><strong>Score:</strong> {state?.score ?? 0}</div>
          <div className="panel"><strong>Turn:</strong> {state?.turn ?? 0}</div>
          {/* Show a clear and accessible indicator of game over */}
          {state?.gameOver && <div className="panel" style={{ color: "#f87171" }}><strong>Game Over</strong></div>}
        </div>

        {/* Shared board */}
        {state && <Board state={state} onCellClick={onCellClick} />}

        {/* Short helper text */}
        <div className="footer">
          Shared, real-time board. Click a cell to change both shape and color. New pair must differ from adjacent cells.
          Cell enters a 3-turn cooldown after a valid click.
        </div>

        {/* Modal for leaderboard */}
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
