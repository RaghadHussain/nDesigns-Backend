const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const variantController = require("../controllers/variant.controller");

router.get("/products/:id/variants", validateObjectId, variantController.getVariantByProduct);

router.post("/products/:id/variants", verifyToken, isAdmin, validateObjectId, variantController.createVariant);

router.get("/variants/:variantId", variantController.getVariantById);

router.put("/variants/:variantId", verifyToken, isAdmin, variantController.updateVariant);

router.delete("/variants/:variantId", verifyToken, isAdmin, variantController.deleteVariant);

module.exports = router;
