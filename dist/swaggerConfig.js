"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// import swaggerUi from 'swagger-ui-express';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Umurava Skills Challenge API',
            version: '1.0.0',
            description: 'API documentation for the Umurava Skills Challenge',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/routes/admin/*.ts',
        './src/routes/participant/*.ts'
    ], // Path to the API docs
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
