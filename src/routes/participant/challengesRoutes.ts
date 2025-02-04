const express = require('express');
const participantChallengeRoutes = express.Router();
const challengesController = require('../../controllers/participant/challengesController');
const { ParticipantAuthorized, identifier } = require('../../middlewares/authMiddleware');

participantChallengeRoutes.use(identifier);
participantChallengeRoutes.use(ParticipantAuthorized());

/**
 * @swagger
 * /api/challenge/join/{id}:
 *   post:
 *     summary: Join a challenge
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
participantChallengeRoutes.post('/join/challenge/:id', challengesController.joinChallenge);


export default participantChallengeRoutes;