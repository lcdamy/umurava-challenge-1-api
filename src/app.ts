require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swaggerConfig'; // Adjust the path as needed
import connectDB from './config/dbConfig';
import publicRoutes from './routes/publicRoutes';
import skillsRoutes from './routes/admin/skillsRoutes';
import challengesRoutes from './routes/admin/challengesRoutes';


// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/api/skills", skillsRoutes);
app.use("/api/challenge", challengesRoutes);
app.use("/public/api", publicRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
    console.log(`Swagger UI is available at http://localhost:${process.env.PORT}/api-docs`);
});