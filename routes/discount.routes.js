const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const isAdmin = require('../middleware/isAdmin')
const discountController = require('../controllers/discount.controller')

router.post('/', verifyToken, isAdmin, discountController.createDiscount)

router.post('/apply', verifyToken, discountController.applyDiscount)

module.exports = router
