import db from '../../config/db.js';
import { randomUUID } from 'crypto';

export const JobRepository = {
  async create({ userId, indexId, sourceType }) {
    const id = randomUUID();
    await db.execute(
      `INSERT INTO ingestion_jobs (id, user_id, index_id, source_type, status)
       VALUES (?, ?, ?, ?, 'processing')`,
      [id, userId, indexId, sourceType]
    );
    return id;
  },

  async complete(id, documentCount) {
    await db.execute(
      `UPDATE ingestion_jobs
       SET status = 'done', document_count = ?, completed_at = NOW()
       WHERE id = ?`,
      [documentCount, id]
    );
  },

  async fail(id, errorMessage) {
    await db.execute(
      `UPDATE ingestion_jobs
       SET status = 'failed', error_message = ?, completed_at = NOW()
       WHERE id = ?`,
      [errorMessage, id]
    );
  },

  async listByIndex(indexId, userId, limit, offset) {
    const [rows] = await db.execute(
      `SELECT id, source_type, status, document_count, error_message, created_at, completed_at
       FROM ingestion_jobs
       WHERE index_id = ? AND user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [indexId, userId, limit, offset]
    );
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) AS total FROM ingestion_jobs WHERE index_id = ? AND user_id = ?',
      [indexId, userId]
    );
    return { rows, total };
  },
};
