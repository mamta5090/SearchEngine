/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * Errors are forwarded to the global error handler (next(err)).
 */
export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return next(error);
  req.body = value;
  next();
};
