import db from '../../../config/db.js';
import logger from '../../../config/logger.js';

/**
 * IndexManager — In-Memory Inverted Index
 *
 * Structure per index:
 *   store.get(indexId) = {
 *     tokens:    Map<token, Set<docId>>,   ← the inverted index
 *     documents: Map<docId, Object>,        ← raw document data (for retrieval)
 *   }
 *
 * This design is deliberately Redis-compatible:
 *   - tokens    → Redis HASH / SET
 *   - documents → Redis HASH
 * To migrate to Redis, replace only the add/remove/get methods inside
 * this class with redis.sadd / redis.smembers / redis.hget calls.
 */
class IndexManager {
  constructor() {
    // Map<indexId, { tokens, documents }>
    this.store = new Map();
  }

  // ── Private helpers ──────────────────────────────────────────

  _getOrCreate(indexId) {
    if (!this.store.has(indexId)) {
      this.store.set(indexId, {
        tokens:    new Map(), // Map<token, Set<docId>>
        documents: new Map(), // Map<docId, Object>
      });
    }
    return this.store.get(indexId);
  }

  /**
   * Tokenizer + normalizer.
   * Converts any value to a flat list of lowercase alpha-numeric tokens.
   * Designed to be the single source of truth so query tokens always match indexed tokens.
   */
  static tokenize(text) {
    if (text === null || text === undefined) return [];
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')  // strip punctuation
      .split(/\s+/)
      .filter(t => t.length > 1);    // ignore single-char tokens
  }

  /**
   * Recursively extract all string/number values from a document object.
   * This makes every field searchable without user specifying fields.
   */
  static _extractValues(obj, depth = 0) {
    if (depth > 5) return []; // guard against deeply nested objects
    if (typeof obj === 'string' || typeof obj === 'number') return [String(obj)];
    if (Array.isArray(obj)) {
      return obj.flatMap(v => IndexManager._extractValues(v, depth + 1));
    }
    if (obj && typeof obj === 'object') {
      return Object.values(obj).flatMap(v => IndexManager._extractValues(v, depth + 1));
    }
    return [];
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Add or update a document in the index.
   * If docId already exists it is removed first (re-index).
   */
  add(indexId, docId, document) {
    const entry = this._getOrCreate(indexId);

    // Remove stale tokens if document already indexed
    if (entry.documents.has(docId)) {
      this.remove(indexId, docId);
    }

    entry.documents.set(docId, document);

    const values = IndexManager._extractValues(document);
    const tokens = values.flatMap(v => IndexManager.tokenize(v));

    for (const token of tokens) {
      if (!entry.tokens.has(token)) {
        entry.tokens.set(token, new Set());
      }
      entry.tokens.get(token).add(docId);
    }
  }

  /**
   * Remove a document and all its token references from an index.
   */
  remove(indexId, docId) {
    const entry = this.store.get(indexId);
    if (!entry) return;

    entry.documents.delete(docId);

    for (const [token, docSet] of entry.tokens) {
      docSet.delete(docId);
      if (docSet.size === 0) entry.tokens.delete(token);
    }
  }

  /**
   * Search for documents in an index.
   *
   * @param {string} indexId
   * @param {string} query           - raw search query
   * @param {Object} options
   * @param {boolean} options.prefix - if true, also match tokens by prefix (autocomplete)
   * @param {number}  options.page
   * @param {number}  options.limit
   * @returns {{ results: Object[], total: number, pagination: Object }}
   */
  search(indexId, query, { prefix = false, page = 1, limit = 20 } = {}) {
    page  = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 100);

    const entry = this.store.get(indexId);
    if (!entry) return { results: [], total: 0, pagination: { page, limit, total: 0, totalPages: 0 } };

    const queryTokens = IndexManager.tokenize(query);
    if (queryTokens.length === 0) {
      return { results: [], total: 0, pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    // Resolve matching docId sets for each token
    const docIdSets = queryTokens.map(token => {
      const exactSet = entry.tokens.get(token) || new Set();

      if (!prefix) return exactSet;

      // Merge all matching prefix tokens
      const merged = new Set(exactSet);
      for (const [t, set] of entry.tokens) {
        if (t.startsWith(token) && t !== token) {
          for (const id of set) merged.add(id);
        }
      }
      return merged;
    });

    // AND intersection: document must match ALL query tokens
    let resultIds = docIdSets[0];
    for (let i = 1; i < docIdSets.length; i++) {
      resultIds = new Set([...resultIds].filter(id => docIdSets[i].has(id)));
    }

    const total      = resultIds.size;
    const totalPages = Math.ceil(total / limit);
    const offset     = (page - 1) * limit;

    // Slice paginated results
    const pageIds  = [...resultIds].slice(offset, offset + limit);
    const results  = pageIds.map(id => {
      const document = entry.documents.get(id);
      return { 
        id, 
        doc: document, 
        score: queryTokens.length > 0 ? 1.0 : 0.0 // Basic score placeholder
      };
    });

    return {
      results,
      total,
      pagination: { page, limit, total, totalPages },
    };
  }

  /**
   * Drop all data for an index (called on index deletion).
   */
  drop(indexId) {
    this.store.delete(indexId);
  }

  /**
   * Rebuild all indexes from the documents table in MySQL.
   * Called once on server start.
   * Redis migration path: replace the db.query stream with redis.hscan.
   */
  async rebuildFromDatabase() {
    logger.info('[IndexManager] Starting index rebuild from MySQL...');
    const start = Date.now();

    // Stream documents in batches to avoid loading everything into memory at once
    const BATCH_SIZE = 500;
    let offset  = 0;
    let total   = 0;

    for (;;) {
      const query = `SELECT id, index_id, data FROM documents ORDER BY index_id LIMIT ${BATCH_SIZE} OFFSET ${offset}`;
      const [rows] = await db.execute(query);

      if (rows.length === 0) break;

      for (const row of rows) {
        const document = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        this.add(row.index_id, row.id, document);
        total++;
      }

      offset += BATCH_SIZE;
      logger.info(`[IndexManager] Processed ${total} documents...`);

      if (rows.length < BATCH_SIZE) break;
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    logger.info(`[IndexManager] Rebuild complete. ${total} documents across ${this.store.size} indexes in ${elapsed}s`);
  }

  stats(indexId) {
    const entry = this.store.get(indexId);
    if (!entry) return null;
    return {
      tokenCount:    entry.tokens.size,
      documentCount: entry.documents.size,
    };
  }
}

// Singleton — one IndexManager instance for the entire process
export const indexManager = new IndexManager();
