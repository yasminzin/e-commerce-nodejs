const express = require("express");
const router = express.Router();
const ordersControllers = require("../controllers/orders");
const { validation } = require("../middlewares/validation");
// const categorySchema = require("../validation/category.validation");
const { auth, blockRoles } = require("../middlewares/auth");
const multer = require("multer");

module.exports = router;