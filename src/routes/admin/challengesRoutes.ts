const express = require('express');
const adminChallengesRoutes = express.Router();
const challengesController = require('../../controllers/admin/challengesController');
const { AdminAuthorized, identifier } = require('../../middlewares/authMiddleware');

adminChallengesRoutes.use(identifier);
adminChallengesRoutes.use(AdminAuthorized());

// Route to create a new challenge
adminChallengesRoutes.post('/', challengesController.createChallenge);

// Route to update an existing challenge
adminChallengesRoutes.put('/:id', challengesController.updateChallenge);

// Route to delete a challenge
adminChallengesRoutes.delete('/:id', challengesController.deleteChallenge);

//Route to get challenges statistics
adminChallengesRoutes.get('/statistics', challengesController.getChallengesStatistics);

export default adminChallengesRoutes;