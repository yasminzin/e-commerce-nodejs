const cartModel = require("../models/cart");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const usersModel = require("../models/users");
const productsModel = require("../models/products");

// exports.getCart = catchAsync(async (req, res, next) => {
//   const userId = req.id;
//   const cart = await cartModel
//     .findOne({ userId })
//     .populate("products.productId");
//   if (!cart) {
//     return res
//       .status(200)
//       .json({ status: "success", data: { products: [], totalPrice: 0 } });
//   }
//   res.status(200).json({
//     status: "success",
//     data: cart,
//   });
// });

// exports.addToCart = catchAsync(async (req, res, next) => {
//   const userId = req.id;
//   const { productId } = req.body;
//   const product = await productsModel.findById(productId);
//   if (product.stock < 1) {
//     return next(new AppError(400, "Product is out of stock"));
//   }
//   const cart = await cartModel
//     .findOne({ userId: req.id })
//     .populate("products.productId");
//   if (!cart) {
//     cart = await cartModel.create({
//       userId: req.id,
//       products: [],
//       totalPrice: 0,
//     });
//   }
//   const existingProduct = cart.products.find(
//     (item) => item.productId.toString() === productId
//   );
//   if (existingProduct) {
//     existingProduct.quantity += 1;
//   } else {
//     cart.products.push({ productId, quantity: 1 });
//   }
//   cart.totalPrice += existingProduct.price;
//   await cart.save();
//   const populatedCart = await cartModel
//     .findOne({ userId: req.id })
//     .populate("products.productId");
//   res.status(200).json({ status: "success", data: populatedCart });
// });

// exports.removeFromCart = catchAsync(async (req, res, next) => {
//   const { productId } = req.params;
//   const cart = await cartModel.findOne({ userId: req.id }).populate('products.productId')
//   if (!cart) {
//     return next(new AppError(404, 'Nothing in the cart'));
//   }
// });
