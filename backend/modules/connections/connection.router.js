import express from 'express';
import { ConnectionController } from './connection.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { userRateLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createConnectionSchema, updateConnectionSchema } from '../../validations/connection.validation.js';

const connectionRouter = express.Router();

// All connection routes require authentication + rate limiting
connectionRouter.use(authenticate, userRateLimiter);

connectionRouter.post('/',         validate(createConnectionSchema), ConnectionController.create);
connectionRouter.get('/',                                            ConnectionController.list);
connectionRouter.get('/:id',                                         ConnectionController.getOne);
connectionRouter.put('/:id',       validate(updateConnectionSchema), ConnectionController.update);
connectionRouter.delete('/:id',                                      ConnectionController.delete);
connectionRouter.post('/:id/test',                                   ConnectionController.test);

export default connectionRouter;
