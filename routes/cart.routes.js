const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const cartController = require('../controllers/cart.controller')


router.get('/', verifyToken, cartController.getMyCart)

router.delete('/', verifyToken, cartController.clearMyCart)


module.exports = router;
