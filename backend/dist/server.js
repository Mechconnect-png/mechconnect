"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_js_1 = __importDefault(require("./app.js"));
const env_js_1 = require("./config/env.js");
const socket_service_js_1 = require("./services/socket.service.js");
const server = http_1.default.createServer(app_js_1.default);
// Initialize Socket.IO
socket_service_js_1.SocketService.init(server);
const PORT = env_js_1.ENV.PORT;
server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 MECHCONNECT BACKEND SERVER RUNNING ON PORT ${PORT}`);
    console.log(`⚡ Realtime Socket.IO enabled`);
    console.log(`🤖 Rule-Based AI Engine: DEMO_AI_MODE=${env_js_1.ENV.DEMO_AI_MODE}`);
    console.log(`===================================================`);
});
