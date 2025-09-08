// src/index.ts
import { createHttpServer } from "./app";
import { registerSockets } from "./sockets";

const { httpServer, io } = createHttpServer();
registerSockets(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
