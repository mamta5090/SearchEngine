import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import logger from './config/logger.js';
import db from './config/db.js';
import { indexManager } from './modules/search/index/IndexManager.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRouter from './modules/auth/auth.router.js';
import connectionRouter from './modules/connections/connection.router.js';
import ingestionRouter from './modules/ingestion/ingestion.router.js';
import moduleSearchRouter from './modules/search/search.router.js';
import searchRouter from './routes/search.routes.js';
import productRouter from './routes/product.routes.js';
//import { searchProducts } from './controllers/search.controller.js';

const app = express();
const PORT = process.env.PORT || 5020;

// ── Global Middleware ──────────────────────────────────────────
app.use(cors({
  origin: true ,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));

app.use(express.json({ limit: '1mb' }));   // body payloads; files go through multer
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
// ── Health check (no auth needed) ─────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', service: 'Lumina Search API' }));
app.get('/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({ status: 'healthy', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
  }
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/indexes', ingestionRouter);
app.use('/api/v1/search', moduleSearchRouter);
app.use("/search",searchRouter)
app.use("/api/v1/products",productRouter);

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────
app.use(errorHandler);

// ── Startup ────────────────────────────────────────────────────
async function start() {
  // 1. Verify DB connection
  try {
    await db.execute('SELECT 1');
    logger.info('✅ MySQL connected');
  } catch (err) {
    console.error(`❌ MySQL connection failed:`, err);
    logger.error(`❌ MySQL connection failed: ${err.message}`);
    process.exit(1);
  }

  // 2. Rebuild in-memory index from persisted documents
  try {
    await indexManager.rebuildFromDatabase();
  } catch (err) {
    logger.error(`❌ Index rebuild failed: ${err.message}`);
    // Non-fatal: server still starts but indexes will be empty until re-ingested
  }

  // 3. Start HTTP server
  app.listen(PORT, () => {
    logger.info(`🚀 Lumina Search API running on http://localhost:${PORT}`);
  });
}

start();
