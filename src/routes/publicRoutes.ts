const express = require('express');
const publicRoutes = express.Router();
const skillsController = require('../controllers/admin/skillsController');
const challengesController = require('../controllers/admin/challengesController');
const publicController = require('../controllers/public/publicController');

// Route to get all skills
publicRoutes.get('/skills', skillsController.getSkills);

// Route to get all challenges
publicRoutes.get('/challenges', challengesController.getChallenges);

// Route to get a challenge by ID
publicRoutes.get('/challenges/:id', challengesController.getChallengeById);

/**
 * @swagger
 * /public/api/join:
 *   post:
 *     summary: Post to join the program
 *     requestBody:
 *       description: Data to post to join the program
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userRole:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Successfully posted to join the program
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Token for entering the program created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyUm9sZSI6ImFkbWluIiwiaWF0IjoxNzM4NDI1MTEwfQ.2uAiaLiaZByNdnPP6s5Vjzvg30cqaBIVPN7xtSpsXz4"
 */
publicRoutes.post('/join', publicController.joinProgram);

publicRoutes.post('/join/whatspp/community', publicController.joinWhatsAppCommunity);


export default publicRoutes;