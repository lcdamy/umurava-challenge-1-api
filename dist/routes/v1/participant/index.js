"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Dynamically load all route files in the current directory
fs_1.default.readdirSync(__dirname)
    .filter(file => file !== 'index.ts' && file.endsWith('.ts'))
    .forEach(file => {
    const route = require(path_1.default.join(__dirname, file));
    if (route.default) {
        router.use(route.default); // Use the default export if it's a Router
    }
});
exports.default = router;
