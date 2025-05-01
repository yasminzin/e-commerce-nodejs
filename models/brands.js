const mongoose = require("mongoose");

const brandsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minLength: 2,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    categories: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Category",
      },
    ],
  },
  { timestamps : true }
);

const brandsModels = mongoose.model("Brand", brandsSchema);
module.exports = brandsModels;
