import { pipeline, Transform } from "stream";
import { promisify } from "util";
import csvParser from "csv-parser";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { IndexRepository } from "./index.repository.js";
import { DocumentRepository } from "./document.repository.js";
import { JobRepository } from "./job.repository.js";
import { indexManager } from "../search/index/IndexManager.js";
import { ApiError } from "../../utils/ApiError.js";
import logger from "../../config/logger.js";

const pipelineAsync = promisify(pipeline);
const BATCH_SIZE = 100; // Insert documents in batches of 100

export const IngestionService = {
  // ── Index Management ─────────────────────────────────────────

  async createIndex({
    userId,
    name,
    description,
    searchableFields,
    connectionId,
    targetTable,
    mappings,
  }) {
    return IndexRepository.create({
      userId,
      name,
      description,
      searchableFields,
    });
  },

  async listIndexes(userId, page = 1, limit = 20) {
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const { rows, total } = await IndexRepository.listByUser(
      userId,
      parsedLimit,
      (parsedPage - 1) * parsedLimit,
    );
    return {
      indexes: rows,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  async getIndex(userId, indexId) {
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound("Index not found");
    return idx;
  },

  async deleteIndex(userId, indexId) {
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound("Index not found");

    // Cascade deletes documents via FK; drop from memory index
    await DocumentRepository.deleteByIndex(indexId, userId);
    await IndexRepository.delete(indexId, userId);
    indexManager.drop(indexId);
  },

  async listJobs(userId, indexId, page = 1, limit = 20) {
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound("Index not found");

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const { rows, total } = await JobRepository.listByIndex(
      indexId,
      userId,
      parsedLimit,
      (parsedPage - 1) * parsedLimit,
    );
    return {
      jobs: rows,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  // ── Internal: batch persist + index ─────────────────────────

  async _persistBatch(batch, indexId, userId) {
    const ids = await DocumentRepository.bulkInsert(indexId, userId, batch);
    ids.forEach((id, i) => indexManager.add(indexId, id, batch[i]));
    return ids.length;
  },

  // ── JSON Ingestion ───────────────────────────────

  async ingestJSON(userId, indexId, fileBuffer) {
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound("Index not found");

    await IndexRepository.updateStatus(
      indexId,
      "processing",
      idx.document_count,
    );
    const jobId = await JobRepository.create({
      userId,
      indexId,
      sourceType: "json",
    });

    let totalCount = 0;
    let hasError = null;

    try {
      const data = JSON.parse(fileBuffer.toString());
      const documents = Array.isArray(data) ? data : [data];

      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        totalCount += await IngestionService._persistBatch(
          batch,
          indexId,
          userId,
        );
      }
    } catch (err) {
      hasError = err.message;
      logger.error(`[Ingestion] JSON job ${jobId} failed: ${err.message}`);
    }

    if (hasError) {
      await JobRepository.fail(jobId, hasError);
      await IndexRepository.updateStatus(indexId, "error", idx.document_count);
      throw ApiError.badRequest(`Ingestion failed: ${hasError}`);
    }

    const newCount = (idx.document_count || 0) + totalCount;
    await JobRepository.complete(jobId, totalCount);
    await IndexRepository.updateStatus(indexId, "ready", newCount);

    logger.info(
      `[Ingestion] JSON job ${jobId} complete: ${totalCount} docs added to index ${indexId}`,
    );
    return { jobId, documentsIngested: totalCount };
  },

  // ── CSV Ingestion (streaming) ────────────────────────────────

  async ingestCSV(userId, indexId, fileStream) {
    const idx = await IndexRepository.findById(indexId, userId);
    if (!idx) throw ApiError.notFound("Index not found");

    await IndexRepository.updateStatus(
      indexId,
      "processing",
      idx.document_count,
    );
    const jobId = await JobRepository.create({
      userId,
      indexId,
      sourceType: "csv",
    });

    let totalCount = 0;
    let batch = [];
    let hasError = null;

    try {
      await pipelineAsync(
        fileStream,
        csvParser(),
        new Transform({
          objectMode: true,
          async transform(row, _enc, cb) {
            batch.push(row);
            if (batch.length >= BATCH_SIZE) {
              try {
                totalCount += await IngestionService._persistBatch(
                  batch,
                  indexId,
                  userId,
                );
                batch = [];
              } catch (e) {
                return cb(e);
              }
            }
            cb();
          },
          async flush(cb) {
            if (batch.length > 0) {
              try {
                totalCount += await IngestionService._persistBatch(
                  batch,
                  indexId,
                  userId,
                );
              } catch (e) {
                return cb(e);
              }
            }
            cb();
          },
        }),
      );
    } catch (err) {
      hasError = err.message;
      logger.error(`[Ingestion] CSV job ${jobId} failed: ${err.message}`);
    }

    if (hasError) {
      await JobRepository.fail(jobId, hasError);
      await IndexRepository.updateStatus(indexId, "error", idx.document_count);
      throw ApiError.badRequest(`Ingestion failed: ${hasError}`);
    }

    const newCount = (idx.document_count || 0) + totalCount;
    await JobRepository.complete(jobId, totalCount);
    await IndexRepository.updateStatus(indexId, "ready", newCount);

    logger.info(
      `[Ingestion] CSV job ${jobId} complete: ${totalCount} docs added to index ${indexId}`,
    );
    return { jobId, documentsIngested: totalCount };
  },
};
