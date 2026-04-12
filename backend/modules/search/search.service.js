import { indexManager }    from './index/IndexManager.js';
import { IndexRepository } from '../ingestion/index.repository.js';
import { ApiError }        from '../../utils/ApiError.js';

export const SearchService = {
  async search(userId, indexId, query, options = {}) {
    // 1. Verify ownership of the index
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound('Index not found');

    if (idx.status !== 'ready') {
      throw ApiError.badRequest(`Index is not ready for search (status: ${idx.status})`);
    }

    if (!query || query.trim() === '') {
      throw ApiError.badRequest('Search query "q" is required');
    }

    const {
      page   = 1,
      limit  = 20,
      prefix = true,
    } = options;

    // 2. Delegate to IndexManager — pure in-memory operation, no DB scan
    const result = indexManager.search(indexId, query, {
      prefix: prefix === 'true' || prefix === true,
      page:   Number(page),
      limit:  Math.min(Number(limit), 100),
    });

    return result;
  },

  async getIndexStats(userId, indexId) {
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound('Index not found');

    const memStats = indexManager.stats(indexId);
    return {
      index:          idx,
      memory:         memStats || { tokenCount: 0, documentCount: 0 },
    };
  },
};
