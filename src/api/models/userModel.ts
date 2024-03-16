import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {promisePool} from '../../lib/db';
import {
  UserWithLevel,
  User,
  UserWithNoPassword,
} from '../../../hybrid-types//DBTypes';
import {UserDeleteResponse} from '../../../hybrid-types/MessageTypes';

const getUserById = async (id: number): Promise<UserWithNoPassword | null> => {
  try {
    const [rows] = await promisePool.execute<
      RowDataPacket[] & UserWithNoPassword[]
    >(
      `
    SELECT
      users.user_id,
      users.username,
      users.email,
      users.created_at,
      userlevels.level_name
    FROM users
    JOIN userlevels
    ON users.user_level_id = userlevels.level_id
    WHERE users.user_id = ?
  `,
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (e) {
    console.error('getUserById error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

const getAllusers = async (): Promise<UserWithNoPassword[] | null> => {
  try {
    const [rows] = await promisePool.execute<
      RowDataPacket[] & UserWithNoPassword[]
    >(
      `
    SELECT
      users.user_id,
      users.username,
      users.email,
      users.created_at,
      userlevels.level_name
    FROM users
    JOIN userlevels
    ON users.user_level_id = userlevels.level_id
  `
    );

    if (rows.length === 0) {
      return null;
    }

    return rows;
  } catch (e) {
    console.error('getAllusers error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

const getUserByEmail = async (email: string): Promise<UserWithLevel | null> => {
  try {
    const [rows] = await promisePool.execute<RowDataPacket[] & UserWithLevel[]>(
      `
    SELECT
      users.user_id,
      users.username,
      users.password,
      users.email,
      users.created_at,
      userlevels.level_name
    FROM users
    JOIN userlevels
    ON users.user_level_id = userlevels.level_id
    WHERE users.email = ?
  `,
      [email]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (e) {
    console.error('getUserByEmail error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

const getUserByUsername = async (
  username: string
): Promise<UserWithLevel | null> => {
  try {
    const [rows] = await promisePool.execute<RowDataPacket[] & UserWithLevel[]>(
      `
    SELECT
      users.user_id,
      users.username,
      users.password,
      users.email,
      users.created_at,
      userlevels.level_name
    FROM users
    JOIN userlevels
    ON users.user_level_id = userlevels.level_id
    WHERE users.username = ?
  `,
      [username]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (e) {
    console.error('getUserByUsername error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

const createUser = async (user: User): Promise<UserWithNoPassword | null> => {
  try {
    const result = await promisePool.execute<ResultSetHeader>(
      `
    INSERT INTO users (username, password, email, user_level_id)
    VALUES (?, ?, ?, ?)
  `,
      [user.username, user.password, user.email, 2]
    );

    if (result[0].affectedRows === 0) {
      return null;
    }

    const newUser = await getUserById(result[0].insertId);
    return newUser;
  } catch (e) {
    console.error('createUser error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

const modifyUser = async (
  user: User,
  id: number
): Promise<UserWithNoPassword | null> => {
  try {
    const sql = promisePool.format(
      `
      UPDATE users
      SET ?
      WHERE user_id = ?
      `,
      [user, id]
    );

    const result = await promisePool.execute<ResultSetHeader>(sql);

    if (result[0].affectedRows === 0) {
      return null;
    }

    const newUser = await getUserById(id);
    return newUser;
  } catch (e) {
    console.error('modifyUser error', (e as Error).message);
    throw new Error((e as Error).message);
  }
};

const deleteUser = async (id: number): Promise<UserDeleteResponse | null> => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM comments WHERE user_id = ?;', [id]);
    await connection.execute('DELETE FROM likes WHERE user_id = ?;', [id]);
    await connection.execute('DELETE FROM ratings WHERE user_id = ?;', [id]);
    await connection.execute(
      'DELETE FROM comments WHERE media_id IN (SELECT media_id FROM mediaitems WHERE user_id = ?);',
      [id]
    );
    await connection.execute(
      'DELETE FROM likes WHERE media_id IN (SELECT media_id FROM mediaitems WHERE user_id = ?);',
      [id]
    );
    await connection.execute(
      'DELETE FROM ratings WHERE media_id IN (SELECT media_id FROM mediaitems WHERE user_id = ?);',
      [id]
    );
    await connection.execute(
      'DELETE FROM MediaItemTags WHERE media_id IN (SELECT media_id FROM mediaitems WHERE user_id = ?);',
      [id]
    );
    await connection.execute('DELETE FROM mediaitems WHERE user_id = ?;', [id]);
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM users WHERE user_id = ?;',
      [id]
    );

    await connection.commit();

    if (result.affectedRows === 0) {
      return null;
    }

    console.log('result', result);
    return {message: 'User deleted', user: {user_id: id}};
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
};

export {
  getUserById,
  getAllusers,
  getUserByEmail,
  getUserByUsername,
  createUser,
  modifyUser,
  deleteUser,
};
