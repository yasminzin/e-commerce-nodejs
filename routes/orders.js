const express = require("express");
const router = express.Router();
const ordersControllers = require("../controllers/orders");
const { validation } = require("../middlewares/validation");
const { auth, blockRoles } = require("../middlewares/auth");
const { createOrderSchema } = require("../validation/order.validation");

router.use(auth);

router.post(
    "/",
    blockRoles("seller"),
    validation(createOrderSchema),
    ordersControllers.createOrder
  );
  
  router.get("/", blockRoles("seller"), ordersControllers.getUserOrders);
  
  router.get("/:id", blockRoles("seller"), ordersControllers.getOrderById);
  
  router.delete("/:id", blockRoles("seller"), ordersControllers.cancelOrder);

module.exports = router;