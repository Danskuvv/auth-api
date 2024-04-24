// imagequestController.ts
import {NextFunction, Request, Response} from 'express';
import CustomError from '../../classes/CustomError';
import {
  completeUserImageQuest,
  getAllImageQuests,
  getImageQuestById,
  getImageQuestCoinReward,
  getUserImageQuest,
} from '../models/imagequestModel';
import {
  getUserImageQuests,
  addUserImageQuest,
  claimUserImageQuest,
} from '../models/imagequestModel';

type ImageQuest = {
  quest_id: number;
  quest_name: string;
  coin_reward: number;
  image_goal: string;
};

type UserImageQuest = {
  user_id: number;
  quest_id: number;
  claimed: boolean;
};

const imagequestListGet = async (
  req: Request,
  res: Response<ImageQuest[]>,
  next: NextFunction
) => {
  try {
    const quests = await getAllImageQuests();
    res.json(quests);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const imagequestGet = async (
  req: Request<{id: string}>,
  res: Response<ImageQuest>,
  next: NextFunction
) => {
  try {
    const quest = await getImageQuestById(Number(req.params.id));
    if (!quest) {
      next(new CustomError('Image Quest not found', 404));
      return;
    }
    res.json(quest);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userImageQuestsGet = async (
  req: Request<{id: string}>,
  res: Response<UserImageQuest[]>,
  next: NextFunction
) => {
  try {
    const userQuests = await getUserImageQuests(Number(req.params.id));
    res.json(userQuests);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userImageQuestPost = async (
  req: Request<{id: string}, {}, {quest_id: number}>,
  res: Response,
  next: NextFunction
) => {
  try {
    await addUserImageQuest(Number(req.params.id), req.body.quest_id);
    res.json({message: 'Image Quest added to user'});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const userImageQuestPut = async (
  req: Request<{id: string}, {}, {quest_id: number}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params.id);
    const questId = req.body.quest_id;
    if (userId === undefined || questId === undefined) {
      next(new CustomError('User ID or Image Quest ID is missing', 400));
      return;
    }
    await claimUserImageQuest(userId, questId);
    res.json({message: 'Image Quest claimed'});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const getImageQuestCoinRewardController = async (
  req: Request<{id: string}>,
  res: Response<{coin_reward: number}>,
  next: NextFunction
) => {
  try {
    const questId = Number(req.params.id);

    const coin_reward = await getImageQuestCoinReward(questId);

    if (coin_reward === null) {
      next(new CustomError('Image Quest not found', 404));
      return;
    }

    res.json({coin_reward});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const getUserImageQuestController = async (
  req: Request<{userId: string; questId: string}>,
  res: Response<UserImageQuest>,
  next: NextFunction
) => {
  try {
    const userImageQuest = await getUserImageQuest(
      Number(req.params.userId),
      Number(req.params.questId)
    );
    if (!userImageQuest) {
      next(new CustomError('User Image Quest not found', 404));
      return;
    }
    res.json(userImageQuest);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

const completeUserImageQuestController = async (
  req: Request<{userId: string; questId: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    await completeUserImageQuest(
      Number(req.params.userId),
      Number(req.params.questId)
    );
    res.json({message: 'User Image Quest completed'});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {
  imagequestListGet,
  imagequestGet,
  userImageQuestsGet,
  userImageQuestPost,
  userImageQuestPut,
  getImageQuestCoinRewardController,
  getUserImageQuestController,
  completeUserImageQuestController,
};
