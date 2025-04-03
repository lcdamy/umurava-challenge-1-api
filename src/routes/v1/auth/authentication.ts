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
} = require('../../../controllers/auth/authController');

const { authenticationMiddleware } = require("../../../middlewares/authenticationMiddleware");
const { authorizationMiddleware } = require("../../../middlewares/authorizationMiddleware");

const roles = ["admin", "participant"];

const router = Router();

// Route for user registration
router.post('/register', register);

// Route for admin registration
router.post('/register-admin', registerAdmin);

// Route for user login
router.post('/login', login);

// Route for verifying email (if applicable)
router.get('/verify-email/:token', verifyEmail);

// Route for password reset request
router.post('/forget-password', forgetPassword);

// Route for password reset
router.post('/reset-password', resetPassword);

// Route for social login (Google, Facebook, etc.)
router.post('/social-login', getTokenByEmail);

// Route for getting user profile (protected route)
router.get('/profile', authenticationMiddleware(), authorizationMiddleware(roles), getProfile);

// Route for updating user profile (protected route)
router.put('/profile', authenticationMiddleware(), authorizationMiddleware(roles), updateProfile);

// Route for deleting user account (protected route)
router.delete('/profile', authenticationMiddleware(), authorizationMiddleware(roles), deleteProfile);

// Route for changing user password (protected route)
router.put('/profile/change-password', authenticationMiddleware(), authorizationMiddleware(roles), changePassword);

// Route for getting all users (protected route)
router.get('/users', authenticationMiddleware(), authorizationMiddleware("admin"), getAllUsers);


export default router;