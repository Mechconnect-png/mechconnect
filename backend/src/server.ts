import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { SocketService } from "./services/socket.service.js";

const server = http.createServer(app);

// Initialize Socket.IO
SocketService.init(server);

const PORT = ENV.PORT;

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 MECHCONNECT BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`⚡ Realtime Socket.IO enabled`);
  console.log(`🤖 Rule-Based AI Engine: DEMO_AI_MODE=${ENV.DEMO_AI_MODE}`);
  console.log(`===================================================`);
});
