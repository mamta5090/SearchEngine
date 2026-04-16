import db from '../../config/db.js';
import { randomUUID } from 'crypto';

export const DocumentRepository = {
  async bulkInsert(indexId, userId, documents) {
    if (documents.length === 0) return [];

    const ids      = documents.map(() => randomUUID());
    const values   = [];
    const placeholders = documents.map((doc, i) => {
      values.push(ids[i], indexId, userId, JSON.stringify(doc));
      return '(?, ?, ?, ?)';
    });

    await db.execute(
      `INSERT INTO documents (id, index_id, user_id, data) VALUES ${placeholders.join(', ')}`,
      values
    );
    return ids;
  },

  async findByIds(ids, userId) {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const [rows] = await db.execute(
      `SELECT id, data FROM documents WHERE id IN (${placeholders}) AND user_id = ?`,
      [...ids, userId]
    );
    return rows;
  },

  async countByIndex(indexId) {
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) AS total FROM documents WHERE index_id = ?',
      [indexId]
    );
    return total;
  },

  async deleteByIndex(indexId, userId) {
    await db.execute(
      'DELETE FROM documents WHERE index_id = ? AND user_id = ?',
      [indexId, userId]
    );
  },
};
