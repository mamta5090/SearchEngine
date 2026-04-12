import express from 'express';
import { SearchController } from './search.controller.js';
import { authenticate }     from '../../middleware/auth.middleware.js';
import { userRateLimiter }  from '../../middleware/rateLimiter.js';

const searchRouter = express.Router();

searchRouter.use(authenticate, userRateLimiter);

// GET /api/v1/search/:indexId?q=keyword&page=1&limit=20&prefix=false
searchRouter.get('/:indexId',       SearchController.search);
searchRouter.get('/:indexId/stats', SearchController.stats);

export default searchRouter;
