

/**
 * @swagger
 * /public/api/skills:
 *   get:
 *     summary: Get all skills
 *     tags: [public]
 *     responses:
 *       200:
 *         description: Returns all skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   name:
 *                     type: string
 *                     example: "Skill Name"
 *                   description:
 *                     type: string
 *                     example: "Skill Description"
 */


/**
 * @swagger
 * /public/api/challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [public]
 *     responses:
 *       200:
 *         description: Returns all challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   name:
 *                     type: string
 *                     example: "Challenge Name"
 *                   description:
 *                     type: string
 *                     example: "Challenge Description"
 *                   difficulty:
 *                     type: string
 *                     example: "Easy"
 */


/**
 * @swagger
 * /public/api/challenges/{id}:
 *   get:
 *     summary: Get a challenge by id
 *     tags: [public]
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
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 name:
 *                   type: string
 *                   example: "Challenge Name"
 *                 description:
 *                   type: string
 *                   example: "Challenge Description"
 *                 difficulty:
 *                   type: string
 *                   example: "Easy"
 *       404:
 *         description: Challenge not found
 */


/**
 * @swagger
 * /public/api/join:
 *   post:
 *     summary: Post to join the program
 *     tags: [public]
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

/**
 * @swagger
 * /public/api/join/whatsapp/community:
 *   post:
 *     summary: Post to join the WhatsApp community
 *     tags: [public]
 *     requestBody:
 *       description: Data to post to join the WhatsApp community
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "250781234567"
 *     responses:
 *       200:
 *         description: Successfully posted to join the WhatsApp community
 */

const express = require('express');
const publicRoutes = express.Router();
const skillsController = require('../../../controllers/admin/skillsController');
const challengesController = require('../../../controllers/admin/challengesController');
const publicController = require('../../../controllers/public/publicController');

const { authenticationMiddleware } = require("../../../middlewares/authenticationMiddleware");
const { authorizationMiddleware } = require("../../../middlewares/authorizationMiddleware");

const roles = ["admin", "participant"];

publicRoutes.get('/skills', skillsController.getSkills);
publicRoutes.get('/challenges', challengesController.getChallenges);
publicRoutes.get('/challenges/:id', challengesController.getChallengeById);
publicRoutes.post('/enter', publicController.joinProgram);
publicRoutes.post('/join/whatsapp/community', publicController.joinWhatsAppCommunity);
publicRoutes.post('/subscribe-newsletter', publicController.joinNewsletter);
publicRoutes.put('/unsubscribe-newsletter', publicController.removeNewsletter);
publicRoutes.get('/notifications', authenticationMiddleware(), authorizationMiddleware(roles), publicController.getAllNotifications);
publicRoutes.put('/notifications/:id', authenticationMiddleware(), authorizationMiddleware(roles), publicController.updateNotification);
publicRoutes.delete('/notifications/:id', authenticationMiddleware(), authorizationMiddleware(roles), publicController.deleteNotification);
publicRoutes.delete('/notifications/delete/all', authenticationMiddleware(), authorizationMiddleware(roles), publicController.deleteAllNotifications);
publicRoutes.put('/notifications/read/all', authenticationMiddleware(), authorizationMiddleware(roles), publicController.readAllNotifications);
publicRoutes.get('/website/data', publicController.getWebsiteData);


export default publicRoutes;