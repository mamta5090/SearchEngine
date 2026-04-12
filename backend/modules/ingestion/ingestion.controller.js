import { IngestionService } from "./ingestion.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const IngestionController = {
  // ── Index CRUD ───────────────────────────────────────────────
  async createIndex(req, res, next) {
    try {
      const idx = await IngestionService.createIndex({
        userId: req.user?.id,
        ...req.body,
      });
      return ApiResponse.created(res, "Index created", idx);
    } catch (err) {
      next(err);
    }
  },

  async listIndexes(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await IngestionService.listIndexes(
        req.user?.id,
        page,
        limit,
      );
      return ApiResponse.ok(
        res,
        "Indexes fetched",
        result.indexes,
        result.pagination,
      );
    } catch (err) {
      next(err);
    }
  },

  async getIndex(req, res, next) {
    try {
      const idx = await IngestionService.getIndex(req.user?.id, req.params.id);
      return ApiResponse.ok(res, "Index fetched", idx);
    } catch (err) {
      next(err);
    }
  },

  async deleteIndex(req, res, next) {
    try {
      await IngestionService.deleteIndex(req.user?.id, req.params.id);
      return ApiResponse.ok(res, "Index deleted");
    } catch (err) {
      next(err);
    }
  },

  async listJobs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await IngestionService.listJobs(
        req.user?.id,
        req.params.id,
        page,
        limit,
      );
      return ApiResponse.ok(
        res,
        "Jobs fetched",
        result.jobs,
        result.pagination,
      );
    } catch (err) {
      next(err);
    }
  },

  // ── Ingestion ────────────────────────────────────────────────
  async ingestJSON(req, res, next) {
    try {
      if (!req.file)
        throw new (await import("../../utils/ApiError.js")).ApiError(
          400,
          "No file uploaded",
        );
      const result = await IngestionService.ingestJSON(
        req.user.id,
        req.params.id,
        req.file.buffer,
      );
      return ApiResponse.ok(res, "JSON ingestion complete", result);
    } catch (err) {
      next(err);
    }
  },

  async ingestCSV(req, res, next) {
    try {
      if (!req.file)
        throw new (await import("../../utils/ApiError.js")).ApiError(
          400,
          "No file uploaded",
        );
      const { Readable } = await import("stream");
      const stream = Readable.from(req.file.buffer);
      const result = await IngestionService.ingestCSV(
        req.user.id,
        req.params.id,
        stream,
      );
      return ApiResponse.ok(res, "CSV ingestion complete", result);
    } catch (err) {
      next(err);
    }
  },
};
