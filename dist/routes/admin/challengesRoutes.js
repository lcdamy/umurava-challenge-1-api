"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const adminChallengesRoutes = express.Router();
const challengesController = require('../../controllers/admin/challengesController');
const { AdminAuthorized, identifier } = require('../../middlewares/authMiddleware');
adminChallengesRoutes.use(identifier);
adminChallengesRoutes.use(AdminAuthorized());
/**
 *  @swagger
 *  /api/challenge:
 *   post:
 *     summary: Create a new challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeName:
 *                 type: string
 *                 example: "Challenge one"
 *               endDate:
 *                 type: string
 *                 example: "10-03-2025"
 *               duration:
 *                 type: number
 *                 example: 1
 *               moneyPrize:
 *                 type: string
 *                 example: "500000 - 700000"
 *               contactEmail:
 *                 type: string
 *                 example: "zuddE@gmail.com"
 *               projectDescription:
 *                 type: string
 *                 example: "test"
 *               projectBrief:
 *                 type: string
 *                 example: "test"
 *               projectTasks:
 *                 type: string
 *                 example: "test"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Frontend"
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *       400:
 *         description: Bad request
 */
adminChallengesRoutes.post('/', challengesController.createChallenge);
/**
 * @swagger
 * /api/challenge/{id}:
 *   put:
 *     summary: Update a challenge by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The challenge id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeName:
 *                 type: string
 *                 example: "Challenge one"
 *               endDate:
 *                 type: string
 *                 example: "10-03-2025"
 *               duration:
 *                 type: number
 *                 example: 1
 *               moneyPrize:
 *                 type: string
 *                 example: "500000 - 700000"
 *               contactEmail:
 *                 type: string
 *                 example: "zuddE@gmail.com"
 *               projectDescription:
 *                 type: string
 *                 example: "test"
 *               projectBrief:
 *                 type: string
 *                 example: "test"
 *               projectTasks:
 *                 type: string
 *                 example: "test"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Frontend"
 */
adminChallengesRoutes.put('/:id', challengesController.updateChallenge);
/**
 * @swagger
 * /api/challenge/{id}:
 *   delete:
 *     summary: Delete a challenge by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The challenge id
 */
adminChallengesRoutes.delete('/:id', challengesController.deleteChallenge);
/**
 * @swagger
 * /api/challenge/{id}:
 *   get:
 *     summary: Get a challenge by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The challenge id
 *     responses:
 *       200:
 *         description: Returns a challenge
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 */
adminChallengesRoutes.get('/statistics', challengesController.getChallengesStatistics);
exports.default = adminChallengesRoutes;
