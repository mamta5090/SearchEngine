import { ConnectionService } from './connection.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const ConnectionController = {
  async create(req, res, next) {
    try {
      const conn = await ConnectionService.create(req.user.id, req.body);
      return ApiResponse.created(res, 'Connection saved', conn);
    } catch (err) { next(err); }
  },

  async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await ConnectionService.list(req.user.id, page, limit);
      return ApiResponse.ok(res, 'Connections fetched', result.connections, result.pagination);
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const conn = await ConnectionService.getOne(req.user.id, req.params.id);
      return ApiResponse.ok(res, 'Connection fetched', conn);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const conn = await ConnectionService.update(req.user.id, req.params.id, req.body);
      return ApiResponse.ok(res, 'Connection updated', conn);
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await ConnectionService.delete(req.user.id, req.params.id);
      return ApiResponse.ok(res, 'Connection deleted');
    } catch (err) { next(err); }
  },

  async test(req, res, next) {
    try {
      const result = await ConnectionService.testConnection(req.user.id, req.params.id);
      return ApiResponse.ok(res, 'Connection test successful', result);
    } catch (err) { next(err); }
  },

  async testNew(req, res, next) {
    try {
      const result = await ConnectionService.testNewConnection(req.user.id, req.body);
      return ApiResponse.ok(res, 'Connection test successful', result);
    } catch (err) { next(err); }
  },
};
