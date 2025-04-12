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
import http from 'http';

import WebSocketHandler from './websocket/webSocketHandler';

const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);


const webSocketHandlerInstance = new WebSocketHandler(server);
export { webSocketHandlerInstance };


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
        server.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
            console.log(`📘 Swagger docs available at http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
    }
};

startServer();
