"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const express_winston_1 = __importDefault(require("express-winston"));
const logger_1 = __importDefault(require("./config/logger"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const auditLogger_1 = require("./middlewares/auditLogger");
require("./types/index"); // Import the custom types for Express
const port = process.env.PORT || 4000;
const app = (0, express_1.default)();
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Import the cron job file
        require(path_1.default.join(__dirname, 'cronjobs', 'schedules'));
        // Connect to MongoDB
        yield (0, dbConfig_1.default)();
        app.use(express_1.default.json());
        app.use((0, cors_1.default)({ origin: '*' }));
        app.use((0, helmet_1.default)());
        app.use(express_winston_1.default.logger({ winstonInstance: logger_1.default, statusLevels: true }));
        app.use(auditLogger_1.auditLogger);
        app.use('/api', routes_1.default);
        app.set('trust proxy', true);
        app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.default));
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
        });
    }
    catch (error) {
        console.error('Error starting the server:', error);
    }
});
startServer();
