const express = require('express');
const skillsRoutes = express.Router();
const skillsController = require('../../controllers/admin/skillsController');
const validateRequest = require('../../middlewares/validateRequest');
const SkillDTO = require('../../dtos/skillsDTO');
const { AdminAuthorized, identifier } = require('../../middlewares/authMiddleware');

skillsRoutes.use(identifier);
skillsRoutes.use(AdminAuthorized());

// Route to get a skill by ID
skillsRoutes.get('/:id', skillsController.getSkillById);

// Route to create a new skill
skillsRoutes.post('/', skillsController.createSkill);

// Route to update an existing skill
skillsRoutes.put('/:id', validateRequest(SkillDTO), skillsController.updateSkill);

// Route to delete a skill
skillsRoutes.delete('/:id', skillsController.deleteSkill);

export default skillsRoutes;