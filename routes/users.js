const express = require("express");
const router = express.Router();
const usersControllers = require("../controllers/users");
const { validation } = require("../middlewares/validation");
const registerSchema = require("../validation/register.validation");
const loginSchema = require("../validation/login.validation");
const { auth, blockRoles } = require("../middlewares/auth");

// Users
router.get(
  "/",
  auth,
  blockRoles("user", "seller"),
  usersControllers.getAllUsers
);

router.post("/", validation(registerSchema.createUserSchema), usersControllers.addUser);

router.delete("/:id", auth, usersControllers.deleteUser);

router.patch("/:id", auth, usersControllers.updateUser);

router.post("/login", validation(loginSchema), usersControllers.login);

router.post("/forgot-password", usersControllers.forgotPassword);

router.post("/reset-password/:token", usersControllers.resetPassword);

router.get(
  "/:userId/products",
  blockRoles("user"),
  auth,
  usersControllers.getProductsOfUser
);

module.exports = router;