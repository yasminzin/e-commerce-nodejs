const mongoose = require("mongoose");

const categoriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    brands: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "Brand",
        },
      ],
  },
  { timestamps : true }
);

const categoriesModel = mongoose.model("Category", categoriesSchema);
module.exports = categoriesModel;
