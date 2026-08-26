const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const productController = require("../controllers/product.controller");

router.post("/", verifyToken, isAdmin, productController.createProduct);

router.get("/:id", validateObjectId, productController.getProductById);

router.put("/:id", verifyToken, isAdmin, validateObjectId, productController.updateProduct);

router.delete("/:id", verifyToken, isAdmin, validateObjectId, productController.deleteProduct);

module.exports = router;
