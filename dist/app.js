"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = __importDefault(require("./swaggerConfig"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const skillsRoutes_1 = __importDefault(require("./routes/admin/skillsRoutes"));
const challengesRoutes_1 = __importDefault(require("./routes/admin/challengesRoutes"));
const challengesRoutes_2 = __importDefault(require("./routes/participant/challengesRoutes"));
const express_winston_1 = __importDefault(require("express-winston"));
const logger_1 = __importDefault(require("./config/logger"));
const helmet_1 = __importDefault(require("helmet"));
// Import the cron job file
require(path_1.default.join(__dirname, 'cronjobs', 'schedules'));
// Connect to MongoDB
(0, dbConfig_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_winston_1.default.logger({ winstonInstance: logger_1.default, statusLevels: true }));
// admin routes
app.use("/api/skills", skillsRoutes_1.default);
app.use("/api/challenge", challengesRoutes_1.default);
app.use("/public/api", publicRoutes_1.default);
// participant routes
app.use("/api/participant", challengesRoutes_2.default);
// Swagger setup
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.default));
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
    console.log(`Swagger UI is available at http://localhost:${process.env.PORT}/api-docs`);
});
