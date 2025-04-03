require('dotenv').config();
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
import './types/index'; // Import the custom types for Express

const port = process.env.PORT || 4000;
const app = express();


const startServer = async () => {

    try {
        // Import the cron job file
        require(path.join(__dirname, 'cronjobs', 'schedules'));

        // Connect to MongoDB
        await connectDB();

        app.use(express.json());
        app.use(cors());
        app.use(helmet());
        app.use(expressWinston.logger({ winstonInstance: logger, statusLevels: true }));

        app.use('/api', routes);

        app.use(auditLogger);

        app.set('trust proxy', true);

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
        });

    } catch (error) {
        console.error('Error starting the server:', error);
    }
};

startServer();