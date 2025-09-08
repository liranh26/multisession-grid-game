/**
 * Server Entrypoint
 * ------------------
 * Purpose: Bootstraps the HTTP + WebSocket stack for the multiplayer grid game.
 * - Creates the Express/HTTP/Socket.IO server (via createHttpServer).
 * - Registers all socket event handlers (via registerSockets).
 * - Starts listening on PORT (env or 3001).
 *
 * Notes:
 * - Keep this file minimal; application wiring belongs in app.ts and sockets.ts.
 * - Changing the import order may affect initialization timing.
 *
 */
// Boot the web stack (Express + HTTP + Socket.IO) from app.ts
import { createHttpServer } from "./app";
// Attach all WebSocket event handlers for gameplay
import { registerSockets } from "./sockets";

// Destructure the HTTP server and Socket.IO instance
const { httpServer, io } = createHttpServer();
// Wire the socket events before we start listening
registerSockets(io);

// Prefer PORT from environment (e.g., cloud), fallback to 3001 for local dev
const PORT = process.env.PORT || 3001;
// Start the server and log where it is listening
httpServer.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
