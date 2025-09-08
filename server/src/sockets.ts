// src/sockets.ts
import type { Server } from "socket.io";
import type { ClickPayload } from "./types.ts";
import { getState, resetGame, handleClick } from "./game/state";
import {
  markGameReset,
  markGameOverForSubmission,
} from "./leaderboard";

/**
 * Socket.IO wiring:
 * - On connect: send current state.
 * - On click(row,col): run handleClick; broadcast updated state.
 *   If that click ends the game -> open the leaderboard submission gate
 *   so exactly ONE score can be submitted for this finished game.
 * - On reset: reset game state, close the leaderboard gate, broadcast.
 */
export function registerSockets(io: Server) {
  io.on("connection", (socket) => {
    // Send current snapshot to the newly connected client
    socket.emit("state", getState());

    socket.on("click", ({ row, col }: ClickPayload) => {
      // Let the state machine decide (invalid/cooldown/ignored/moved/gameover)
      const result = handleClick(row, col);

      // Open the "first submission wins" gate iff this click ended the game
      if (result === "gameover") {
        markGameOverForSubmission();
      }

      // For anything except a no-op/ignored, broadcast the new state
      if (result !== "ignored") {
        io.emit("state", getState());
      }
    });

    socket.on("reset", () => {
      // Re-seed a new valid game
      resetGame();

      // Close the submission gate for the new game
      markGameReset();

      // Broadcast the fresh state to everyone
      io.emit("state", getState());
    });
  });
}
