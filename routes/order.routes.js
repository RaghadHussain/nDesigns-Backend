const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const orderController = require("../controllers/order.controller");

router.post("/checkout", verifyToken, orderController.checkout);

router.get("/", verifyToken, orderController.getUserOrders);

router.get("/:id", verifyToken, validateObjectId, orderController.getOrderById);

router.patch("/:id/status", verifyToken, isAdmin, validateObjectId, orderController.updateOrderStatus);

router.patch("/:id/cancel", verifyToken, validateObjectId, orderController.cancelOrder);

module.exports = router;
