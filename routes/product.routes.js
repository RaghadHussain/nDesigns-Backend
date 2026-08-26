const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const productController = require("../controllers/product.controller");
const variantController = require("../controllers/variant.controller");
const upload = require('../middleware/upload')


router.post("/", verifyToken, isAdmin, upload.array('images'), productController.createProduct);

router.get("/:id", validateObjectId, productController.getProductById);

router.put("/:id", verifyToken, isAdmin,upload.array('images'), validateObjectId, productController.updateProduct);

router.delete("/:id", verifyToken, isAdmin, validateObjectId, productController.deleteProduct);

router.get("/:id/variants", validateObjectId, variantController.getVariantByProduct);

router.post("/:id/variants", verifyToken, isAdmin, validateObjectId, variantController.createVariant);

module.exports = router;
