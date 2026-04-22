import db from '../../config/db.js';

export const AuthRepository = {
  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT id, name, email, password FROM user1 WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email FROM user1 WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create(name, email, hashedPassword) {
    const [result] = await db.execute(
      "INSERT INTO user1 (name, email, password, created_at) VALUES (?, ?, ?, NOW())",
      [name, email, hashedPassword]
    );
    
    return { id: result.insertId, name, email };
  },
};
