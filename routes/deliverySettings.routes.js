const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const deliverySettingsController = require("../controllers/deliverySettings.controller");

router.get('/', deliverySettingsController.getDeliveryFee)

router.post('/', verifyToken, isAdmin, deliverySettingsController.createDeliveryFee)

module.exports = router;
