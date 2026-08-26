const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const loyaltySettings = require("../controllers/loyaltySetting.controller");


router.post('/', verifyToken, isAdmin, loyaltySettings.addLoyaltySetting)

router.get('/:id', verifyToken, isAdmin, loyaltySettings.getLoyaltySetting)

router.put('/:id', verifyToken, isAdmin, loyaltySettings.updateLoyalitySetting)


module.exports = router;