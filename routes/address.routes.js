const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const addressController = require('../controllers/address.controller')

router.post('/', verifyToken, addressController.createNewAddress)

router.get('/', verifyToken, addressController.getUserAddress)

router.put('/:id', verifyToken, addressController.updateUserAddress)

module.exports = router;
