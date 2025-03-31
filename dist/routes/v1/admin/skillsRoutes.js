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
const validateRequest = require('../../../middlewares/validateRequest');
const SkillDTO = require('../../../dtos/skillsDTO');
const { AdminAuthorized, identifier } = require('../../../middlewares/authMiddleware');
skillsRoutes.use(identifier);
skillsRoutes.use(AdminAuthorized());
skillsRoutes.put('/skills/:id', validateRequest(SkillDTO), skillsController.updateSkill);
skillsRoutes.delete('/skills/:id', skillsController.deleteSkill);
exports.default = skillsRoutes;
