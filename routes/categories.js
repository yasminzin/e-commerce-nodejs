const express = require("express");
const router = express.Router();
const categoriesControllers = require("../controllers/categories");
const { validation } = require("../middlewares/validation");
const categorySchema = require("../validation/category.validation");
const { auth, blockRoles } = require("../middlewares/auth");
const multer = require("multer");

router.use(auth);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/categories");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "_" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, JPG, PNG, and GIF images are allowed'), false);
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

router.get("/", categoriesControllers.getAllCategories);

router.get("/:id", categoriesControllers.getCategoryById);

router.post(
  "/",
  blockRoles("user", "seller"),
  validation(categorySchema.createCategorySchema),
  upload.single("image"),
  categoriesControllers.addCategory
);

router.delete(
  "/:id",
  blockRoles("user", "seller"),
  categoriesControllers.deleteCategory
);

router.patch(
  "/:id",
  blockRoles("user", "seller"),
  validation(categorySchema.updateCategorySchema),
  upload.single("image"),
  categoriesControllers.updateCategory
);


module.exports = router;
