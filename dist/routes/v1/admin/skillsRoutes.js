"use strict";
/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Get a skill by ID
 *     tags:
 *       - skills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the skill to retrieve
 *     responses:
 *       200:
 *         description: Returns the skill with the specified ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 name:
 *                   type: string
 *                   example: "Skill Name"
 *       404:
 *         description: Skill not found
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Delete a skill by ID
 *     tags:
 *       - skills
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the skill to delete
 */
const express = require('express');
const skillsRoutes = express.Router();
const skillsController = require('../../../controllers/admin/skillsController');
const { authenticationMiddleware } = require("../../../middlewares/authenticationMiddleware");
const { authorizationMiddleware } = require("../../../middlewares/authorizationMiddleware");
skillsRoutes.put('/skills/:id', authenticationMiddleware(), authorizationMiddleware("admin"), skillsController.updateSkill);
skillsRoutes.delete('/skills/:id', authenticationMiddleware(), authorizationMiddleware("admin"), skillsController.deleteSkill);
skillsRoutes.post('/skills', authenticationMiddleware(), authorizationMiddleware("admin"), skillsController.createSkill);
exports.default = skillsRoutes;
