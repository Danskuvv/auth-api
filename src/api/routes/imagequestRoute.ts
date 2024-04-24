// imagequestroute.ts
import express from 'express';
import {
  imagequestListGet,
  imagequestGet,
  userImageQuestsGet,
  userImageQuestPost,
  userImageQuestPut,
  getImageQuestCoinRewardController,
  getUserImageQuestController,
  completeUserImageQuestController,
} from '../controllers/imagequestController';
import {authenticate} from '../../middlewares';
import {param} from 'express-validator';

const router = express.Router();

router.get('/', imagequestListGet);

router.get('/:id', param('id').isNumeric(), imagequestGet);

router.get('/user/:id', param('id').isNumeric(), userImageQuestsGet);

router.post(
  '/user/:id',
  authenticate,
  param('id').isNumeric(),
  userImageQuestPost
);

router.put(
  '/user/:id',
  authenticate,
  param('id').isNumeric(),
  userImageQuestPut
);

router.get(
  '/:id/coin_reward',
  param('id').isNumeric(),
  getImageQuestCoinRewardController
);

router.get(
  '/user/:userId/quest/:questId',
  authenticate,
  param('userId').isNumeric(),
  param('questId').isNumeric(),
  getUserImageQuestController
);

router.put(
  '/user/:userId/quest/:questId',
  authenticate,
  param('userId').isNumeric(),
  param('questId').isNumeric(),
  completeUserImageQuestController
);

export default router;
