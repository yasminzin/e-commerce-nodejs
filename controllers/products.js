const productsModel = require("../models/products");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const usersModel = require("../models/users");
const categoriesModel = require("../models/categories");

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { category, name, seller } = req.query;
  const productsQuery = {};
  if (name) {
    productsQuery.title = { $regex: name, $options: "i" };
  }
  if (category) {
    const categoryIdsDocuments = await categoriesModel
      .find({ name: { $regex: category, $options: "i" } })
      .select("_id");
    if (categoryIdsDocuments.length == 0) {
      return next(new AppError(404, "No categories found with that name"));
    }
    const categoryIds = categoryIdsDocuments.map((category) => category._id);
    productsQuery.categoryId = { $in: categoryIds };
  }
  if (seller) {
    const userIdsDocuments = await usersModel
      .find({
        $or: [
          { username: { $regex: seller, $options: "i" } },
          { firstName: { $regex: seller, $options: "i" } },
          { lastName: { $regex: seller, $options: "i" } },
        ],
      })
      .select("_id");
    if (userIdsDocuments.length == 0) {
      return next(new AppError(404, "No sellers found with that name"));
    }
    const userIds = userIdsDocuments.map((user) => user._id);
    productsQuery.userId = { $in: userIds };
  }
  const productsSearch = await productsModel
    .find(productsQuery)
    .populate("userId", "firstName lastName")
    .populate("categoryId", "name")
    .populate("brandId", "name");
  if (productsSearch.length == 0) {
    return next(new AppError(404, "No products found"));
  }
  return res.status(200).json({
    status: "success",
    results: productsSearch.length,
    data: productsSearch,
  });
});

exports.addProduct = catchAsync(async (req, res) => {
  const {
    title,
    description,
    price,
    categoryId,
    brandId,
    stock,
    appliedDiscount,
  } = req.body;
  const images = req.files
    ? req.files.map((file) => `/uploads/products/${file.filename}`)
    : [];

  const product = await productsModel.create({
    title,
    description,
    images,
    price,
    userId: req.id,
    categoryId,
    brandId,
    stock,
    appliedDiscount,
  });
  res.status(201).json({
    status: "success",
    data: product,
  });
});

exports.getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  //   if (id != req.id && req.role == "user") {
  //     return next(new AppError(403, "you can't perform this action"));
  //   }
  let product = await productsModel
    .findById(id)
    .populate("userId", "firstName lastName")
    .populate("categoryId", "name")
    .populate("brandId", "name");
  if (!product) {
    return next(new AppError(404, "product not found"));
  }
  res.status(200).json({ status: "success", message: product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const {
    title,
    description,
    price,
    categoryId,
    brandId,
    stock,
    appliedDiscount,
  } = req.body;
  const product = await productsModel.findById(req.params.id);
  if (!product) {
    return next(new AppError(404, "Product not found"));
  }
  if (product.userId.toString() !== req.id && req.role == "seller") {
    return next(new AppError(403, "you can't perform this action"));
  }

  product.title = title || product.title;
  product.description = description || product.description;
  product.price = price || product.price;
  product.categoryId = categoryId || product.categoryId;
  product.brandId = brandId || product.brandId;
  product.stock = stock || product.stock;
  product.appliedDiscount = appliedDiscount || product.appliedDiscount;

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(
      (file) => `/uploads/products/${file.filename}`
    );
    product.images = newImages;
  }
  await product.save();
  res.status(200).json({
    status: "success",
    message: "product updated successfully",
  });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await productsModel.findById(id);
  if (!product) {
    return next(new AppError(404, "product not found"));
  }
  if (product.userId.toString() !== req.id && req.role == "seller") {
    return next(new AppError(403, "you can't perform this action"));
  }

  await product.deleteOne();
  res
    .status(200)
    .json({ status: "success", message: "product deleted successfully" });
});
