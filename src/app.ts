require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swaggerConfig';
import connectDB from './config/dbConfig';
import publicRoutes from './routes/publicRoutes';
import skillsRoutes from './routes/admin/skillsRoutes';
import adminChallengesRoutes from './routes/admin/challengesRoutes';
import participantChallengeRoutes from './routes/participant/challengesRoutes';

// Import the cron job file
require(path.join(__dirname, 'cronjobs', 'schedules'));

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());
// admin routes
app.use("/api/skills", skillsRoutes);
app.use("/api/challenge", adminChallengesRoutes);
app.use("/public/api", publicRoutes);
// participant routes
app.use("/api/participant",participantChallengeRoutes);
// Swagger setup
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
    console.log(`Swagger UI is available at http://localhost:${process.env.PORT}/api-docs`);
});