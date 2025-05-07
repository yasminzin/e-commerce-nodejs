const express = require("express");
const router = express.Router();
const cartControllers = require("../controllers/cart");
const { auth, blockRoles } = require("../middlewares/auth");

router.use(auth);

router.get("/", blockRoles("seller"), cartControllers.getCart);

router.post(
  "/",
  blockRoles("seller"),
  cartControllers.addToCart
);

// router.patch('/', blockRoles('seller'), cartControllers.updateCart);

router.delete(
  "/:productId",
  blockRoles("seller"),
  cartControllers.removeFromCart
);

module.exports = router;
