// src/app.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

export function createHttpServer() {
  const app = express();
  app.use(cors());
  app.get("/", (_req, res) => {
    res.send("Multisession Grid Game server is running.");
  });

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });
  return { app, httpServer, io };
}
