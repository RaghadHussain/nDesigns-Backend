const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const categoryController = require("../controllers/category.controller");

router.post("/", verifyToken, isAdmin, categoryController.createCategory);

router.get("/", categoryController.getAllCategories);

router.get("/:id", validateObjectId, categoryController.getCategoryById);

router.put("/:id", verifyToken, isAdmin, validateObjectId, categoryController.updateCategory);

router.delete("/:id", verifyToken, isAdmin, validateObjectId, categoryController.deleteCategory);

module.exports = router;
