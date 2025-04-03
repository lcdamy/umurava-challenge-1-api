const express = require('express');
const auditRoutes = express.Router();
const auditsController = require('../../../controllers/admin/auditsController');

const { authenticationMiddleware } = require("../../../middlewares/authenticationMiddleware");
const { authorizationMiddleware } = require("../../../middlewares/authorizationMiddleware");

// Route for getting all audits (protected route)
auditRoutes.get('/audits/all', authenticationMiddleware(), authorizationMiddleware("admin"),  auditsController.getAudits);



export default auditRoutes;