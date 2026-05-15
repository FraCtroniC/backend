const { z } = require('zod');

const positiveInt = z.coerce.number().int().positive();
const uuid = z.string().uuid();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe usar formato YYYY-MM-DD');

const numericIdParam = z.object({
  id: positiveInt,
});

const uuidIdParam = z.object({
  id: uuid,
});

const genericIdParam = z.object({
  id: z.union([positiveInt, uuid]),
});

const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .strict();

module.exports = {
  z,
  positiveInt,
  uuid,
  isoDate,
  numericIdParam,
  uuidIdParam,
  genericIdParam,
  paginationQuerySchema,
};
