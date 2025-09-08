// src/app.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { getTop, submitScore, initLeaderboard } from "./leaderboard";

// NEW: init leaderboard when server process starts
initLeaderboard();

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
      const { nickname, score } = req.body ?? {};
      const entry = submitScore(String(nickname ?? ""), Number(score ?? 0));
      res.status(201).json(entry);
    } catch (err: any) {
      res.status(400).json({ error: err?.message ?? "Invalid payload" });
    }
  });

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });
  return { app, httpServer, io };
}
