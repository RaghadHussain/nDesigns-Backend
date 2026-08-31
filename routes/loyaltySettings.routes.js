const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const loyaltySettings = require("../controllers/loyaltySetting.controller");

router.get('/', loyaltySettings.getLoyaltySetting)

router.post('/', verifyToken, isAdmin, loyaltySettings.addLoyaltySetting)

module.exports = router;
