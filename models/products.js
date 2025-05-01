const mongoose = require("mongoose");

const productsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: 3,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    appliedDiscount: {
      default: 0,
      type: Number,
    },
    priceAfterDiscount: {
      type: Number,
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps : true }
);

productsSchema.pre("save", async function (next) {
  if (this.appliedDiscount > 0) {
    this.priceAfterDiscount =
      this.price - (this.price * this.appliedDiscount) / 100;
  } else {
    this.priceAfterDiscount = this.price;
  }
  next();
});

const productsModel = mongoose.model("Product", productsSchema);
module.exports = productsModel;
