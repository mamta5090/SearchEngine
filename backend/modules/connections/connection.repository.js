import db from '../../config/db.js';
import { randomUUID } from 'crypto';

export const ConnectionRepository = {
  async create({ userId, name, host, port, database_name, db_username, encrypted_password, ssl }) {
    const id = randomUUID();
    // ADDED created_at and NOW() for MySQL 5.1 compatibility
    await db.execute(
      `INSERT INTO database_connections
        (id, user_id, name, host, port, database_name, db_username, encrypted_password, \`ssl\`, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, userId, name, host, port, database_name, db_username, encrypted_password, ssl ? 1 : 0]
    );
    return this.findById(id, userId);
  },

  async findById(id, userId) {
    const [rows] = await db.execute(
      `SELECT id, user_id, name, host, port, database_name, db_username, \`ssl\`, created_at, updated_at
       FROM database_connections
       WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async listByUser(userId, limit, offset) {
    const [rows] = await db.execute(
      `SELECT id, user_id, name, host, port, database_name, db_username, \`ssl\`, created_at, updated_at
       FROM database_connections
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      [userId]
    );

    // FIX: Simplified count logic for compatibility
    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS total FROM database_connections WHERE user_id = ?',
      [userId]
    );
    
    const total = countRows[0].total;
    return { rows, total };
  },

  async update(id, userId, fields) {
    const allowed = ['name', 'host', 'port', 'database_name', 'db_username', 'encrypted_password', 'ssl'];
    const setClauses = [];
    const values     = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        setClauses.push(`\`${key}\` = ?`);
        values.push(fields[key]);
      }
    }
    if (setClauses.length === 0) return null;

    values.push(id, userId);
    await db.execute(
      `UPDATE database_connections SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return this.findById(id, userId);
  },

  async delete(id, userId) {
    const [result] = await db.execute(
      'DELETE FROM database_connections WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};
