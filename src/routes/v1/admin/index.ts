import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Dynamically load all route files in the current directory
fs.readdirSync(__dirname)
    .filter(file => file !== 'index.ts' && file.endsWith('.ts'))
    .forEach(file => {
        const route = require(path.join(__dirname, file));
        if (route.default) {
            router.use(route.default); // Use the default export if it's a Router
        }
    });

export default router;