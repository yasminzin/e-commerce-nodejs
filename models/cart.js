const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
      },
    ],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      unique: true,
      required: true
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.pre('save', async function (next) {
  let total = 0;
  const Product = mongoose.model('Product');
  for (const item of this.products) {
    // find product by id to get price and calculate totalPrice in cart from it
    const product = await Product.findById(item.productId);
    if (product) {
      const price = product.priceAfterDiscount || product.price;
      total += price * item.quantity;
    }
  }
  this.totalPrice = total;
  next();
});

const cartModel = mongoose.model("Cart", cartSchema);
module.exports = cartModel;
