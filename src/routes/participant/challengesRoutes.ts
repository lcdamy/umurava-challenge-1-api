const express = require('express');
const participantChallengeRoutes = express.Router();
const challengesController = require('../../controllers/participant/challengesController');
const { ParticipantAuthorized, identifier } = require('../../middlewares/authMiddleware');

participantChallengeRoutes.use(identifier);
participantChallengeRoutes.use(ParticipantAuthorized());

// Route to join a challenge
participantChallengeRoutes.post('/join/challenge/:id', challengesController.joinChallenge);


export default participantChallengeRoutes;