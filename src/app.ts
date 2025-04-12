import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swaggerConfig';
import connectDB from './config/dbConfig';
import expressWinston from 'express-winston';
import logger from './config/logger';
import helmet from 'helmet';
import routes from './routes';
import { auditLogger } from './middlewares/auditLogger';
import './types/index';
import { WebSocketServer } from 'ws';
import http from 'http';

const port = process.env.PORT || 4000;
const app = express();

// Initialize WebSocket server
const initializeWebSocketServer = () => {
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established.');
        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed.');
        });
    });

    return wss;
};

const wss = initializeWebSocketServer();

const configureMiddlewares = () => {
    app.use(express.json());
    app.use(cors({ origin: '*' }));
    app.use(helmet());
    app.use(expressWinston.logger({ winstonInstance: logger, statusLevels: true }));
    app.use(auditLogger);
};

const configureRoutes = () => {
    app.use('/api', routes);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
};

const startServer = async () => {
    try {
        require(path.join(__dirname, 'cronjobs', 'schedules'));
        await connectDB();
        configureMiddlewares();
        configureRoutes();

        app.set('trust proxy', true);

        const server = http.createServer(app); // Create HTTP server from Express app

        // Attach WebSocket upgrade event
        server.on('upgrade', (request, socket, head) => {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        });

        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
};

startServer();