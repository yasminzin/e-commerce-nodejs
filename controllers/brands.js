const brandsModels = require("../models/brands");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const usersModel = require("../models/users");

exports.getAllBrands = catchAsync(async (req, res, next) => {
  const brands = await brandsModels
    .find()
    .populate("userId", "firstname lastname")
    .populate("categories");
  if (brands.length == 0) {
    return next(new AppError(404, "No brands found"));
  }
  res.status(200).json({
    status: "success",
    data: brands,
  });
});

exports.addBrand = catchAsync(async (req, res) => {
  let newBrand = req.body;
  const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;
  let brand = await brandsModels.create({
    ...newBrand,
    logo,
    userId: req.id,
  });
  res.status(201).json({ status: "success", data: brand });
});

exports.getBrandById = catchAsync(async (req, res) => {
  const { id } = req.params;
  let brand = await brandsModels
    .findById(id)
    .populate("userId", "firstname lastname")
    .populate("categories", "name");
  if (!brand) {
    return next(new AppError(404, "brand not found"));
  }
  res.status(200).json({ status: "success", message: brand });
});

exports.updateBrand = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, categories } = req.body;
  const logo = req.file ? `/uploads/brands/${req.file.filename}` : undefined;
  const brand = await brandsModels.findById(id);
  if (!brand) {
    return next(new AppError(404, "Brand not found"));
  }
  brand.name = name || brand.name;
  brand.categories = categories || brand.categories;
  if (logo) brand.logo = logo;

  await brand.save();
  res.status(200).json({
    status: "success",
    message: "brand updated successfully",
  });
});

exports.deleteBrand = catchAsync(async (req, res) => {
  const { id } = req.params;
  const brand = await brandsModels.findByIdAndDelete(id);
  if (!brand) {
    return next(new AppError(404, "brand not found"));
  }
  res
    .status(200)
    .json({ status: "success", message: "brand deleted successfully" });
});
