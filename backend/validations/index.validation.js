import Joi from 'joi';

export const createIndexSchema = Joi.object({
  name:             Joi.string().trim().min(1).max(100).required(),
  description:      Joi.string().trim().max(500).allow('').default(''),
  connectionId:     Joi.number().allow(null).optional(),
  targetTable:      Joi.string().allow(null, '').optional(),
  searchableFields: Joi.array().items(Joi.string()).default([]),
  filterableFields: Joi.array().items(Joi.string()).default([]),
  mappings:         Joi.object({
    title: Joi.string().allow(''),
    body:  Joi.string().allow('')
  }).optional()
});
