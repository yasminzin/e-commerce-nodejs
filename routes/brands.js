const express = require("express");
const router = express.Router();
const brandsControllers = require("../controllers/brands");
const { validation } = require("../middlewares/validation");
const brandsSchema = require("../validation/brand.validation");
const { auth, blockRoles } = require("../middlewares/auth");
const multer = require("multer");
const AppError = require("../utils/appError");

router.use(auth);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/brands");
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

router.get("/", brandsControllers.getAllBrands);

router.get("/:id", brandsControllers.getBrandById);

router.post(
  "/",
  blockRoles("user", "seller"),
  validation(brandsSchema.createBrandSchema),
  upload.single("logo"),
  brandsControllers.addBrand
);

router.delete("/:id", blockRoles("user", "seller"), brandsControllers.deleteBrand);

router.patch(
  "/:id",
  blockRoles("user", "seller"),
  validation(brandsSchema.updateBrandSchema),
  upload.single("logo"),
  brandsControllers.updateBrand
);


module.exports = router;
