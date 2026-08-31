const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const settingsController = require("../controllers/settings.controller");

router.get('/', settingsController.getSettings)

router.post('/', verifyToken, isAdmin, settingsController.createSettings)

module.exports = router;
