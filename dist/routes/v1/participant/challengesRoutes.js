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
const roles = ["admin", "participant"];
participantChallengeRoutes.post('/join/challenge/:id', authenticationMiddleware(), authorizationMiddleware("participant"), challengesController.joinChallenge);
participantChallengeRoutes.get('/all/joined/challenges', authenticationMiddleware(), authorizationMiddleware("participant"), challengesController.getAllJoinedChallenges);
participantChallengeRoutes.get('/:challenge_id/all', authenticationMiddleware(), authorizationMiddleware("admin"), challengesController.getParticipantChallenges);
participantChallengeRoutes.post('/:challenge_id/submit', authenticationMiddleware(), authorizationMiddleware("participant"), challengesController.submitChallenge);
participantChallengeRoutes.get('/:challenge_id/submit', authenticationMiddleware(), authorizationMiddleware("admin"), challengesController.getChallengeSubmissions);
participantChallengeRoutes.put('/:submission_challenge_id/approve-reject', authenticationMiddleware(), authorizationMiddleware("admin"), challengesController.approveRejectChallengeSubmission);
exports.default = participantChallengeRoutes;
