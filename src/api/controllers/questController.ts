// questController.ts
import {NextFunction, Request, Response} from 'express';
import CustomError from '../../classes/CustomError';
import {getAllQuests, getQuestById} from '../models/questModel';
import {
  getUserQuests,
  addUserQuest,
  claimUserQuest,
} from '../models/questModel';

type Quest = {
  quest_id: number;
  quest_name: string;
  coin_reward: number;
  distance_goal: number;
};

type UserQuest = {
  user_id: number;
  quest_id: number;
  claimed: boolean;
};

const questListGet = async (
  req: Request,
  res: Response<Quest[]>,
  next: NextFunction
) => {
  try {
    const quests = await getAllQuests();
    res.json(quests);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const questGet = async (
  req: Request<{id: string}>,
  res: Response<Quest>,
  next: NextFunction
) => {
  try {
    const quest = await getQuestById(Number(req.params.id));
    if (!quest) {
      next(new CustomError('Quest not found', 404));
      return;
    }
    res.json(quest);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userQuestsGet = async (
  req: Request<{id: string}>,
  res: Response<UserQuest[]>,
  next: NextFunction
) => {
  try {
    const userQuests = await getUserQuests(Number(req.params.id));
    res.json(userQuests);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userQuestPost = async (
  req: Request<{id: string}, {}, {quest_id: number}>,
  res: Response,
  next: NextFunction
) => {
  try {
    await addUserQuest(Number(req.params.id), req.body.quest_id);
    res.json({message: 'Quest added to user'});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userQuestPut = async (
  req: Request<{id: string}, {}, {quest_id: number}>,
  res: Response,
  next: NextFunction
) => {
  try {
    await claimUserQuest(Number(req.params.id), req.body.quest_id);
    res.json({message: 'Quest claimed'});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {questListGet, questGet, userQuestsGet, userQuestPost, userQuestPut};
