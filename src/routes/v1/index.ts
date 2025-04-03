import express from 'express';
import adminRoutes from './admin';
import participantRoutes from './participant';
import publicRoutes from './public';
import auth from './auth';


const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/participant', participantRoutes);
router.use('/public', publicRoutes);
router.use('/auth', auth);

export default router;