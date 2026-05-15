const { ZodError } = require('zod');

function validateZod(schemas = {}) {
  return (req, res, next) => {
    try {
      const targets = ['params', 'query', 'body'];

      for (const target of targets) {
        if (!schemas[target]) continue;

        const parsed = schemas[target].parse(req[target]);
        req[target] = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }

      return next(error);
    }
  };
}

module.exports = { validateZod };
