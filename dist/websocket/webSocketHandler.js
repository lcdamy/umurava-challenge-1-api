"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
class WebSocketHandler {
    constructor(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket connection established.');
            ws.on('message', (message) => {
                console.log(`Received message: ${message}`);
                // Broadcast the message to all connected clients
                this.wss.clients.forEach((client) => {
                    if (client.readyState === client.OPEN) {
                        client.send(message);
                    }
                });
            });
            ws.on('close', () => {
                console.log('WebSocket connection closed.');
            });
        });
    }
    sendMessageToAllClients(message) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
}
exports.default = WebSocketHandler;
