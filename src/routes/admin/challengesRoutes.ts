const express = require('express');
const challengeRoutes = express.Router();
const challengesController = require('../../controllers/admin/challengesController');
const { AdminAuthorized, identifier } = require('../../middlewares/authMiddleware');

challengeRoutes.use(identifier);
challengeRoutes.use(AdminAuthorized());

// Route to create a new challenge
challengeRoutes.post('/', challengesController.createChallenge);

// Route to update an existing challenge
challengeRoutes.put('/:id', challengesController.updateChallenge);

// Route to delete a challenge
challengeRoutes.delete('/:id', challengesController.deleteChallenge);

export default challengeRoutes;