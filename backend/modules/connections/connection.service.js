import mysql from "mysql2/promise";
import { ConnectionRepository } from "./connection.repository.js";
import { encrypt, decrypt } from "../../utils/crypto.js";
import { ApiError } from "../../utils/ApiError.js";
import logger from "../../config/logger.js";

export const ConnectionService = {
  async create(userId, data) {
    const { name, host, port, database_name, db_username, password, ssl } =
      data;
    const encrypted_password = encrypt(password);
    return ConnectionRepository.create({
      userId,
      name,
      host,
      port,
      database_name,
      db_username,
      encrypted_password,
      ssl,
    });
  },

  async list(userId, page = 1, limit = 20) {
    let parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) parsedLimit = 20;
    parsedLimit = Math.min(parsedLimit, 100);

    let parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) parsedPage = 1;

    const offset = (parsedPage - 1) * parsedLimit;

    if (!userId) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const { rows, total } = await ConnectionRepository.listByUser(
      userId,
      parsedLimit,
      offset,
    );
    return {
      connections: rows,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  },

  async getOne(userId, connectionId) {
    const conn = await ConnectionRepository.findById(connectionId, userId);
    if (!conn) throw ApiError.notFound("Connection not found");
    return conn;
  },

  async update(userId, connectionId, data) {
    const existing = await ConnectionRepository.findById(connectionId, userId);
    if (!existing) throw ApiError.notFound("Connection not found");

    const fields = { ...data };
    if (data.password) {
      fields.encrypted_password = encrypt(data.password);
      delete fields.password;
    }
    const updated = await ConnectionRepository.update(
      connectionId,
      userId,
      fields,
    );
    return updated;
  },

  async delete(userId, connectionId) {
    const existing = await ConnectionRepository.findById(connectionId, userId);
    if (!existing) throw ApiError.notFound("Connection not found");
    await ConnectionRepository.delete(connectionId, userId);
  },

  async testConnection(userId, connectionId) {
    const conn = await ConnectionRepository.findByIdWithSecret(
      connectionId,
      userId,
    );
    if (!conn) throw ApiError.notFound("Connection not found");

    let plainPassword;
    try {
      plainPassword = decrypt(conn.encrypted_password);
    } catch {
      throw ApiError.internal("Failed to decrypt connection credentials");
    }

    const config = {
      host: conn.host,
      port: conn.port,
      user: conn.db_username,
      password: plainPassword,
      database: conn.database_name,
      connectTimeout: 5000,
      ssl: conn.ssl ? { rejectUnauthorized: false } : undefined,
    };

    const start = Date.now();
    let connection;
    try {
      connection = await mysql.createConnection(config);
      await connection.ping();
      const latencyMs = Date.now() - start;
      logger.info(`Connection test OK: ${connectionId} (${latencyMs}ms)`);
      return { success: true, latencyMs };
    } catch (err) {
      logger.warn(`Connection test FAILED: ${connectionId} — ${err.message}`);
      throw ApiError.badRequest(`Connection failed: ${err.message}`);
    } finally {
      if (connection) await connection.end().catch(() => {});
    }
  },

  async testNewConnection(userId, data) {
    const config = {
      host: data.host,
      port: data.port,
      user: data.username || data.db_username,
      password: data.password,
      database: data.database || data.database_name,
      connectTimeout: 5000,
      ssl: data.ssl ? { rejectUnauthorized: false } : undefined,
    };

    const start = Date.now();
    let connection;
    try {
      connection = await mysql.createConnection(config);
      await connection.ping();
      const latencyMs = Date.now() - start;
      logger.info(`Connection test OK (new) (${latencyMs}ms)`);
      return { success: true, latencyMs };
    } catch (err) {
      logger.warn(`Connection test FAILED (new) — ${err.message}`);
      throw ApiError.badRequest(`Connection failed: ${err.message}`);
    } finally {
      if (connection) await connection.end().catch(() => {});
    }
  },
};
