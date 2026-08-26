const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const cartItemController = require('../controllers/cartItem.controller')


router.post('/', verifyToken,cartItemController.addCartItem)

router.put('/:id',verifyToken, cartItemController.updateCartItem)

router.delete('/:id', verifyToken, cartItemController.deleteCartItem)


module.exports = router;