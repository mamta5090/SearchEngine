import { SearchService } from './search.service.js';
import { ApiResponse }   from '../../utils/ApiResponse.js';

export const SearchController = {
  async search(req, res, next) {
    try {
      const { q, page, limit, prefix } = req.query;
      const result = await SearchService.search(
        req.user.id,
        req.params.indexId,
        q,
        { page, limit, prefix }
      );
      return ApiResponse.ok(res, 'Search results', result.results, result.pagination);
    } catch (err) { next(err); }
  },

  async stats(req, res, next) {
    try {
      const result = await SearchService.getIndexStats(req.user.id, req.params.indexId);
      return ApiResponse.ok(res, 'Index stats', result);
    } catch (err) { next(err); }
  },
};
