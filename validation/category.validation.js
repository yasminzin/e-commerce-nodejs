const joi = require("joi");

const baseCategorySchema = joi.object({
  name: joi.string().trim().min(3),
  image: joi.string(),
  userId: joi.string().length(24).hex(),
  brands: joi.array().items(joi.string().length(24).hex()),
});

const createCategorySchema = baseCategorySchema.fork(
  ["name", "image", "userId"],
  (schema) => schema.required()
);

const updateCategorySchema = baseCategorySchema.min(1);

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
