const ordersModel = require("../models/orders");
const cartModel = require("../models/cart");
const productsModel = require("../models/products");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createOrder = catchAsync(async (req, res, next) => {
  const { paymentMethod, address } = req.body;

  if (!["cod", "online"].includes(paymentMethod)) {
    return next(new AppError(400, "Invalid payment method"));
  }

  const cart = await cartModel
    .findOne({ userId: req.id })
    .populate("products.productId");

  if (!cart || cart.products.length === 0) {
    return next(new AppError(400, "Cart is empty"));
  }

  const orderData = {
    user: req.id,
    products: cart.products.map((item) => ({
      product: item.productId._id,
      quantity: item.quantity,
    })),
    totalPrice: cart.totalPrice,
    paymentMethod,
  };

  if (paymentMethod === "cod") {
    if (!address || !address.street || !address.flatnumber) {
      return next(
        new AppError(
          400,
          "Address with street and flatnumber is required for COD orders"
        )
      );
    }
    orderData.address = address;
  } else if (address) {
    orderData.address = address;
  }

  const order = await ordersModel.create(orderData);

  cart.products = [];
  cart.totalPrice = 0;
  await cart.save();

  const populatedOrder = await ordersModel
    .findById(order._id)
    .populate("products.product")
    .populate("user", "firstName lastName email");

  res.status(201).json({
    status: "success",
    data: populatedOrder,
  });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await ordersModel
    .find({ user: req.id })
    .populate("products.product")
    .populate("user", "firstName lastName email");

  if (!orders || orders.length === 0) {
    return next(new AppError(404, "No orders found"));
  }

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: orders,
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await ordersModel
    .findOne({ _id: id, user: req.id })
    .populate("products.product")
    .populate("user", "firstName lastName email");

  if (!order) {
    return next(new AppError(404, "Order not found"));
  }

  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await ordersModel.findOne({ _id: id, user: req.id });
  if (!order) {
    return next(new AppError(404, "Order not found"));
  }

  if (order.status !== "pending") {
    return next(new AppError(400, "Only pending orders can be cancelled"));
  }

  order.status = "cancelled";
  await order.save();

  for (const item of order.products) {
    await productsModel.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  res.status(200).json({
    status: "success",
    message: "Order cancelled successfully",
  });
});
