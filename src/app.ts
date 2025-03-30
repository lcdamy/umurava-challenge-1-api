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

const port = process.env.PORT || 4000;

// Import the cron job file
require(path.join(__dirname, 'cronjobs', 'schedules'));

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(expressWinston.logger({ winstonInstance: logger, statusLevels: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});