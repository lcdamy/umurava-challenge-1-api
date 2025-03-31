"use strict";
/**
 * @swagger
 * /api/challenge/join/{id}:
 *   post:
 *     summary: Join a challenge
 *     tags:
 *       - participant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the challenge to join
 *     responses:
 *       200:
 *         description: Returns the challenge with the specified ID
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const participantChallengeRoutes = express.Router();
const challengesController = require('../../../controllers/participant/challengesController');
const { authenticationMiddleware } = require("../../../middlewares/authenticationMiddleware");
const { authorizationMiddleware } = require("../../../middlewares/authorizationMiddleware");
participantChallengeRoutes.post('/join/challenge/:id', authenticationMiddleware(), authorizationMiddleware("participant"), challengesController.joinChallenge);
exports.default = participantChallengeRoutes;
