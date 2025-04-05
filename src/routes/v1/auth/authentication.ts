import { Router } from 'express';
const {
    register,
    registerAdmin,
    login,
    verifyEmail,
    forgetPassword,
    resetPassword,
    getTokenByEmail,
    getProfile,
    updateProfile,
    deleteProfile,
    changePassword,
    getAllUsers,
    activateAccount,
    deactivateAccount,
    uploadProfilePicture
} = require('../../../controllers/auth/authController');

const { authenticationMiddleware } = require("../../../middlewares/authenticationMiddleware");
const { authorizationMiddleware } = require("../../../middlewares/authorizationMiddleware");

import upload from '../../../middlewares/bucket';

const roles = ["admin", "participant"];

const router = Router();

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/social-login', getTokenByEmail);
router.get('/profile', authenticationMiddleware(), authorizationMiddleware(roles), getProfile);
router.put('/profile', authenticationMiddleware(), authorizationMiddleware(roles), updateProfile);
router.delete('/profile', authenticationMiddleware(), authorizationMiddleware(roles), deleteProfile);
router.put('/profile/change-password', authenticationMiddleware(), authorizationMiddleware(roles), changePassword);
router.get('/users', authenticationMiddleware(), authorizationMiddleware("admin"), getAllUsers);
router.post('/activate-account/:id', authenticationMiddleware(), authorizationMiddleware("admin"), activateAccount);
router.post('/deactivate-account/:id', authenticationMiddleware(), authorizationMiddleware("admin"), deactivateAccount);
router.post('/profile/upload-picture', authenticationMiddleware(), upload.single('file'), uploadProfilePicture);


export default router;