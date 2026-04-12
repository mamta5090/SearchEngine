import db from '../../config/db.js';
import { randomUUID } from 'crypto';

export const IndexRepository = {
  async create({ userId, name, description, searchableFields }) {
    const id = randomUUID();
    await db.execute(
      `INSERT INTO search_indexes (id, user_id, name, description, searchable_fields, status)
       VALUES (?, ?, ?, ?, ?, 'empty')`,
      [id, userId, name, description || '', JSON.stringify(searchableFields || [])]
    );
    return this.findById(id, userId);
  },

  async findById(id, userId) {
    const [rows] = await db.execute(
      'SELECT * FROM search_indexes WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  },

  async listByUser(userId, limit = 10, offset = 0) {
    const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const query = `SELECT * FROM search_indexes
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ${parsedLimit} OFFSET ${parsedOffset}`;
    const [rows] = await db.execute(query, [userId]);

    const [totalRows] = await db.execute(
      'SELECT COUNT(*) AS total FROM search_indexes WHERE user_id = ?',
      [userId]
    );
    const total = totalRows[0]?.total || 0;

    return { rows, total };
  },

  async updateStatus(id, status, documentCount) {
    await db.execute(
      'UPDATE search_indexes SET status = ?, document_count = ? WHERE id = ?',
      [status, documentCount, id]
    );
  },

  async delete(id, userId) {
    const [result] = await db.execute(
      'DELETE FROM search_indexes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};
