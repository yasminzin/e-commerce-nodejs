const joi = require("joi");

let baseUserSchema = joi.object({
  firstName: joi
    .string()

    .min(3)
    .max(15)
    .pattern(new RegExp("^[a-zA-Z]+$")),
  lastName: joi
    .string()

    .min(3)
    .max(15)
    .pattern(new RegExp("^[a-zA-Z]+$")),
  username: joi
    .string()

    .min(8)
    .pattern(new RegExp("^[a-zA-Z]{1,}[a-zA-Z0-9]*$")),
  email: joi
    .string()

    .pattern(
      new RegExp("^[a-zA-Z][a-zA-Z0-9]{2,}@[a-zA-Z]{2,10}.[a-zA-Z]{2,5}$")
    ),
  password: joi.string(),
  birthDate: joi.date().min("1950-01-01").max("2015-01-01"),
  phoneNumbers: joi
    .array()
    .items(
      joi.object({
        type: joi.string().valid("home", "work", "mobile"),
        number: joi.string().pattern(/^[0-9]{10,15}$/),
      })
    )
    .min(1),
  address: joi.object({
    street: joi.string().optional(),
    flatnumber: joi.string().optional(),
    city: joi.string(),
    country: joi.string(),
  }),
  role: joi.string().valid("user", "admin").default("user"),
});

const createUserSchema = baseUserSchema.fork(
  [
    "firstName",
    "lastName",
    "username",
    "email",
    "password",
    "phoneNumbers",
    "address.city",
    "address.country",
  ],
  (schema) => schema.required()
);

module.exports = {
  createUserSchema,
  updateUserSchema: baseUserSchema.min(1),
};
