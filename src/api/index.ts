import express from 'express';

import userRoute from './routes/userRoute';
import authRoute from './routes/authRoute';
import questRoute from './routes/questRoute';
import {MessageResponse} from '../../hybrid-types/MessageTypes';
const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'routes: users, auth',
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/quests', questRoute);

export default router;
