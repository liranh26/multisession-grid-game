// src/sockets.ts
import type { Server } from "socket.io";
import type { ClickPayload } from "./types.ts";
import { getState, resetGame, handleClick } from "./game/state";

export function registerSockets(io: Server) {
  io.on("connection", (socket) => {
    socket.emit("state", getState());

    socket.on("click", ({ row, col }: ClickPayload) => {
      const result = handleClick(row, col);
      if (result !== "ignored") {
        io.emit("state", getState());
      }
    });

    socket.on("reset", () => {
      resetGame();
      io.emit("state", getState());
    });
  });
}
