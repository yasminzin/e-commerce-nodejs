const categoriesModel = require("../models/categories");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const usersModel = require("../models/users");

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await categoriesModel
    .find()
    .populate("userId", "firstname lastname")
    .populate("brands", "name");
  if (categories.length == 0) {
    return next(new AppError(404, "No categories found"));
  }
  res.status(200).json({
    status: "success",
    data: categories,
  });
});

exports.addCategory = catchAsync(async (req, res) => {
  let newCategory = req.body;
  const image = req.file ? `/uploads/categories/${req.file.filename}` : null;
  let category = await categoriesModel.create({
    ...newCategory,
    image,
    userId: req.id,
  });
  res.status(201).json({ status: "success", data: category });
});

exports.getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  let category = await categoriesModel
    .findById(id)
    .populate("userId", "firstname lastname")
    .populate("brands", "name");
  if (!category) {
    return next(new AppError(404, "category not found"));
  }
  res.status(200).json({ status: "success", message: category });
});

exports.updateCategory = catchAsync(async (req, res) => {
  const { name, brands } = req.body;
  const image = req.file
    ? `/uploads/categories/${req.file.filename}`
    : undefined;
  const { id } = req.params;
  const category = await categoriesModel.findById(req.params.id);
  if (!category) {
    return next(new AppError(404, "Category not found"));
  }

  category.name = name || category.name;
  category.brands = brands || category.brands;
  if (image) category.image = image;

  await category.save();
  res.status(200).json({
    status: "success",
    message: "category updated successfully",
  });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await categoriesModel.findById(id);
  if (!category) {
    return next(new AppError(404, "category not found"));
  }
  await category.deleteOne();
  res
    .status(200)
    .json({ status: "success", message: "category deleted successfully" });
});
