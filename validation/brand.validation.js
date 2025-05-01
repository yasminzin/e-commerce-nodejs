const joi = require("joi");

const baseBrandSchema = joi.object({
  name: joi.string().trim().min(2),
  logo: joi.string(),
  userId: joi.string().length(24).hex(),
  categories: joi.array().items(joi.string().length(24).hex()),
});

const createBrandSchema = baseBrandSchema.fork(
  ["name", "logo", "userId"],
  (schema) => schema.required()
);

const updateBrandSchema = baseBrandSchema.min(1);

module.exports = {
  createBrandSchema,
  updateBrandSchema,
};
