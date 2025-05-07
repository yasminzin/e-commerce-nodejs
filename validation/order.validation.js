const joi = require("joi");

const baseOrderSchema = joi.object({
  paymentMethod: joi.string().valid("cod", "online").default("cod"),
  address: joi
    .object({
      street: joi.string().when("paymentMethod", {
        is: "cod",
        then: joi.string().required(),
        otherwise: joi.string().optional(),
      }),
      flatnumber: joi.string().when("paymentMethod", {
        is: "cod",
        then: joi.string().required(),
        otherwise: joi.string().optional(),
      }),
    })
    .optional(),
});

const createOrderSchema = baseOrderSchema;

module.exports = {
  createOrderSchema,
};