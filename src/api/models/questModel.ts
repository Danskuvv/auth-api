// questModel.ts
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {promisePool} from '../../lib/db';

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

const getAllQuests = async (): Promise<Quest[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Quest[]>(
    'SELECT * FROM quests'
  );
  return rows;
};

const getQuestById = async (id: number): Promise<Quest | null> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Quest[]>(
    'SELECT * FROM quests WHERE quest_id = ?',
    [id]
  );
  return rows[0] || null;
};

const getUserQuests = async (userId: number): Promise<UserQuest[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & UserQuest[]>(
    'SELECT * FROM userquests WHERE user_id = ?',
    [userId]
  );
  return rows;
};

const addUserQuest = async (userId: number, questId: number): Promise<void> => {
  await promisePool.execute<ResultSetHeader>(
    'INSERT INTO userquests (user_id, quest_id) VALUES (?, ?)',
    [userId, questId]
  );
};

const claimUserQuest = async (
  userId: number,
  questId: number
): Promise<void> => {
  await promisePool.execute<ResultSetHeader>(
    'UPDATE userquests SET claimed = 1 WHERE user_id = ? AND quest_id = ?',
    [userId, questId]
  );
};

const getQuestCoinReward = async (questId: number): Promise<number | null> => {
  try {
    const [rows] = await promisePool.execute<
      RowDataPacket[] & {coin_reward: number}[]
    >('SELECT coin_reward FROM quests WHERE quest_id = ?', [questId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0].coin_reward;
  } catch (e) {
    console.error('getQuestCoinReward error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

export {getUserQuests, addUserQuest, claimUserQuest, getQuestCoinReward};

export {getAllQuests, getQuestById};
