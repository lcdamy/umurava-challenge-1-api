import { Router } from 'express';
const {
    register,
    login,
    // forgetPassword,
    // resetPassword,
    // refreshToken,
    // getTokenByEmail,
    // changePassword
} = require('../../../controllers/auth/authController');

const router = Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

// // Route for refreshing access token
// router.post('/refresh-token', refreshToken);

// // Route for password reset request
// router.post('/forget-password', forgetPassword);

// // Route for password reset
// router.post('/reset-password', resetPassword);

// // Route for password change
// router.post('/change-password', changePassword);

// // Route for social login (Google, Facebook, etc.)
// router.post('/social-login', getTokenByEmail);

export default router;