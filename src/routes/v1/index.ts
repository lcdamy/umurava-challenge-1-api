import express from 'express';
import adminRoutes from './admin';
import participantRoutes from './participant';
import publicRoutes from './public';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/participant', participantRoutes);
router.use('/public', publicRoutes);

export default router;