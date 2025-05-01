const joi = require("joi");

let loginSchema = joi.object({
  email: joi
    .string()
    .required()
    .pattern(
      new RegExp("^[a-zA-Z][a-zA-Z0-9]{2,}@[a-zA-Z]{2,10}.[a-zA-Z]{2,5}$")
    ),
  password: joi.string().required(),
});

module.exports = loginSchema;
