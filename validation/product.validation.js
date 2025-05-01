const joi = require("joi");

const baseProductSchema = joi.object({
  title: joi.string().trim().min(3),
  description: joi.string().trim().min(5),
  image: joi.string().trim(),
  userId: joi.string().length(24).hex(),
  categoryId: joi.string().length(24).hex(),
  brandId: joi.string().length(24).hex(),
  price: joi.number(),
  stock: joi.number().default(0),
  appliedDiscount: joi.number().default(0),
  priceAfterDiscount: joi.number(),
  avgRating: joi.number().min(0).max(5).default(0),
});

const createProductSchema = baseProductSchema.fork(
  ["title", "description", "image", "userId", "categoryId", "brandId", "price"],
  (schema) => schema.required()
);

const updateProductSchema = baseProductSchema.min(1);

module.exports = {
  createProductSchema,
  updateProductSchema,
};
