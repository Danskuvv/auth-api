import express from 'express';
import {
  questListGet,
  questGet,
  userQuestsGet,
  userQuestPost,
  userQuestPut,
  getQuestCoinRewardController,
} from '../controllers/questController';
import {authenticate} from '../../middlewares';
import {param} from 'express-validator';

const router = express.Router();

router.get('/', questListGet);

router.get('/:id', param('id').isNumeric(), questGet);

router.get('/user/:id', param('id').isNumeric(), userQuestsGet);

router.post('/user/:id', authenticate, param('id').isNumeric(), userQuestPost);

router.put('/user/:id', authenticate, param('id').isNumeric(), userQuestPut);

router.get(
  '/:id/coin_reward',
  param('id').isNumeric(),
  getQuestCoinRewardController
);

export default router;
