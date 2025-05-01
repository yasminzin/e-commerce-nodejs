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
        },
      },
    ],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      unique: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// cartSchema.pre('save', async function (next) {
//     let total = 0;
//     for (const item of this.products) {
//       const product = await mongoose.model('Product').findById(item.productId);
//       if (product) {
//         total += product.priceAfterDiscount * item.quantity;
//       }
//     }
//     this.totalPrice = total;
//     next();
//   });

const cartModel = mongoose.model("Cart", cartSchema);
module.exports = cartModel;
