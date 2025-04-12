import { Server } from 'http';
import { WebSocketServer } from 'ws';

class WebSocketHandler {
    private wss: WebSocketServer;

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server });

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

    sendMessageToAllClients(message: string) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
}

export default WebSocketHandler;