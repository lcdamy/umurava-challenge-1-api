import { Router } from 'express';
const {
    register,
    login,
    verifyEmail,
    forgetPassword,
    resetPassword,
    getTokenByEmail,
} = require('../../../controllers/auth/authController');

const router = Router();

// Route for user registration
router.post('/register', register);

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

export default router;