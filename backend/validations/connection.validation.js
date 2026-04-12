import Joi from 'joi';

export const createConnectionSchema = Joi.object({
  name:          Joi.string().trim().min(1).max(100).required(),
  host:          Joi.string().hostname().required(),
  port:          Joi.number().integer().min(1).max(65535).default(3306),
  database_name: Joi.string().trim().min(1).max(100).required(),
  db_username:   Joi.string().trim().min(1).max(100).required(),
  password:      Joi.string().min(1).max(255).required(),
  ssl:           Joi.boolean().default(false),
});

export const updateConnectionSchema = Joi.object({
  name:          Joi.string().trim().min(1).max(100),
  host:          Joi.string().hostname(),
  port:          Joi.number().integer().min(1).max(65535),
  database_name: Joi.string().trim().min(1).max(100),
  db_username:   Joi.string().trim().min(1).max(100),
  password:      Joi.string().min(1).max(255),
  ssl:           Joi.boolean(),
}).min(1); // at least one field required for update
