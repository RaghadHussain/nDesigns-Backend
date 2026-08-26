const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const productController = require("../controllers/product.controller");
const variantController = require("../controllers/variant.controller");

router.post("/", verifyToken, isAdmin, productController.createProduct);

router.get("/", productController.getAllProducts);

router.get("/:id", validateObjectId, productController.getProductById);

router.put("/:id", verifyToken, isAdmin, validateObjectId, productController.updateProduct);

router.delete("/:id", verifyToken, isAdmin, validateObjectId, productController.deleteProduct);

router.get("/:id/variants", validateObjectId, variantController.getVariantByProduct);

router.post("/:id/variants", verifyToken, isAdmin, validateObjectId, variantController.createVariant);

module.exports = router;
