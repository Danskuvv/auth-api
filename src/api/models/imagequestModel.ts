// imagequestmodel.ts
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {promisePool} from '../../lib/db';

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

const getAllImageQuests = async (): Promise<ImageQuest[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & ImageQuest[]>(
    'SELECT * FROM imagequests'
  );
  return rows;
};

const getImageQuestById = async (id: number): Promise<ImageQuest | null> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & ImageQuest[]>(
    'SELECT * FROM imagequests WHERE quest_id = ?',
    [id]
  );
  return rows[0] || null;
};

const getUserImageQuests = async (
  userId: number
): Promise<UserImageQuest[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & UserImageQuest[]>(
    'SELECT * FROM userimagequests WHERE user_id = ?',
    [userId]
  );
  return rows;
};

const addUserImageQuest = async (
  userId: number,
  questId: number
): Promise<void> => {
  await promisePool.execute<ResultSetHeader>(
    'INSERT INTO userimagequests (user_id, quest_id) VALUES (?, ?)',
    [userId, questId]
  );
};

const claimUserImageQuest = async (
  userId: number,
  questId: number
): Promise<void> => {
  await promisePool.execute<ResultSetHeader>(
    'UPDATE userimagequests SET claimed = 1 WHERE user_id = ? AND quest_id = ?',
    [userId, questId]
  );
};

const getImageQuestCoinReward = async (
  questId: number
): Promise<number | null> => {
  try {
    const [rows] = await promisePool.execute<
      RowDataPacket[] & {coin_reward: number}[]
    >('SELECT coin_reward FROM imagequests WHERE quest_id = ?', [questId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0].coin_reward;
  } catch (e) {
    console.error('getImageQuestCoinReward error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

export {
  getUserImageQuests,
  addUserImageQuest,
  claimUserImageQuest,
  getImageQuestCoinReward,
};

export {getAllImageQuests, getImageQuestById};
