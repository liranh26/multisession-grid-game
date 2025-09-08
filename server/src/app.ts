/**
 * HTTP / App Setup
 * -----------------
 * Purpose: Owns Express app, CORS, JSON parsing, and the underlying Node HTTP server.
 * Also initializes Socket.IO and wires REST endpoints related to the game/leaderboard.
 *
 * Key exports:
 * - createHttpServer(): Returns { app, httpServer, io } used by src/index.ts.
 *
 * Related modules:
 * - leaderboard.ts: persistence of scores and "is submit open" checks.
 * - sockets.ts: all real-time game events.
 *
 * Operational tips:
 * - CORS is enabled to allow the client app to talk to the server during development.
 * - Avoid adding app-level business logic here; prefer separating into route handlers/services.
 *
 * Last documented: 2025-09-08 09:37:12
 */
// src/app.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { getTop, submitScore, acceptIfOpen, initLeaderboard } from "./leaderboard";

// NEW: init leaderboard when server process starts
initLeaderboard();

/**
 * Create and configure the Express app, Node HTTP server, and Socket.IO server.
 * @returns { app: Express, httpServer: http.Server, io: SocketIOServer }
 */
export function createHttpServer() {
  const app = express();
  app.use(cors());
  app.use(express.json()); // <-- add this

  app.get("/", (_req, res) => {
    res.send("Multisession Grid Game server is running.");
  });

  // NEW: leaderboard routes
  app.get("/leaderboard/top", (_req, res) => {
    res.json({ top: getTop(10) });
  });

  app.post("/leaderboard/submit", (req, res) => {
    try {
      // Only first submission after gameOver is accepted
      if (!acceptIfOpen()) {
        return res
            .status(409)
            .json({ error: "Score already submitted for this finished game." });
      }

      const { nickname, score } = req.body ?? {};
      const saved = submitScore(String(nickname ?? ""), Number(score ?? 0));
      res.status(201).json(saved);
    } catch (e: any) {
      res.status(400).json({ error: e?.message ?? "Invalid payload" });
    }
  });

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });
  return { app, httpServer, io };
}
