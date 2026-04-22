import db from '../../config/db.js';

export const IndexRepository = {
  /**
   * Creates a new index record in MySQL
   */
  async create(data) {
    const query = `INSERT INTO search_indexes 
      (id, user_id, name, searchable_fields, filterable_fields, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())`;

    // MySQL 5.1 workaround: Stringify Arrays to TEXT
    const searchable = JSON.stringify(data.searchableFields || []);
    const filterable = JSON.stringify(data.filterableFields || []);

    await db.execute(query, [
      data.id,
      data.user_id,
      data.name,
      searchable,
      filterable,
      data.status || 'empty'
    ]);

    return this.findById(data.id, data.user_id);
  },

  /**
   * Finds a specific index by ID and User
   */
  async findById(id, userId) {
    const [rows] = await db.execute(
      "SELECT * FROM search_indexes WHERE id = ? AND user_id = ? LIMIT 1",
      [id, userId]
    );

    if (rows && rows.length > 0) {
      const index = rows[0];
      // Convert TEXT back to JSON objects for the frontend
      try {
        index.searchable_fields = typeof index.searchable_fields === 'string' 
          ? JSON.parse(index.searchable_fields) 
          : index.searchable_fields;
        index.filterable_fields = typeof index.filterable_fields === 'string' 
          ? JSON.parse(index.filterable_fields) 
          : index.filterable_fields;
      } catch (e) {
        console.error("JSON Parse error in findById:", e);
      }
      return index;
    }
    return null;
  },

  /**
   * Lists all indexes for a specific user
   * FIX: Added this missing function
   */
  async listByUser(userId) {
    const [rows] = await db.execute(
      "SELECT * FROM search_indexes WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    if (!rows) return [];

    // Map through results to parse JSON strings back to arrays
    return rows.map(index => {
      try {
        return {
          ...index,
          searchable_fields: typeof index.searchable_fields === 'string' 
            ? JSON.parse(index.searchable_fields) 
            : index.searchable_fields,
          filterable_fields: typeof index.filterable_fields === 'string' 
            ? JSON.parse(index.filterable_fields) 
            : index.filterable_fields
        };
      } catch (e) {
        return index;
      }
    });
  },

  /**
   * Deletes an index
   */
  async delete(id, userId) {
    const [result] = await db.execute(
      "DELETE FROM search_indexes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  }
};