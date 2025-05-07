const cartModel = require("../models/cart");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const usersModel = require("../models/users");
const productsModel = require("../models/products");

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await cartModel
    .findOne({ userId: req.id })
    .populate("products.productId")
    .populate("userId", "email username")
  if (!cart) {
    return res
      .status(200)
      .json({ status: "success", data: { products: [], totalPrice: 0 } });
  }
  res.status(200).json({ status: "success", data: cart });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return next(new AppError(400, "ProductId is required"));
  }

  const product = await productsModel.findById(productId);
  if (!product) {
    return next(new AppError(404, "Product not found"));
  }
  if (product.stock < 1) {
    return next(new AppError(400, "Product is out of stock"));
  }

  let cart = await cartModel.findOne({ userId: req.id });
  if (!cart) {
    cart = await cartModel.create({ userId: req.id, products: [] });
  }

  const existingProduct = cart.products.find(
    (item) => item.productId.toString() === productId
  );
  if (existingProduct) {
    if (product.stock < existingProduct.quantity + 1) {
      return next(new AppError(400, "Insufficient stock"));
    }
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ productId, quantity: 1 });
  }

  // decrease the value of stock by 1 >> $inc with negative value
  await productsModel.findByIdAndUpdate(productId, { $inc: { stock: -1 } });

  await cart.save();
  const populatedCart = await cartModel
    .findOne({ userId: req.id })
    .populate("products.productId");
  res.status(200).json({ status: "success", data: populatedCart });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const cart = await cartModel.findOne({ userId: req.id });
  if (!cart) {
    return next(new AppError(404, "Cart not found"));
  }

  const productItem = cart.products.find(
    (item) => item.productId.toString() === productId
  );
  
  if (!productItem) {
    return next(new AppError(404, "Product not in cart"));
  }

  if (productItem.quantity > 1) {
    productItem.quantity -= 1;
    await productsModel.findByIdAndUpdate(productId, { $inc: { stock: 1 } });
  } else {
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    await productsModel.findByIdAndUpdate(productId, { $inc: { stock: 1 } });
  }

  await cart.save();
  const populatedCart = await cartModel
    .findOne({ userId: req.id })
    .populate("products.productId");
    
  res.status(200).json({ status: "success", data: populatedCart });
});