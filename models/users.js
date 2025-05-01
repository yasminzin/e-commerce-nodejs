const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const usersSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 15,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z]+$/.test(v);
        },
        message: () => "First name must contain only letters",
      },
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 15,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z]+$/.test(v);
        },
        message: () => "Last name must contain only letters",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minLength: 8,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z]{1,}[a-zA-Z0-9]*$/.test(v);
        },
        message: () =>
          "Username must start with a letter and contain only letters and numbers",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z][a-zA-Z0-9]{2,}@[a-zA-Z]{2,10}\.[a-zA-Z]{2,5}$/.test(
            v
          );
        },
        message: () => "Invalid Email",
      },
    },
    password: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: false,
      min: "1940-01-01",
      max: "2018-01-01",
    },
    phoneNumbers: {
      required: true,
      type: [
        {
          type: {
            type: String,
            enum: ["home", "work", "mobile"],
            required: true,
          },
          number: {
            type: String,
            required: true,
            validate: {
              validator: function (v) {
                return /^[0-9]{10,15}$/.test(v);
              },
              message: () => "Invalid Number",
            },
          },
        },
      ],
      validate: {
        validator: function (v) {
          return v && v.length >= 1;
        },
        message: () => "At least one phone number is required",
      },
    },
    address: {
      street: { type: String, required: false },
      flatnumber: { type: String, required: false },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    passwordResetCode: {
      required: false,
      type: String,
    },
    passwordResetExpires: {
      required: false,
      type: Date,
    },
  },
  { timestamps : true }
);

usersSchema.pre("save", async function (next) {
  let salt = await bcryptjs.genSalt(10);
  let hashedPassword = await bcryptjs.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const usersModel = mongoose.model("User", usersSchema);
module.exports = usersModel;
