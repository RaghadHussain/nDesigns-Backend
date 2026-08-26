const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const variantController = require("../controllers/variant.controller");

router.get("/:variantId", variantController.getVariantById);

router.put("/:variantId", verifyToken, isAdmin, variantController.updateVariant);

router.delete("/:variantId", verifyToken, isAdmin, variantController.deleteVariant);

module.exports = router;
