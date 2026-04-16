import express from 'express';
import multer  from 'multer';
import { IngestionController } from './ingestion.controller.js';
import { authenticate }        from '../../middleware/auth.middleware.js';
import { userRateLimiter }     from '../../middleware/rateLimiter.js';
import { validate }            from '../../middleware/validate.middleware.js';
import { createIndexSchema }   from '../../validations/index.validation.js';

const ingestionRouter = express.Router();

// Multer: buffer in memory, 50MB max, only json/csv
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/json', 'text/csv', 'text/plain'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(json|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only .json and .csv files are allowed'), false);
    }
  },
});

ingestionRouter.use(authenticate, userRateLimiter);

// Index management
ingestionRouter.post('/',    validate(createIndexSchema), IngestionController.createIndex);
ingestionRouter.get('/', IngestionController.listIndexes);
// Ingestion routes
ingestionRouter.post('/:id/ingest/json', upload.single('file'), IngestionController.ingestJSON);
ingestionRouter.post('/:id/ingest/csv',  upload.single('file'), IngestionController.ingestCSV);
ingestionRouter.get('/:id',                               IngestionController.getIndex);
ingestionRouter.delete('/:id',                            IngestionController.deleteIndex);
ingestionRouter.get('/:id/jobs',                          IngestionController.listJobs);



export default ingestionRouter;
