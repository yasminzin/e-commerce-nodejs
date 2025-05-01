const express = require("express");
const router = express.Router();
const productsControllers = require("../controllers/products");
const { validation } = require("../middlewares/validation");
const productSchema = require("../validation/product.validation");
const { auth, blockRoles } = require("../middlewares/auth");
const multer = require("multer");

router.use(auth);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "_" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPEG, JPG, PNG, and GIF images are allowed"),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

router.get("/", productsControllers.getAllProducts);

router.get("/:id", productsControllers.getProductById);

router.post(
  "/",
  auth,
  blockRoles("user"),
  upload.array("images", 5),
  validation(productSchema.createProductSchema),
  productsControllers.addProduct
);

router.delete(
  "/:id",
  auth,
  blockRoles("user"),
  productsControllers.deleteProduct
);

router.patch(
  "/:id",
  auth,
  blockRoles("user"),
  upload.array("images", 5),
  validation(productSchema.updateProductSchema),
  productsControllers.updateProduct
);

module.exports = router;
